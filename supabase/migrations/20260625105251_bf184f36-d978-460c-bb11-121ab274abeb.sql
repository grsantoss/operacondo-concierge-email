
-- Enums
CREATE TYPE public.email_category AS ENUM ('manutencao','reclamacao','fornecedor','financeiro','assembleia','reserva','informativo','urgente');
CREATE TYPE public.email_priority AS ENUM ('alta','media','baixa');
CREATE TYPE public.email_status AS ENUM ('novo','em_analise','rascunho_pronto','respondido');
CREATE TYPE public.condo_role AS ENUM ('sindico','assistente');

-- condos
CREATE TABLE public.condos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cnpj text,
  sindico_nome text NOT NULL,
  contact_email text NOT NULL,
  mirror_address text UNIQUE,
  setup_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.condos TO authenticated;
GRANT ALL ON public.condos TO service_role;
ALTER TABLE public.condos ENABLE ROW LEVEL SECURITY;

-- condo_members
CREATE TABLE public.condo_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condo_id uuid NOT NULL REFERENCES public.condos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.condo_role NOT NULL DEFAULT 'sindico',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (condo_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.condo_members TO authenticated;
GRANT ALL ON public.condo_members TO service_role;
ALTER TABLE public.condo_members ENABLE ROW LEVEL SECURITY;

-- Access function (security definer, avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_condo_access(_user_id uuid, _condo_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.condo_members WHERE user_id = _user_id AND condo_id = _condo_id)
$$;

-- Policies: condos
CREATE POLICY "Members view their condos" ON public.condos FOR SELECT TO authenticated
  USING (public.has_condo_access(auth.uid(), id));
CREATE POLICY "Authenticated can create condo" ON public.condos FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Members update their condos" ON public.condos FOR UPDATE TO authenticated
  USING (public.has_condo_access(auth.uid(), id))
  WITH CHECK (public.has_condo_access(auth.uid(), id));

-- Policies: condo_members
CREATE POLICY "User sees own memberships" ON public.condo_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_condo_access(auth.uid(), condo_id));
CREATE POLICY "User creates own membership" ON public.condo_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- emails
CREATE TABLE public.emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condo_id uuid NOT NULL REFERENCES public.condos(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category public.email_category NOT NULL DEFAULT 'informativo',
  priority public.email_priority NOT NULL DEFAULT 'media',
  status public.email_status NOT NULL DEFAULT 'novo',
  ai_summary text,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emails TO authenticated;
GRANT ALL ON public.emails TO service_role;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
CREATE INDEX emails_condo_received_idx ON public.emails (condo_id, received_at DESC);

CREATE POLICY "Members manage emails" ON public.emails FOR ALL TO authenticated
  USING (public.has_condo_access(auth.uid(), condo_id))
  WITH CHECK (public.has_condo_access(auth.uid(), condo_id));

-- drafts
CREATE TABLE public.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id uuid NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  condo_id uuid NOT NULL REFERENCES public.condos(id) ON DELETE CASCADE,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drafts TO authenticated;
GRANT ALL ON public.drafts TO service_role;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
CREATE INDEX drafts_email_idx ON public.drafts (email_id);

CREATE POLICY "Members manage drafts" ON public.drafts FOR ALL TO authenticated
  USING (public.has_condo_access(auth.uid(), condo_id))
  WITH CHECK (public.has_condo_access(auth.uid(), condo_id));

-- Mirror address generator
CREATE OR REPLACE FUNCTION public.generate_mirror_address()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  base text;
  suffix text;
BEGIN
  IF NEW.mirror_address IS NULL THEN
    base := lower(regexp_replace(unaccent(coalesce(NEW.nome,'condo')), '[^a-zA-Z0-9]+', '-', 'g'));
    base := trim(both '-' from base);
    IF base = '' THEN base := 'condo'; END IF;
    suffix := substr(md5(gen_random_uuid()::text), 1, 6);
    NEW.mirror_address := base || '-' || suffix || '@inbox.condomail.com.br';
  END IF;
  RETURN NEW;
END;
$$;

-- unaccent may not be available; provide a fallback
CREATE OR REPLACE FUNCTION public.unaccent(text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$ SELECT $1 $$;

CREATE TRIGGER condos_set_mirror BEFORE INSERT ON public.condos
FOR EACH ROW EXECUTE FUNCTION public.generate_mirror_address();

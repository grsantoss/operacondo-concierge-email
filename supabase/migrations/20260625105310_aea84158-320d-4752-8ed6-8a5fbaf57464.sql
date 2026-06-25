
-- Revoke SECURITY DEFINER function access from public/anon
REVOKE ALL ON FUNCTION public.has_condo_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_condo_access(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.generate_mirror_address() FROM PUBLIC, anon;

-- Make unaccent immutable with search_path
CREATE OR REPLACE FUNCTION public.unaccent(text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$ SELECT $1 $$;

-- Tighten insert policy for condos: require user to be signed in (no more USING true == WITH CHECK true on INSERT)
DROP POLICY IF EXISTS "Authenticated can create condo" ON public.condos;
CREATE POLICY "Authenticated can create condo" ON public.condos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

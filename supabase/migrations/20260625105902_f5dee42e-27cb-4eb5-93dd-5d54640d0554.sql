
CREATE OR REPLACE FUNCTION public.create_condo_for_user(
  _nome text,
  _cnpj text,
  _sindico_nome text,
  _contact_email text
) RETURNS public.condos
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.condos;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  INSERT INTO public.condos (nome, cnpj, sindico_nome, contact_email)
  VALUES (_nome, _cnpj, _sindico_nome, _contact_email)
  RETURNING * INTO _row;

  INSERT INTO public.condo_members (condo_id, user_id, role)
  VALUES (_row.id, _uid, 'sindico');

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_condo_for_user(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_condo_for_user(text, text, text, text) TO authenticated;

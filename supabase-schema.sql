-- 1. Cria a tabela principal se não existir
CREATE TABLE IF NOT EXISTS public.crm_data (
  id text PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Desativa a Segurança a Nível de Linha (RLS) para permitir que a Vercel/Netlify leia e escreva livremente
ALTER TABLE public.crm_data DISABLE ROW LEVEL SECURITY;

-- 3. Tenta ativar o Realtime (ignora o erro se já estiver ativo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'crm_data'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_data';
  END IF;
END
$$;

-- 4. Cria o bucket de arquivos (ignora se já existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crm_files', 'crm_files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Garante que o bucket tenha acesso público sem restrições
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR ALL 
USING (bucket_id = 'crm_files');

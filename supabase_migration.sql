-- ============================================================
-- GPA ANGOLA CRM - SCRIPT DE MIGRAÇÃO INICIAL DO SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================

-- 1. Tabela Principal de Sincronização em Tempo Real (crm_data)
CREATE TABLE IF NOT EXISTS public.crm_data (
    id TEXT PRIMARY KEY DEFAULT 'gpa_angola_main_db',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e Permissões Públicas na crm_data
ALTER TABLE public.crm_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir Acesso Total crm_data" ON public.crm_data;
CREATE POLICY "Permitir Acesso Total crm_data" ON public.crm_data
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Habilitar Realtime para a tabela crm_data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'crm_data'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_data;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;


-- 2. Tabelas Relacionais Detalhadas (Usadas pelo backend e relatórios)

-- a) crm_meta
CREATE TABLE IF NOT EXISTS public.crm_meta (
    id TEXT PRIMARY KEY DEFAULT 'gpa_angola_main',
    crm_name TEXT DEFAULT 'GPA Angola CRM',
    tel_sede TEXT DEFAULT '+244 922 000 000',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.crm_meta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir Acesso Total crm_meta" ON public.crm_meta;
CREATE POLICY "Permitir Acesso Total crm_meta" ON public.crm_meta FOR ALL USING (true) WITH CHECK (true);

-- b) crm_deals (Propostas & Negócios)
CREATE TABLE IF NOT EXISTS public.crm_deals (
    id TEXT PRIMARY KEY,
    cliente_nome TEXT,
    titulo TEXT,
    valor NUMERIC DEFAULT 0,
    etapa TEXT DEFAULT 'proposta',
    comercial_id TEXT,
    comercial_nome TEXT,
    prioridade TEXT DEFAULT 'Normal',
    dias_aberto INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir Acesso Total crm_deals" ON public.crm_deals;
CREATE POLICY "Permitir Acesso Total crm_deals" ON public.crm_deals FOR ALL USING (true) WITH CHECK (true);

-- c) crm_clientes (Carteira de Clientes)
CREATE TABLE IF NOT EXISTS public.crm_clientes (
    id TEXT PRIMARY KEY,
    nome TEXT,
    empresa TEXT,
    nif TEXT,
    responsavel TEXT,
    email TEXT,
    telefone TEXT,
    provincia TEXT DEFAULT 'Luanda',
    status TEXT DEFAULT 'Ativo',
    historico_vendas NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.crm_clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir Acesso Total crm_clientes" ON public.crm_clientes;
CREATE POLICY "Permitir Acesso Total crm_clientes" ON public.crm_clientes FOR ALL USING (true) WITH CHECK (true);

-- d) crm_comerciais (Vendedores / Utilizadores)
CREATE TABLE IF NOT EXISTS public.crm_comerciais (
    id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    cargo TEXT,
    funcao TEXT,
    meta_semanal NUMERIC DEFAULT 0,
    vendas_semana NUMERIC DEFAULT 0,
    provincia TEXT DEFAULT 'Luanda',
    foto TEXT
);
ALTER TABLE public.crm_comerciais ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE public.crm_comerciais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir Acesso Total crm_comerciais" ON public.crm_comerciais;
CREATE POLICY "Permitir Acesso Total crm_comerciais" ON public.crm_comerciais FOR ALL USING (true) WITH CHECK (true);

-- e) crm_visitas (Registo de Visitas)
CREATE TABLE IF NOT EXISTS public.crm_visitas (
    id TEXT PRIMARY KEY,
    empresa TEXT,
    comercial_nome TEXT,
    data TEXT,
    hora TEXT,
    localizacao TEXT DEFAULT 'Luanda',
    resultado TEXT DEFAULT 'Aguardando',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.crm_visitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir Acesso Total crm_visitas" ON public.crm_visitas;
CREATE POLICY "Permitir Acesso Total crm_visitas" ON public.crm_visitas FOR ALL USING (true) WITH CHECK (true);


-- 3. Configuração de Armazenamento de Arquivos (Storage Bucket 'crm_files')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crm_files', 'crm_files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permissões para o Bucket crm_files
DROP POLICY IF EXISTS "Acesso público leitura crm_files" ON storage.objects;
CREATE POLICY "Acesso público leitura crm_files" ON storage.objects 
    FOR SELECT USING (bucket_id = 'crm_files');

DROP POLICY IF EXISTS "Acesso público escrita crm_files" ON storage.objects;
CREATE POLICY "Acesso público escrita crm_files" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'crm_files');

DROP POLICY IF EXISTS "Acesso público atualização crm_files" ON storage.objects;
CREATE POLICY "Acesso público atualização crm_files" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'crm_files');

DROP POLICY IF EXISTS "Acesso público eliminação crm_files" ON storage.objects;
CREATE POLICY "Acesso público eliminação crm_files" ON storage.objects 
    FOR DELETE USING (bucket_id = 'crm_files');

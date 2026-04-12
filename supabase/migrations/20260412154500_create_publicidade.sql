-- 1. Tabela master da Publicidade (campanha)
CREATE TABLE IF NOT EXISTS public.empresa_pubs (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    link_destino TEXT NOT NULL,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    orcamento_real DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.empresa_pubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicidades visíveis para todos" ON public.empresa_pubs FOR SELECT USING (true);
CREATE POLICY "Admins controlam publicidades" ON public.empresa_pubs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);

-- 2. Tabela filha de Imagens/Formatos
CREATE TABLE IF NOT EXISTS public.empresa_pub_imagens (
    id SERIAL PRIMARY KEY,
    pub_id INTEGER NOT NULL REFERENCES public.empresa_pubs(id) ON DELETE CASCADE,
    formato TEXT NOT NULL, -- 'rectangle', 'leaderboard', 'native', 'billboard'
    arquivo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.empresa_pub_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imagens visíveis para todos" ON public.empresa_pub_imagens FOR SELECT USING (true);
CREATE POLICY "Admins controlam imagens pubs" ON public.empresa_pub_imagens FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);

-- 3. Criar Bucket do Storage para as publicidades
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'publicidades',
    'publicidades',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Políticas do Storage
CREATE POLICY "Publicidades assets sao publicos" ON storage.objects FOR SELECT USING (bucket_id = 'publicidades');
CREATE POLICY "Admins gerenciam publicidades assets insert" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'publicidades' 
    AND EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);
CREATE POLICY "Admins gerenciam publicidades assets update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'publicidades' 
    AND EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);
CREATE POLICY "Admins gerenciam publicidades assets delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'publicidades' 
    AND EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);

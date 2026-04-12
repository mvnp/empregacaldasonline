CREATE TABLE IF NOT EXISTS public.portal_config (
    id SERIAL PRIMARY KEY,
    chave TEXT UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.portal_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica config" ON public.portal_config FOR SELECT USING (true);
CREATE POLICY "Admins alteram config" ON public.portal_config FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.auth_id = auth.uid() AND users.tipo = 'admin')
);

-- Inserir valor padrao para publicidade
INSERT INTO public.portal_config (chave, valor) VALUES ('publicidade_global', '{"ativo": true}') ON CONFLICT (chave) DO NOTHING;

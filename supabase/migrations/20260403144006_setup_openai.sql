CREATE TABLE IF NOT EXISTS public.openai_config (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    openai_token TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'gpt-4o',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissões de Segurança (RLS)
ALTER TABLE public.openai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admin pode ler a configuração da OpenAI" 
ON public.openai_config
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admin pode inserir e atualizar" 
ON public.openai_config
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

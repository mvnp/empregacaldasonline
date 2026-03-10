CREATE TABLE IF NOT EXISTS public._estabelecimentos_favoritos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    estabelecimento_id integer NOT NULL REFERENCES public._estabelecimentos(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, estabelecimento_id)
);

ALTER TABLE public._estabelecimentos_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus próprios favoritos estabelecimentos"
    ON public._estabelecimentos_favoritos
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem seus próprios favoritos estabelecimentos"
    ON public._estabelecimentos_favoritos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios favoritos estabelecimentos"
    ON public._estabelecimentos_favoritos
    FOR DELETE
    USING (auth.uid() = user_id);

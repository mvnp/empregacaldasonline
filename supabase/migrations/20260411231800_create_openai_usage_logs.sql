CREATE TABLE IF NOT EXISTS openai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE openai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs" ON openai_usage_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND tipo = 'admin'
        )
    );

CREATE POLICY "Usuarios podem ver seus proprios logs" ON openai_usage_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

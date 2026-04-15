-- Migration: create vaga_notifications
CREATE TABLE IF NOT EXISTS vaga_notifications (
    id         BIGSERIAL PRIMARY KEY,
    vaga_id    BIGINT NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
    motivo     VARCHAR(100) NOT NULL,
    relato     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca por vaga
CREATE INDEX IF NOT EXISTS idx_vaga_notifications_vaga_id ON vaga_notifications(vaga_id);

-- RLS: habilitar sem restrição de leitura (só admins precisam ler)
ALTER TABLE vaga_notifications ENABLE ROW LEVEL SECURITY;

-- Qualquer um (incluindo anônimo) pode inserir
CREATE POLICY "anyone can insert vaga_notifications"
ON vaga_notifications
FOR INSERT
TO public
WITH CHECK (true);

-- Só service_role / admins lêem
CREATE POLICY "service_role can select vaga_notifications"
ON vaga_notifications
FOR SELECT
TO service_role
USING (true);

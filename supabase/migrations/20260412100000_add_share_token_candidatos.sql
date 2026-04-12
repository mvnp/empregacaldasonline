-- Adiciona share_token único na tabela candidatos para URLs públicas seguras
ALTER TABLE candidatos
    ADD COLUMN IF NOT EXISTS share_token uuid NOT NULL DEFAULT gen_random_uuid();

-- Garante unicidade
CREATE UNIQUE INDEX IF NOT EXISTS candidatos_share_token_idx ON candidatos (share_token);

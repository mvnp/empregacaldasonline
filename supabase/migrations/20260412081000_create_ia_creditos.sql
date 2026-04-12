-- Remove a coluna anterior que havíamos criado na users (opcional, mas bom pra limpeza)
ALTER TABLE users DROP COLUMN IF EXISTS creditos_ia;

-- Cria uma tabela separada para os créditos de IA
CREATE TABLE IF NOT EXISTS ia_creditos (
    user_id bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    creditos int4 NOT NULL DEFAULT 5,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

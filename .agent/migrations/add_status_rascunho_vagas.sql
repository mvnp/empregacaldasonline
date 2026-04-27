-- Migration: Adicionar status 'rascunho' à tabela vagas
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor)
-- Data: 2026-04-27

-- 1. Verifica o tipo atual da coluna status e adiciona 'rascunho' se for um CHECK constraint
-- (Supabase geralmente usa TEXT sem CHECK constraint, mas se houver um enum ou check, precisamos ajustar)

-- Opção A: Se a coluna status usa CHECK constraint, recrie-a:
-- ALTER TABLE vagas DROP CONSTRAINT IF EXISTS vagas_status_check;
-- ALTER TABLE vagas ADD CONSTRAINT vagas_status_check
--   CHECK (status IN ('ativa', 'pausada', 'expirada', 'rascunho'));

-- Opção B: Se não houver constraint (mais comum no Supabase com TEXT), apenas teste inserindo:
-- Nenhuma ação necessária no schema, pois é TEXT livre.

-- 2. (OPCIONAL) Índice para buscas por status:
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);

-- 3. (SEGURANÇA) Garante que vagas com status 'rascunho' não aparecem no portal.
-- Isso já é tratado via código (listarVagasPublicas e buscarVagaPublica usam .eq('status', 'ativa')).
-- Se quiser adicionar RLS:
-- ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
-- (ver políticas existentes antes de alterar)

-- Verificar coluna status atual:
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vagas' AND column_name = 'status';

-- Verificar constraints existentes:
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'vagas'::regclass AND contype = 'c';

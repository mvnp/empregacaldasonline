-- Migration para remover o bloqueio UNIQUE no user_id da tabela candidatos
-- Isso permite que um único usuário possa ter múltiplos currículos (perfis) na plataforma publicando para diferentes vagas/cargos.

ALTER TABLE public.candidatos DROP CONSTRAINT IF EXISTS candidatos_user_unique;

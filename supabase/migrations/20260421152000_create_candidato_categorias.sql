-- =============================================
-- Migration: Change Candidato Categorias (From 1:N to N:M)
-- =============================================

-- 1. Remove a coluna categoria_id da tabela candidatos (e seu índice associado se existir)
DROP INDEX IF EXISTS public.idx_candidatos_categoria;
ALTER TABLE public.candidatos DROP COLUMN IF EXISTS categoria_id;

-- 2. Cria a nova tabela auxiliar candidato_categorias para suportar múltiplas categorias
CREATE TABLE public.candidato_categorias (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    categoria_id    BIGINT NOT NULL REFERENCES public.vaga_categorias(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices e Constraint Única
CREATE INDEX idx_candidato_categorias_candidato ON public.candidato_categorias(candidato_id);
CREATE INDEX idx_candidato_categorias_categoria ON public.candidato_categorias(categoria_id);
-- Evita a mesma categoria duplicada para o mesmo candidato
ALTER TABLE public.candidato_categorias ADD CONSTRAINT uc_candidato_categoria UNIQUE (candidato_id, categoria_id);

-- 4. RLS (Row Level Security)
ALTER TABLE public.candidato_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidato_categorias_select" ON public.candidato_categorias FOR SELECT USING (true);
CREATE POLICY "candidato_categorias_insert" ON public.candidato_categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "candidato_categorias_delete" ON public.candidato_categorias FOR DELETE USING (true);

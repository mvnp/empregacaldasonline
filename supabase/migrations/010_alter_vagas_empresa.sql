-- =============================================
-- Alter: Inserir empresa_id em public.vagas
-- =============================================

ALTER TABLE public.vagas
ADD COLUMN empresa_id BIGINT REFERENCES public.empresas(id) ON DELETE SET NULL;

CREATE INDEX idx_vagas_empresa_id ON public.vagas(empresa_id);

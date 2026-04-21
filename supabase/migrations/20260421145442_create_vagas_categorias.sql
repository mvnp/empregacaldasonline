-- =============================================
-- Migration: Create vagas_categorias table
-- =============================================

CREATE TABLE public.vagas_categorias (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descricao   TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.vagas_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vagas_categorias_select_public" ON public.vagas_categorias FOR SELECT USING (true);
CREATE POLICY "vagas_categorias_insert_admin" ON public.vagas_categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "vagas_categorias_update_admin" ON public.vagas_categorias FOR UPDATE USING (true);
CREATE POLICY "vagas_categorias_delete_admin" ON public.vagas_categorias FOR DELETE USING (true);

-- =============================================
-- Alter tables
-- =============================================

ALTER TABLE public.vagas
ADD COLUMN categoria_id BIGINT REFERENCES public.vagas_categorias(id) ON DELETE SET NULL;

CREATE INDEX idx_vagas_categoria ON public.vagas(categoria_id);

ALTER TABLE public.candidatos
ADD COLUMN categoria_id BIGINT REFERENCES public.vagas_categorias(id) ON DELETE SET NULL;

CREATE INDEX idx_candidatos_categoria ON public.candidatos(categoria_id);

-- =============================================
-- Insert initial categories
-- =============================================

INSERT INTO public.vagas_categorias (descricao, slug) VALUES
('Hotelaria e Turismo', 'hotelaria-e-turismo'),
('Alimentação e Gastronomia', 'alimentacao-e-gastronomia'),
('Administrativo e Escritório', 'administrativo-e-escritorio'),
('Vendas e Atendimento', 'vendas-e-atendimento'),
('Serviços Gerais e Limpeza', 'servicos-gerais-e-limpeza'),
('Manutenção e Reparos', 'manutencao-e-reparos'),
('Recreação e Lazer', 'recreacao-e-lazer'),
('Saúde e Bem-estar', 'saude-e-bem-estar'),
('Tecnologia e TI', 'tecnologia-e-ti')
ON CONFLICT (slug) DO NOTHING;

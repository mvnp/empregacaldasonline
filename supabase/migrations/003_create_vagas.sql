-- =============================================
-- Tabelas: vagas + tabelas auxiliares
-- =============================================

-- Tabela principal de vagas
CREATE TABLE public.vagas (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Dados principais
    titulo          TEXT NOT NULL,
    descricao       TEXT,
    empresa         TEXT NOT NULL,
    local           TEXT,
    modalidade      TEXT NOT NULL CHECK (modalidade IN ('remoto', 'hibrido', 'presencial')),
    tipo_contrato   TEXT CHECK (tipo_contrato IN ('clt', 'pj', 'estagio', 'temporario', 'freelancer')),
    nivel           TEXT CHECK (nivel IN ('estagio', 'junior', 'pleno', 'senior', 'gerente', 'diretor')),

    -- Remuneração
    salario_min     NUMERIC(10,2),
    salario_max     NUMERIC(10,2),
    mostrar_salario BOOLEAN NOT NULL DEFAULT true,

    -- Contato / link
    email_contato   TEXT,
    link_externo    TEXT,

    -- Status e controle
    status          TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'expirada', 'rascunho')),
    destaque        BOOLEAN NOT NULL DEFAULT false,
    criado_por      BIGINT REFERENCES public.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Tabelas auxiliares (1:N) ───

CREATE TABLE public.vaga_responsabilidades (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id  BIGINT NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    texto    TEXT NOT NULL,
    ordem    INT NOT NULL DEFAULT 0
);

CREATE TABLE public.vaga_requisitos (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id  BIGINT NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    texto    TEXT NOT NULL,
    ordem    INT NOT NULL DEFAULT 0
);

CREATE TABLE public.vaga_diferenciais (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id  BIGINT NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    texto    TEXT NOT NULL,
    ordem    INT NOT NULL DEFAULT 0
);

CREATE TABLE public.vaga_beneficios (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vaga_id  BIGINT NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    texto    TEXT NOT NULL,
    ordem    INT NOT NULL DEFAULT 0
);

-- ─── Índices ───
CREATE INDEX idx_vagas_status ON public.vagas(status);
CREATE INDEX idx_vagas_empresa ON public.vagas(empresa);
CREATE INDEX idx_vagas_criado_por ON public.vagas(criado_por);
CREATE INDEX idx_vagas_created_at ON public.vagas(created_at DESC);

CREATE INDEX idx_vaga_responsabilidades_vaga ON public.vaga_responsabilidades(vaga_id);
CREATE INDEX idx_vaga_requisitos_vaga ON public.vaga_requisitos(vaga_id);
CREATE INDEX idx_vaga_diferenciais_vaga ON public.vaga_diferenciais(vaga_id);
CREATE INDEX idx_vaga_beneficios_vaga ON public.vaga_beneficios(vaga_id);

-- ─── RLS ───
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaga_responsabilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaga_requisitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaga_diferenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaga_beneficios ENABLE ROW LEVEL SECURITY;

-- Vagas: leitura pública (todas as vagas ativas)
CREATE POLICY "vagas_select_public" ON public.vagas FOR SELECT
    USING (status = 'ativa');

-- Vagas: criador pode ver todas as suas
CREATE POLICY "vagas_select_own" ON public.vagas FOR SELECT
    USING (criado_por = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Vagas: criador pode editar
CREATE POLICY "vagas_update_own" ON public.vagas FOR UPDATE
    USING (criado_por = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Vagas: inserção (via service_role)
CREATE POLICY "vagas_insert" ON public.vagas FOR INSERT
    WITH CHECK (true);

-- Tabelas auxiliares: leitura pública (vinculada à vaga)
CREATE POLICY "aux_select_public" ON public.vaga_responsabilidades FOR SELECT USING (true);
CREATE POLICY "aux_select_public" ON public.vaga_requisitos FOR SELECT USING (true);
CREATE POLICY "aux_select_public" ON public.vaga_diferenciais FOR SELECT USING (true);
CREATE POLICY "aux_select_public" ON public.vaga_beneficios FOR SELECT USING (true);

-- Tabelas auxiliares: inserção (via service_role)
CREATE POLICY "aux_insert" ON public.vaga_responsabilidades FOR INSERT WITH CHECK (true);
CREATE POLICY "aux_insert" ON public.vaga_requisitos FOR INSERT WITH CHECK (true);
CREATE POLICY "aux_insert" ON public.vaga_diferenciais FOR INSERT WITH CHECK (true);
CREATE POLICY "aux_insert" ON public.vaga_beneficios FOR INSERT WITH CHECK (true);

-- Tabelas auxiliares: delete cascade já cuida, mas permitir delete direto
CREATE POLICY "aux_delete" ON public.vaga_responsabilidades FOR DELETE USING (true);
CREATE POLICY "aux_delete" ON public.vaga_requisitos FOR DELETE USING (true);
CREATE POLICY "aux_delete" ON public.vaga_diferenciais FOR DELETE USING (true);
CREATE POLICY "aux_delete" ON public.vaga_beneficios FOR DELETE USING (true);

-- ─── Trigger updated_at ───
CREATE TRIGGER trigger_vagas_updated_at
    BEFORE UPDATE ON public.vagas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Tabelas: empresas + tabelas auxiliares
-- =============================================

CREATE TABLE public.empresas (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Dados Básicos
    nome_fantasia   TEXT NOT NULL,
    razao_social    TEXT,
    cnpj            TEXT,
    setor           TEXT,
    tamanho_empresa TEXT,
    fundacao_ano    INTEGER,

    -- Sobre
    descricao       TEXT,
    
    -- Localização
    local           TEXT,
    logradouro      TEXT,
    numero          TEXT,
    complemento     TEXT,
    bairro          TEXT,
    cidade          TEXT,
    estado          TEXT,
    cep             TEXT,

    -- Contato e Links
    email_contato   TEXT,
    telefone        TEXT,
    whatsapp        TEXT,
    website         TEXT,
    linkedin        TEXT,

    -- Gerenciamento
    plano           TEXT NOT NULL DEFAULT 'Gratuito',
    status          TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'bloqueada')),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT empresas_user_unique UNIQUE (user_id)
);

-- ─── Tabelas auxiliares (1:N) ───

CREATE TABLE public.empresa_tecnologias (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id    BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    texto         TEXT NOT NULL,
    ordem         INT NOT NULL DEFAULT 0
);

CREATE TABLE public.empresa_beneficios (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id    BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    texto         TEXT NOT NULL,
    ordem         INT NOT NULL DEFAULT 0
);

-- ─── Índices ───
CREATE INDEX idx_empresas_user_id ON public.empresas(user_id);
CREATE INDEX idx_empresas_status ON public.empresas(status);
CREATE INDEX idx_empresas_local ON public.empresas(local);
CREATE INDEX idx_empresas_cnpj ON public.empresas(cnpj);

CREATE INDEX idx_empresa_tecs ON public.empresa_tecnologias(empresa_id);
CREATE INDEX idx_empresa_bens ON public.empresa_beneficios(empresa_id);

-- ─── RLS ───
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_tecnologias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_beneficios ENABLE ROW LEVEL SECURITY;

-- Select All para leitura pública das empresas ativas (necessário para views de vagas)
CREATE POLICY "empresas_select_all" ON public.empresas FOR SELECT USING (true);
CREATE POLICY "empresa_tecnologias_select" ON public.empresa_tecnologias FOR SELECT USING (true);
CREATE POLICY "empresa_beneficios_select" ON public.empresa_beneficios FOR SELECT USING (true);

-- Empregador pode ver e editar sua própria empresa
CREATE POLICY "empresas_update_own" ON public.empresas FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "empresas_insert" ON public.empresas FOR INSERT WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER trigger_empresas_updated_at
    BEFORE UPDATE ON public.empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

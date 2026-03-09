-- =============================================
-- Tabelas: candidatos + tabelas auxiliares
-- =============================================

-- Tabela principal de candidatos
CREATE TABLE public.candidatos (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Dados pessoais
    nome_completo   TEXT NOT NULL,
    cargo_desejado  TEXT,
    resumo          TEXT,
    local           TEXT,
    data_nascimento DATE,

    -- Contato
    email           TEXT NOT NULL,
    telefone        TEXT,
    whatsapp        TEXT,

    -- Links
    linkedin        TEXT,
    portfolio       TEXT,
    github          TEXT,

    -- Status
    disponivel      BOOLEAN NOT NULL DEFAULT true,
    pretensao_min   NUMERIC(10,2),
    pretensao_max   NUMERIC(10,2),
    status          TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT candidatos_user_unique UNIQUE (user_id)
);

-- ─── Tabelas auxiliares (1:N) ───

CREATE TABLE public.candidato_experiencias (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    cargo           TEXT NOT NULL,
    empresa         TEXT NOT NULL,
    descricao       TEXT,
    data_inicio     DATE NOT NULL,
    data_fim        DATE,
    em_andamento    BOOLEAN NOT NULL DEFAULT false,
    ordem           INT NOT NULL DEFAULT 0
);

CREATE TABLE public.candidato_formacoes (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    curso           TEXT NOT NULL,
    instituicao     TEXT NOT NULL,
    grau            TEXT,
    data_inicio     DATE NOT NULL,
    data_fim        DATE,
    em_andamento    BOOLEAN NOT NULL DEFAULT false,
    ordem           INT NOT NULL DEFAULT 0
);

CREATE TABLE public.candidato_habilidades (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    texto           TEXT NOT NULL,
    ordem           INT NOT NULL DEFAULT 0
);

CREATE TABLE public.candidato_idiomas (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    idioma          TEXT NOT NULL,
    nivel           TEXT CHECK (nivel IN ('basico', 'intermediario', 'avancado', 'fluente', 'nativo')),
    ordem           INT NOT NULL DEFAULT 0
);

CREATE TABLE public.candidato_documentos (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id    BIGINT NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
    titulo          TEXT NOT NULL,
    tipo            TEXT,
    url             TEXT,
    ordem           INT NOT NULL DEFAULT 0
);

-- ─── Índices ───
CREATE INDEX idx_candidatos_user_id ON public.candidatos(user_id);
CREATE INDEX idx_candidatos_status ON public.candidatos(status);
CREATE INDEX idx_candidatos_local ON public.candidatos(local);

CREATE INDEX idx_cand_experiencias ON public.candidato_experiencias(candidato_id);
CREATE INDEX idx_cand_formacoes ON public.candidato_formacoes(candidato_id);
CREATE INDEX idx_cand_habilidades ON public.candidato_habilidades(candidato_id);
CREATE INDEX idx_cand_idiomas ON public.candidato_idiomas(candidato_id);
CREATE INDEX idx_cand_documentos ON public.candidato_documentos(candidato_id);

-- ─── RLS ───
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_formacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_habilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_idiomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_documentos ENABLE ROW LEVEL SECURITY;

-- Candidato pode ver seu próprio perfil
CREATE POLICY "candidatos_select_own" ON public.candidatos FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "candidatos_update_own" ON public.candidatos FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Inserção e leitura pública via service_role / admin
CREATE POLICY "candidatos_insert" ON public.candidatos FOR INSERT WITH CHECK (true);
CREATE POLICY "candidatos_select_all" ON public.candidatos FOR SELECT USING (true);

-- Tabelas auxiliares: leitura e escrita
CREATE POLICY "cand_aux_select" ON public.candidato_experiencias FOR SELECT USING (true);
CREATE POLICY "cand_aux_insert" ON public.candidato_experiencias FOR INSERT WITH CHECK (true);
CREATE POLICY "cand_aux_delete" ON public.candidato_experiencias FOR DELETE USING (true);

CREATE POLICY "cand_aux_select" ON public.candidato_formacoes FOR SELECT USING (true);
CREATE POLICY "cand_aux_insert" ON public.candidato_formacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "cand_aux_delete" ON public.candidato_formacoes FOR DELETE USING (true);

CREATE POLICY "cand_aux_select" ON public.candidato_habilidades FOR SELECT USING (true);
CREATE POLICY "cand_aux_insert" ON public.candidato_habilidades FOR INSERT WITH CHECK (true);
CREATE POLICY "cand_aux_delete" ON public.candidato_habilidades FOR DELETE USING (true);

CREATE POLICY "cand_aux_select" ON public.candidato_idiomas FOR SELECT USING (true);
CREATE POLICY "cand_aux_insert" ON public.candidato_idiomas FOR INSERT WITH CHECK (true);
CREATE POLICY "cand_aux_delete" ON public.candidato_idiomas FOR DELETE USING (true);

CREATE POLICY "cand_aux_select" ON public.candidato_documentos FOR SELECT USING (true);
CREATE POLICY "cand_aux_insert" ON public.candidato_documentos FOR INSERT WITH CHECK (true);
CREATE POLICY "cand_aux_delete" ON public.candidato_documentos FOR DELETE USING (true);

-- ─── Trigger updated_at ───
CREATE TRIGGER trigger_candidatos_updated_at
    BEFORE UPDATE ON public.candidatos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

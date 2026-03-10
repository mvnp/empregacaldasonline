-- =============================================
-- Tabela: _estabelecimentos
-- Campos extraídos do header do arquivo CSV
-- _data/data-1773152782240.csv
-- Todos os campos com tipo TEXT conforme solicitado
-- =============================================

CREATE TABLE IF NOT EXISTS public._estabelecimentos (
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cnpj_basico                 TEXT,
    cnpj_ordem                  TEXT,
    cnpj_dv                     TEXT,
    identificador_matriz_filial TEXT,
    nome_fantasia               TEXT,
    situacao_cadastral          TEXT,
    data_situacao_cadastral     TEXT,
    motivo_situacao_cadastral   TEXT,
    nome_cidade_exterior        TEXT,
    pais                        TEXT,
    data_inicio_atividade       TEXT,
    cnae_fiscal_principal       TEXT,
    cnae_fiscal_secundaria      TEXT,
    tipo_logradouro             TEXT,
    logradouro                  TEXT,
    numero                      TEXT,
    complemento                 TEXT,
    bairro                      TEXT,
    cep                         TEXT,
    uf                          TEXT,
    municipio                   TEXT,
    ddd_1                       TEXT,
    telefone_1                  TEXT,
    ddd_2                       TEXT,
    telefone_2                  TEXT,
    ddd_fax                     TEXT,
    fax                         TEXT,
    correio_eletronico          TEXT,
    situacao_especial           TEXT,
    data_situacao_especial      TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para buscas comuns
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cnpj_basico   ON public._estabelecimentos(cnpj_basico);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_nome_fantasia  ON public._estabelecimentos(nome_fantasia);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_uf             ON public._estabelecimentos(uf);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_municipio      ON public._estabelecimentos(municipio);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cnae_principal ON public._estabelecimentos(cnae_fiscal_principal);

-- RLS
ALTER TABLE public._estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "estabelecimentos_select_public" ON public._estabelecimentos
    FOR SELECT USING (true);

-- Inserção irrestrita (via service_role na importação)
CREATE POLICY "estabelecimentos_insert" ON public._estabelecimentos
    FOR INSERT WITH CHECK (true);

-- Deleção irrestrita (para truncate/reimportação)
CREATE POLICY "estabelecimentos_delete" ON public._estabelecimentos
    FOR DELETE USING (true);

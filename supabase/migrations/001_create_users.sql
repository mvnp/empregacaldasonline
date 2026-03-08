-- =============================================
-- Tabela: users
-- Vinculada ao Supabase Auth via auth_id (uuid)
-- =============================================

-- Criar a tabela users
CREATE TABLE public.users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tipo de usuário
    tipo            TEXT NOT NULL CHECK (tipo IN ('candidato', 'empregador', 'admin')),

    -- Dados pessoais (comuns a todos)
    nome            TEXT NOT NULL,
    sobrenome       TEXT,
    email           TEXT NOT NULL,
    telefone        TEXT,
    avatar_url      TEXT,

    -- Dados específicos do candidato
    data_nascimento DATE,
    area_interesse  TEXT,

    -- Dados específicos da empresa/empregador
    razao_social    TEXT,
    cnpj            TEXT,
    setor           TEXT,
    tamanho_empresa TEXT,
    responsavel_rh  TEXT,

    -- Status e controle
    status          TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Índices ───
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_tipo ON public.users(tipo);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);

-- ─── RLS (Row Level Security) ───
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Usuário pode ler seu próprio registro
CREATE POLICY "users_select_own"
    ON public.users FOR SELECT
    USING (auth.uid() = auth_id);

-- Usuário pode atualizar seu próprio registro
CREATE POLICY "users_update_own"
    ON public.users FOR UPDATE
    USING (auth.uid() = auth_id);

-- Permitir inserção durante cadastro (via service_role ou trigger)
CREATE POLICY "users_insert_own"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = auth_id);

-- Admin pode ver todos
CREATE POLICY "admin_select_all"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.auth_id = auth.uid() AND u.tipo = 'admin'
        )
    );

-- ─── Trigger para updated_at ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

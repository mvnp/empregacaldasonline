-- =============================================================================
-- Migration: 20260415095300_create_pub_clicks.sql
-- Objetivo: Sistema de contagem de clicks em publicidades
--
-- Estrutura:
--   pub_click_logs   → log bruto de cada clique único (deduplica por IP/1h)
--   pub_click_stats  → contador agregado por (pub_id, formato)
--
-- Regra de negócio:
--   • O mesmo IP só conta 1 click por pub_id+formato dentro de 1 hora
--   • Cada par (pub_id, formato) tem exatamente 1 linha em pub_click_stats
--   • Se duas pub_ids diferentes usam o mesmo formato, são dois registros
--     distintos em pub_click_stats (um por pub_id)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tabela de LOGS brutos de cliques
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pub_click_logs (
    id          BIGSERIAL PRIMARY KEY,
    empresa_id  INTEGER  NOT NULL REFERENCES public.empresas(id)    ON DELETE CASCADE,
    pub_id      INTEGER  NOT NULL REFERENCES public.empresa_pubs(id) ON DELETE CASCADE,
    formato     TEXT     NOT NULL,           -- ex: '728x90', '300x250', '970x250' …
    page        TEXT     NOT NULL,           -- URL completa onde o clique ocorreu
    ip          TEXT     NOT NULL,           -- IPv4 ou IPv6 do visitante
    user_id     BIGINT   REFERENCES public.users(id) ON DELETE SET NULL, -- NULL se não logado
    clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_pub_click_logs_pub_id     ON public.pub_click_logs (pub_id);
CREATE INDEX IF NOT EXISTS idx_pub_click_logs_empresa_id ON public.pub_click_logs (empresa_id);
CREATE INDEX IF NOT EXISTS idx_pub_click_logs_ip_pub_fmt ON public.pub_click_logs (ip, pub_id, formato, clicked_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Tabela de CONTADOR agregado por (pub_id, formato)
--    UNIQUE(pub_id, formato) garante 1 linha por combinação
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pub_click_stats (
    id          BIGSERIAL PRIMARY KEY,
    empresa_id  INTEGER  NOT NULL REFERENCES public.empresas(id)    ON DELETE CASCADE,
    pub_id      INTEGER  NOT NULL REFERENCES public.empresa_pubs(id) ON DELETE CASCADE,
    formato     TEXT     NOT NULL,
    clicks      BIGINT   NOT NULL DEFAULT 1,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pub_click_stats_pub_formato UNIQUE (pub_id, formato)
);

CREATE INDEX IF NOT EXISTS idx_pub_click_stats_empresa_id ON public.pub_click_stats (empresa_id);
CREATE INDEX IF NOT EXISTS idx_pub_click_stats_pub_id     ON public.pub_click_stats (pub_id);

-- -----------------------------------------------------------------------------
-- 3. Função que incrementa pub_click_stats após INSERT em pub_click_logs
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_increment_pub_click_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.pub_click_stats (empresa_id, pub_id, formato, clicks, updated_at)
    VALUES (NEW.empresa_id, NEW.pub_id, NEW.formato, 1, NOW())
    ON CONFLICT (pub_id, formato)
    DO UPDATE SET
        clicks     = public.pub_click_stats.clicks + 1,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Trigger que dispara a função após cada INSERT em pub_click_logs
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_pub_click_stats ON public.pub_click_logs;

CREATE TRIGGER trg_pub_click_stats
    AFTER INSERT ON public.pub_click_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_increment_pub_click_stats();

-- -----------------------------------------------------------------------------
-- 5. RLS — pub_click_logs
-- -----------------------------------------------------------------------------
ALTER TABLE public.pub_click_logs ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (registro de clique público)
CREATE POLICY "pub_click_logs: insert público"
    ON public.pub_click_logs
    FOR INSERT
    WITH CHECK (true);

-- Apenas admins visualizam os logs brutos
CREATE POLICY "pub_click_logs: select admin"
    ON public.pub_click_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
              AND users.tipo = 'admin'
        )
    );

-- Ninguém deleta / atualiza logs (integridade do histórico)
-- (nenhuma policy DELETE/UPDATE → negada automaticamente pelo RLS)

-- -----------------------------------------------------------------------------
-- 6. RLS — pub_click_stats
-- -----------------------------------------------------------------------------
ALTER TABLE public.pub_click_stats ENABLE ROW LEVEL SECURITY;

-- Leitura pública dos contadores (útil para dashboards de empresa)
CREATE POLICY "pub_click_stats: select público"
    ON public.pub_click_stats
    FOR SELECT
    USING (true);

-- Apenas a função SECURITY DEFINER acima pode inserir/atualizar
-- (via trigger — não exposto diretamente a usuários)

-- =============================================================================
-- FIM DA MIGRATION
-- =============================================================================

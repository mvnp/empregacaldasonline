-- =============================================================================
-- Migration: 20260415141500_update_pub_click_index.sql
-- Objetivo: Otimizar o novo critério de deduplicação (IP + Pub + Formato + Page)
-- =============================================================================

-- Remove o índice antigo que não contemplava a página
DROP INDEX IF EXISTS public.idx_pub_click_logs_ip_pub_fmt;

-- Cria o novo índice incluindo a coluna 'page' para acelerar a verificação de deduplicação
CREATE INDEX IF NOT EXISTS idx_pub_click_logs_ip_pub_fmt_page 
ON public.pub_click_logs (ip, pub_id, formato, page, clicked_at DESC);

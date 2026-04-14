-- ============================================================
-- Migration: 20260414100000_create_vaga_imagens.sql
-- Tabela para armazenar imagens de anúncios de vagas
-- enviadas via IA. O arquivo físico fica no bucket
-- "vagas-imagens" do Supabase Storage.
-- ============================================================

-- 1. Tabela principal
create table if not exists public.vaga_imagens (
  id            bigserial primary key,
  vaga_id       bigint references public.vagas(id) on delete cascade,
  storage_path  text        not null,     -- path dentro do bucket
  url_publica   text,                     -- URL pública gerada pelo Storage
  nome_original text,                     -- nome original do arquivo enviado
  criado_em     timestamptz not null default now()
);

-- 2. Índice para busca por vaga
create index if not exists idx_vaga_imagens_vaga_id
  on public.vaga_imagens(vaga_id);

-- 3. RLS
alter table public.vaga_imagens enable row level security;

-- Leitura pública (a segurança real está no bucket do Storage)
create policy "Leitura publica vaga_imagens"
  on public.vaga_imagens for select
  using (true);

-- Nota: INSERT e DELETE são feitos exclusivamente via
-- createAdminClient() (service_role), sem necessidade de
-- políticas RLS adicionais para essas operações.

-- ============================================================
-- IMPORTANTE: Criar o bucket manualmente no Supabase Dashboard
-- -> Storage -> New bucket -> Nome: vagas-imagens -> Public: ON
-- ============================================================

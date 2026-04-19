-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public._cnaes (
  codigo bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  descricao text
);
CREATE TABLE public._estabelecimentos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cnpj_basico text,
  cnpj_ordem text,
  cnpj_dv text,
  identificador_matriz_filial text,
  nome_fantasia text,
  situacao_cadastral text,
  data_situacao_cadastral text,
  motivo_situacao_cadastral text,
  nome_cidade_exterior text,
  pais text,
  data_inicio_atividade text,
  cnae_fiscal_principal bigint,
  cnae_fiscal_secundaria text,
  tipo_logradouro text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cep text,
  uf text,
  municipio text,
  ddd_1 text,
  telefone_1 text,
  ddd_2 text,
  telefone_2 text,
  ddd_fax text,
  fax text,
  correio_eletronico text,
  situacao_especial text,
  data_situacao_especial text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT _estabelecimentos_pkey PRIMARY KEY (id)
);
CREATE TABLE public._estabelecimentos_favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  estabelecimento_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT _estabelecimentos_favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT _estabelecimentos_favoritos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT _estabelecimentos_favoritos_estabelecimento_id_fkey FOREIGN KEY (estabelecimento_id) REFERENCES public._estabelecimentos(id)
);
CREATE TABLE public.blog_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_post_categories (
  post_id uuid NOT NULL,
  category_id uuid NOT NULL,
  CONSTRAINT blog_post_categories_pkey PRIMARY KEY (post_id, category_id),
  CONSTRAINT blog_post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id),
  CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id)
);
CREATE TABLE public.blog_post_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  url text NOT NULL,
  featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_post_images_pkey PRIMARY KEY (id),
  CONSTRAINT blog_post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  tags ARRAY DEFAULT '{}'::text[],
  author_name text,
  author_role text,
  author_avatar text,
  reading_time integer DEFAULT 5,
  featured boolean DEFAULT false,
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.candidato_documentos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  candidato_id bigint NOT NULL,
  titulo text NOT NULL,
  tipo text,
  url text,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT candidato_documentos_pkey PRIMARY KEY (id),
  CONSTRAINT candidato_documentos_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.candidato_experiencias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  candidato_id bigint NOT NULL,
  cargo text NOT NULL,
  empresa text NOT NULL,
  descricao text,
  data_inicio date NOT NULL,
  data_fim date,
  em_andamento boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT candidato_experiencias_pkey PRIMARY KEY (id),
  CONSTRAINT candidato_experiencias_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.candidato_formacoes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  candidato_id bigint NOT NULL,
  curso text NOT NULL,
  instituicao text NOT NULL,
  grau text,
  data_inicio date NOT NULL,
  data_fim date,
  em_andamento boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT candidato_formacoes_pkey PRIMARY KEY (id),
  CONSTRAINT candidato_formacoes_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.candidato_habilidades (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  candidato_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT candidato_habilidades_pkey PRIMARY KEY (id),
  CONSTRAINT candidato_habilidades_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.candidato_idiomas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  candidato_id bigint NOT NULL,
  idioma text NOT NULL,
  nivel text CHECK (nivel = ANY (ARRAY['basico'::text, 'intermediario'::text, 'avancado'::text, 'fluente'::text, 'nativo'::text])),
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT candidato_idiomas_pkey PRIMARY KEY (id),
  CONSTRAINT candidato_idiomas_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.candidatos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  nome_completo text NOT NULL,
  cargo_desejado text,
  resumo text,
  local text,
  data_nascimento date,
  email text NOT NULL,
  telefone text,
  whatsapp text,
  linkedin text,
  portfolio text,
  github text,
  disponivel boolean NOT NULL DEFAULT true,
  pretensao_min numeric,
  pretensao_max numeric,
  status text NOT NULL DEFAULT 'ativo'::text CHECK (status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'bloqueado'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  share_token uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT candidatos_pkey PRIMARY KEY (id),
  CONSTRAINT candidatos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.candidaturas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vaga_id bigint NOT NULL,
  candidato_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'pendente'::text CHECK (status = ANY (ARRAY['pendente'::text, 'em_analise'::text, 'entrevista'::text, 'recusado'::text, 'aprovado'::text])),
  mensagem text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidaturas_pkey PRIMARY KEY (id),
  CONSTRAINT candidaturas_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id),
  CONSTRAINT candidaturas_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.candidatos(id)
);
CREATE TABLE public.cidades (
  id integer NOT NULL,
  estado_id integer NOT NULL,
  nome text NOT NULL,
  CONSTRAINT cidades_pkey PRIMARY KEY (id),
  CONSTRAINT cidades_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.estados(id)
);
CREATE TABLE public.empresa_beneficios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT empresa_beneficios_pkey PRIMARY KEY (id),
  CONSTRAINT empresa_beneficios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.empresa_pub_imagens (
  id integer NOT NULL DEFAULT nextval('empresa_pub_imagens_id_seq'::regclass),
  pub_id integer NOT NULL,
  formato text NOT NULL,
  arquivo_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresa_pub_imagens_pkey PRIMARY KEY (id),
  CONSTRAINT empresa_pub_imagens_pub_id_fkey FOREIGN KEY (pub_id) REFERENCES public.empresa_pubs(id)
);
CREATE TABLE public.empresa_pubs (
  id integer NOT NULL DEFAULT nextval('empresa_pubs_id_seq'::regclass),
  empresa_id integer NOT NULL,
  link_destino text NOT NULL,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone NOT NULL,
  orcamento_real numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'ativo'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresa_pubs_pkey PRIMARY KEY (id),
  CONSTRAINT empresa_pubs_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.empresa_tecnologias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT empresa_tecnologias_pkey PRIMARY KEY (id),
  CONSTRAINT empresa_tecnologias_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.empresas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  nome_fantasia text NOT NULL,
  razao_social text,
  cnpj text,
  setor text,
  tamanho_empresa text,
  fundacao_ano integer,
  descricao text,
  local text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  email_contato text,
  telefone text,
  whatsapp text,
  website text,
  linkedin text,
  plano text NOT NULL DEFAULT 'Gratuito'::text,
  status text NOT NULL DEFAULT 'ativa'::text CHECK (status = ANY (ARRAY['ativa'::text, 'inativa'::text, 'bloqueada'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresas_pkey PRIMARY KEY (id),
  CONSTRAINT empresas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.estados (
  id integer NOT NULL,
  sigla character NOT NULL UNIQUE,
  nome text NOT NULL,
  regiao text NOT NULL,
  CONSTRAINT estados_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ia_creditos (
  user_id bigint NOT NULL,
  creditos integer NOT NULL DEFAULT 5,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ia_creditos_pkey PRIMARY KEY (user_id),
  CONSTRAINT ia_creditos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.interview_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  step integer DEFAULT 0,
  nome text,
  idate text,
  genero text,
  escolaridade text,
  cargo text,
  experiencia text,
  motivacao text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  experiencias_profissionais text,
  CONSTRAINT interview_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.openai_config (
  user_id uuid NOT NULL,
  openai_token text NOT NULL,
  model text NOT NULL DEFAULT 'gpt-4o'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title text DEFAULT 'Leitor de Vagas (IA)'::text,
  prompt text DEFAULT 'Extraia as informações desta imagem de anúncio de vaga de emprego e retorne um objeto JSON com as seguintes chaves: "titulo" (Título da Vaga) e "descricao" (Descrição da Vaga contendo responsabilidades, requisitos, etc.). Em caso de indisponibilidade não preencha.'::text,
  CONSTRAINT openai_config_pkey PRIMARY KEY (user_id),
  CONSTRAINT openai_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.openai_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  model text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT openai_usage_logs_pkey PRIMARY KEY (id),
  CONSTRAINT openai_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.portal_config (
  id integer NOT NULL DEFAULT nextval('portal_config_id_seq'::regclass),
  chave text NOT NULL UNIQUE,
  valor jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT portal_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pub_click_logs (
  id bigint NOT NULL DEFAULT nextval('pub_click_logs_id_seq'::regclass),
  empresa_id integer NOT NULL,
  pub_id integer NOT NULL,
  formato text NOT NULL,
  page text NOT NULL,
  ip text NOT NULL,
  user_id bigint,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pub_click_logs_pkey PRIMARY KEY (id),
  CONSTRAINT pub_click_logs_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT pub_click_logs_pub_id_fkey FOREIGN KEY (pub_id) REFERENCES public.empresa_pubs(id),
  CONSTRAINT pub_click_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.pub_click_stats (
  id bigint NOT NULL DEFAULT nextval('pub_click_stats_id_seq'::regclass),
  empresa_id integer NOT NULL,
  pub_id integer NOT NULL,
  formato text NOT NULL,
  clicks bigint NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pub_click_stats_pkey PRIMARY KEY (id),
  CONSTRAINT pub_click_stats_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT pub_click_stats_pub_id_fkey FOREIGN KEY (pub_id) REFERENCES public.empresa_pubs(id)
);
CREATE TABLE public.user_enderecos (
  user_id bigint NOT NULL,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_enderecos_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_enderecos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  auth_id uuid NOT NULL UNIQUE,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['candidato'::text, 'empregador'::text, 'admin'::text])),
  nome text NOT NULL,
  sobrenome text,
  email text NOT NULL,
  telefone text,
  avatar_url text,
  data_nascimento date,
  area_interesse text,
  razao_social text,
  cnpj text,
  setor text,
  tamanho_empresa text,
  responsavel_rh text,
  status text NOT NULL DEFAULT 'ativo'::text CHECK (status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'bloqueado'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cpf text,
  celular text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vaga_beneficios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vaga_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT vaga_beneficios_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_beneficios_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vaga_diferenciais (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vaga_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT vaga_diferenciais_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_diferenciais_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vaga_imagens (
  id bigint NOT NULL DEFAULT nextval('vaga_imagens_id_seq'::regclass),
  vaga_id bigint,
  storage_path text NOT NULL,
  url_publica text,
  nome_original text,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vaga_imagens_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_imagens_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vaga_notifications (
  id bigint NOT NULL DEFAULT nextval('vaga_notifications_id_seq'::regclass),
  vaga_id bigint NOT NULL,
  motivo character varying NOT NULL,
  relato text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vaga_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_notifications_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vaga_requisitos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vaga_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT vaga_requisitos_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_requisitos_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vaga_responsabilidades (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  vaga_id bigint NOT NULL,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  CONSTRAINT vaga_responsabilidades_pkey PRIMARY KEY (id),
  CONSTRAINT vaga_responsabilidades_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES public.vagas(id)
);
CREATE TABLE public.vagas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo text NOT NULL,
  descricao text,
  empresa text NOT NULL,
  local text,
  modalidade text NOT NULL CHECK (modalidade = ANY (ARRAY['remoto'::text, 'hibrido'::text, 'presencial'::text])),
  tipo_contrato text CHECK (tipo_contrato = ANY (ARRAY['clt'::text, 'pj'::text, 'estagio'::text, 'temporario'::text, 'freelancer'::text])),
  nivel text CHECK (nivel = ANY (ARRAY['estagio'::text, 'junior'::text, 'pleno'::text, 'senior'::text, 'gerente'::text, 'diretor'::text])),
  salario_min numeric,
  salario_max numeric,
  mostrar_salario boolean NOT NULL DEFAULT true,
  email_contato text,
  link_externo text,
  status text NOT NULL DEFAULT 'ativa'::text CHECK (status = ANY (ARRAY['ativa'::text, 'pausada'::text, 'expirada'::text, 'rascunho'::text])),
  destaque boolean NOT NULL DEFAULT false,
  criado_por bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  empresa_id bigint,
  telefone text,
  whatsapp text,
  json_content jsonb,
  salario_a_combinar boolean DEFAULT false,
  slug text,
  tipo_pagamento text,
  CONSTRAINT vagas_pkey PRIMARY KEY (id),
  CONSTRAINT vagas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.users(id),
  CONSTRAINT vagas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
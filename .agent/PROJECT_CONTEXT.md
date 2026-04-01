# Contexto do Projeto: Portal de Empregos (Emprega Caldas / job)

Este documento descreve as tecnologias e as funcionalidades principais deste projeto. Ele deve ser consultado antes de planejar, implementar ou refatorar qualquer nova funcionalidade para manter a consistência da arquitetura.

## Stack Tecnológico (Tech Stack)

### Frontend
- **Framework:** Next.js (App Router, versão 16+)
- **Linguagem:** TypeScript
- **Biblioteca UI:** React 19
- **Estilização:** Tailwind CSS (v4)
- **Ícones:** Lucide React
- **Gráficos e Dashboards:** Recharts

### Backend / Banco de Dados / Autenticação
- **Plataforma Principal:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Integração Backend/Frontend:** `@supabase/ssr` e `@supabase/supabase-js`

## Funcionalidades do Projeto

### 1. Área Pública (Vitrine e Portal de Vagas)
- **Home / Landing Page:** Interface atrativa de conversão (HeroSection, rodapé, barra de navegação principal).
- **Portal de Vagas (`/vagas`):** 
  - Listagem de oportunidades de emprego com paginação e cards visuais (`VagaCard`).
  - Painel de filtros avançado (`FilterPanel`) para a busca de empregos.
  - Sidebar auxiliar e visualização detalhada de informações de cada vaga.
- **Blog (`/blog`):**
  - Repositório de artigos, novidades ou dicas de carreira, com cards dedicados (`BlogCard`) e barra lateral de navegação (`BlogSidebar`).

### 2. Autenticação e Gestão de Contas
- Ponto de entrada estruturado para **Cadastro**, **Login** e funcionalidade para **Esqueci a Senha** (autenticação baseada em Supabase Auth).
- Painel de autenticação independente e isolado nas rotas ou em componentes visuais dedicados (`AuthPanel`).

### 3. Painel Administrativo / Dashboard Centralizado (`/admin`)
O projeto possui um módulo administrativo poderoso e segregado dos acessos públicos. Ele serve para gerenciar todas as entidades do serviço:
- **Gestão de Empresas e Empregadores (`/admin/empresas`, `/admin/lista-empresas`, `/admin/empregador`):** 
  - Cadastro, conferência e visualização de empresas que buscam profissionais.
  - Funcionalidade especial para **Importar Estabelecimentos** em lote ou de plataformas externas.
- **Gestão de Candidatos (`/admin/candidatos`):**
  - Acesso à base de profissionais cadastrados.
- **Gestão de Vagas (`/admin/vagas`, `/admin/gerar-vagas`):**
  - Publicação, edição e gestão do ciclo de vida das vagas.
  - Módulo que sugere a geração contínua e facilitada de descritivos/vagas ("gerar-vagas").
- **Relatórios e Indicadores (`/admin/relatorios`):**
  - Módulos analíticos usando a biblioteca Recharts para mostrar métricas do sistema e cards com estatísticas parciais/totais (`AdminStatCard`).
- **Configurações e Perfil (`/admin/configuracoes`, `/admin/perfil`):**
  - Ajustes de sistema, permissões e cadastro administrativo.

## Regras e Diretrizes Gerais
- **Comunicação com API/Banco:** Todo acesso a dados deve obrigatoriamente usar as instâncias e métodos do Supabase presentes no diretório `src/lib/`.
- **Estruturação de Componentes:** Componentes genéricos ficam em `src/components/`. Componentes do painel administrativos não devem vazar para a área pública e se concentram em `src/components/admin/`.
- **Styling:** Modificações de design e estilo devem ser feitas estritamente via classes utilitárias nativas do Tailwind CSS v4, mantendo a consistência do design system do portal.

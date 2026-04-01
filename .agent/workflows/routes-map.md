---
description: Mapa de rotas por tipo de usuário — leia SEMPRE antes de criar ou modificar páginas
---

# Mapa de Rotas do PortalJobs

> **IMPORTANTE**: Leia este arquivo antes de qualquer operação que envolva criar, mover ou modificar páginas.
> Ainda não há autenticação implementada. Este arquivo define a estrutura planejada de rotas por perfil de usuário.

---

## 🌐 Rotas Públicas (sem autenticação)

Qualquer visitante pode acessar estas rotas.

| Rota | Arquivo | Descrição |
|---|---|---|
| `/` | `app/page.tsx` | Homepage com busca, vagas em destaque, categorias |
| `/vagas/[id]` | `app/vagas/[id]/page.tsx` | Detalhe público de uma vaga |
| `/blog` | `app/blog/page.tsx` | Listagem de artigos do blog |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Artigo individual |
| `/login` | `app/login/page.tsx` | Login (candidato e empresa) |
| `/cadastro` | `app/cadastro/page.tsx` | Escolher tipo de cadastro |
| `/cadastro/candidato` | `app/cadastro/candidato/page.tsx` | Formulário de cadastro candidato |
| `/cadastro/empresa` | `app/cadastro/empresa/page.tsx` | Formulário de cadastro empresa |
| `/esqueci-a-senha` | `app/esqueci-a-senha/page.tsx` | Recuperação de senha |

---

## 🔴 Rotas do Administrador (`/admin/*`)

Acesso total ao sistema. Gerencia vagas, candidatos, empresas, relatórios e configurações globais do portal.

**Layout**: `app/admin/layout.tsx` (sidebar com menu ADMIN_MENU)

| Rota | Arquivo | Descrição |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Dashboard geral (KPIs, tabelas recentes, atividade) |
| `/admin/vagas` | `app/admin/vagas/page.tsx` | Listagem de todas as vagas (filtros + lazy load) |
| `/admin/vagas/[slug]` | `app/admin/vagas/[slug]/page.tsx` | Detalhe de uma vaga (descrição, candidatos, requisitos) |
| `/admin/gerar-vagas` | `app/admin/gerar-vagas/page.tsx` | Geração de vagas e descritivos inteligentes |
| `/admin/candidatos` | `app/admin/candidatos/page.tsx` | Listagem de todos os candidatos (cards + lazy load) |
| `/admin/candidatos/[slug]` | `app/admin/candidatos/[slug]/page.tsx` | Perfil completo do candidato (currículo, documentos) |
| `/admin/empresas` | `app/admin/empresas/page.tsx` | Listagem de todas as empresas (cards + lazy load) |
| `/admin/empresas/[slug]` | `app/admin/empresas/[slug]/page.tsx` | Detalhe da empresa (sobre, vagas publicadas, contato) |
| `/admin/lista-empresas` | `app/admin/lista-empresas/page.tsx` | Controle secundário/listagem avançada das empresas cadastradas |
| `/admin/relatorios` | `app/admin/relatorios/page.tsx` | Relatórios com gráficos (Recharts) e KPIs comparativos |
| `/admin/configuracoes` | `app/admin/configuracoes/page.tsx` | Configurações do portal (8 seções com abas) |
| `/admin/perfil` | `app/admin/perfil/page.tsx` | Perfil do usuário logado (dados pessoais, foto) |

### Funcionalidades exclusivas do Admin:
- Ver TODAS as vagas de TODAS as empresas
- Ver TODOS os candidatos do portal
- Gerenciar empresas e planos
- Configurações globais (SMTP, moderação, SEO, LGPD)
- Relatórios completos do portal

---

## 🟠 Rotas do Empregador (`/admin/empregador/*`)

Acesso restrito às vagas e candidatos da própria empresa. Usa o mesmo layout admin mas com menu EMPREGADOR_MENU.

**Layout**: `app/admin/layout.tsx` (detecta `/admin/empregador` e troca o menu)

| Rota | Arquivo | Descrição |
|---|---|---|
| `/admin/empregador` | `app/admin/empregador/page.tsx` | Dashboard da empresa (KPIs próprios) |
| `/admin/empregador/vagas` | `app/admin/empregador/vagas/page.tsx` | Vagas publicadas pela empresa (re-export) |
| `/admin/empregador/vagas/[slug]` | `app/admin/empregador/vagas/[slug]/page.tsx` | Detalhe de vaga da empresa (re-export) |
| `/admin/empregador/candidatos` | `app/admin/empregador/candidatos/page.tsx` | Candidatos que se aplicaram às vagas da empresa (re-export) |
| `/admin/empregador/candidatos/[slug]` | `app/admin/empregador/candidatos/[slug]/page.tsx` | Perfil do candidato (re-export) |
| `/admin/empregador/relatorios` | `app/admin/empregador/relatorios/page.tsx` | Relatórios da empresa (re-export) |
| `/admin/empregador/configuracoes` | `app/admin/empregador/configuracoes/page.tsx` | Configurações da empresa (4 seções: dados, notificações, segurança, plano) |

### Funcionalidades exclusivas do Empregador:
- Ver apenas as PRÓPRIAS vagas publicadas
- Ver apenas os candidatos que se aplicaram às SUAS vagas
- Configurar dados da empresa, notificações e plano
- Relatórios das próprias vagas
- **Não tem acesso** a: outras empresas, configurações globais, moderação

### Nota sobre re-exports:
A maioria das páginas do empregador reutiliza as mesmas páginas do admin via `export { default } from '...'`.
Quando o backend for implementado, cada página filtrará os dados pelo `empresa_id` do usuário logado.

---

## 🟢 Rotas do Candidato (`/admin/candidato/*`) — A CRIAR

Painel do candidato. Acesso ao próprio currículo, candidaturas e busca de vagas.

**Layout**: Será criado em `app/admin/candidato/layout.tsx` ou reutilizará `app/admin/layout.tsx` com menu CANDIDATO_MENU.

| Rota | Arquivo | Descrição | Status |
|---|---|---|---|
| `/admin/candidato` | `app/admin/candidato/page.tsx` | Dashboard do candidato (vagas recomendadas, status candidaturas) | 🔲 Não criada |
| `/admin/candidato/curriculo` | `app/admin/candidato/curriculo/page.tsx` | Editar currículo (dados pessoais, experiência, formação, habilidades) | 🔲 Não criada |
| `/admin/candidato/candidaturas` | `app/admin/candidato/candidaturas/page.tsx` | Minhas candidaturas (status de cada, histórico) | 🔲 Não criada |
| `/admin/candidato/vagas` | `app/admin/candidato/vagas/page.tsx` | Buscar vagas (com filtros e candidatura direta) | 🔲 Não criada |
| `/admin/candidato/documentos` | `app/admin/candidato/documentos/page.tsx` | Upload de documentos (identidade, certificados) | 🔲 Não criada |
| `/admin/candidato/configuracoes` | `app/admin/candidato/configuracoes/page.tsx` | Configurações da conta (dados, senha, notificações) | 🔲 Não criada |
| `/admin/candidato/perfil` | `app/admin/candidato/perfil/page.tsx` | Visualizar como as empresas veem meu perfil | 🔲 Não criada |

### Funcionalidades exclusivas do Candidato:
- Editar e gerenciar o PRÓPRIO currículo
- Ver SUAS candidaturas e status de cada uma
- Buscar vagas e se candidatar
- Upload de documentos pessoais
- **Não tem acesso** a: dados de empresas, relatórios globais, outros candidatos

---

## 📁 Estrutura de diretórios (referência)

```
src/app/
├── page.tsx                          # Homepage (pública)
├── login/page.tsx                    # Login
├── cadastro/                         # Cadastro
│   ├── page.tsx                      # Escolher tipo
│   ├── candidato/page.tsx            # Form candidato
│   └── empresa/page.tsx              # Form empresa
├── esqueci-a-senha/page.tsx          # Recuperar senha
├── vagas/[id]/page.tsx               # Detalhe vaga (público)
├── blog/                             # Blog (público)
│   ├── page.tsx
│   └── [slug]/page.tsx
└── admin/
    ├── layout.tsx                    # Layout compartilhado (sidebar)
    ├── page.tsx                      # Dashboard Admin
    ├── perfil/page.tsx               # Perfil do usuário
    ├── vagas/                        # Vagas (admin)
    ├── gerar-vagas/                  # IA / Criação de Vagas
    ├── candidatos/                   # Candidatos (admin)
    ├── empresas/                     # Empresas (admin)
    ├── lista-empresas/               # Controle de Empregadores
    ├── relatorios/page.tsx           # Relatórios (admin)
    ├── configuracoes/page.tsx        # Configurações (admin)
    ├── empregador/                   # Painel empregador
    │   ├── page.tsx
    │   ├── vagas/
    │   ├── candidatos/
    │   ├── relatorios/page.tsx
    │   └── configuracoes/page.tsx
    └── candidato/                    # Painel candidato (A CRIAR)
        ├── page.tsx
        ├── curriculo/page.tsx
        ├── candidaturas/page.tsx
        ├── vagas/page.tsx
        ├── documentos/page.tsx
        └── configuracoes/page.tsx
```

---

## ⚠️ Regras para a IA

1. **Antes de criar uma nova página**, verifique neste arquivo se a rota já existe ou está planejada
2. **Nunca misture rotas** de perfis diferentes (ex: não colocar funcionalidade de admin dentro de empregador)
3. **Re-exports**: Se a lógica for idêntica entre admin e empregador, use `export { default } from '...'` — a separação real virá no backend
4. **Candidato**: Rotas ainda não criadas. Quando solicitado, siga o padrão `/admin/candidato/*`
5. **Prefixo `/admin`**: Todas as rotas autenticadas usam este prefixo, independente do tipo de usuário
6. **Layout**: O `admin/layout.tsx` já detecta automaticamente se é empregador pelo pathname. Adicionar detecção do candidato quando for implementado

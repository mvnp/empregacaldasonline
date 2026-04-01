---
description: Iniciar Desenvolvimento do Portal de Empregos
---

# Workflow: Iniciar Desenvolvimento

## Stack do Projeto
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilização**: Tailwind CSS v4
- **Backend**: Supabase (Auth + Database)
- **Ícones**: lucide-react
- **Diretório**: `c:\www\_job-board\job`

## Estrutura de Pastas
```
src/
  app/           → App Router (páginas Next.js)
  components/    → Componentes reutilizáveis
  layouts/       → Layouts compartilhados (ex: MainLayout, FormLayout)
  services/      → Serviços de API e Supabase
  types/         → Interfaces e tipos TypeScript
  lib/           → Utilitários e configurações (ex: supabase client)
  hooks/         → Custom React hooks
```

## Passos para Iniciar o Dev Server

// turbo
1. Instalar dependências (se necessário):
```
npm install
```

// turbo
2. Iniciar o servidor de desenvolvimento:
```
npm run dev
```

O servidor estará disponível em: http://localhost:3000

## Comandos Úteis

// turbo
- Build de produção: `npm run build`
- Verificar tipos: `npx tsc --noEmit`
- Lint: `npm run lint`

## Regras do Projeto
- Usar `lucide-react` para todos os ícones (nunca SVG inline)
- Paleta: `blue-600` / `indigo-600` para ações primárias, `zinc-*` para backgrounds
- Nunca usar `alert()` — usar modais customizados ou Toast
- Todas as chamadas de API centralizadas em `/src/services`
- Tipos em `/src/types`
- Configuração Supabase em `/src/lib/supabase.ts`

## Backend — Decisão de Arquitetura

> **Server Actions (Next.js) como base principal + Edge Functions (Supabase) apenas quando necessário.**

### Server Actions — Usar para:
- CRUD de vagas, candidatos, empresas
- Login, cadastro, alterar senha
- Upload de foto/documentos
- Filtros, buscas, paginação
- Qualquer operação iniciada pelo usuário dentro do Next.js

### Onde ficam no código:
```
src/
  actions/           → Server Actions organizadas por domínio
    vagas.ts         → criar, editar, excluir, listar vagas
    candidatos.ts    → cadastro, currículo, candidaturas
    empresas.ts      → dados da empresa, plano
    auth.ts          → login, cadastro, senha
    upload.ts        → foto de perfil, documentos
```

### Regras para Server Actions:
- Sempre marcar com `'use server'` no topo do arquivo
- Usar `createClient()` do Supabase server-side (nunca o client-side)
- Sempre validar dados de entrada antes de enviar ao banco
- Retornar objetos tipados `{ success: boolean, data?, error? }`
- Usar `revalidatePath()` ou `revalidateTag()` após mutações

### Edge Functions (Supabase) — Usar SOMENTE para:
- Webhooks externos (pagamento, integrações)
- Cron jobs (expirar vagas, relatórios agendados)
- API pública para terceiros (se necessário no futuro)
- Tarefas que não são iniciadas por ação do usuário no frontend

### Por que essa decisão:
- Projeto é Next.js puro (sem app mobile ou frontend separado)
- Server Actions mantêm tipagem end-to-end com os componentes
- Deploy unificado no Docker/Easypanel (zero infraestrutura adicional)
- Se surgir necessidade de API externa (mobile), criar Edge Functions **só para esses endpoints**

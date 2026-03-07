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

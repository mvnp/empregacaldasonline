---
description: Estrutura, relações e índices do banco de dados (Supabase)
---

# Banco de Dados (EMPREGACALDAS)

Este documento mapeia o schema do banco de dados para consulta rápida, descrevendo as tabelas principais, suas referências e peculiaridades. Consulte-o sempre antes de planejar novas `actions` do servidor ou modificar as páginas que fazem operações de CRUD.

## 1. Usuários e Perfis (`users`)
A tabela principal `users` funciona como a única fonte da verdade de contas, sendo estendida (1:N ou 1:1) por outras tabelas baseadas no `tipo` do usuário.

- **`users`**
    - `id` (bigint, PK)
    - `auth_id` (uuid, FK para `auth.users`, **UNIQUE**): Vínculo direto com o Supabase Auth.
    - `tipo` (text): Enum (`'candidato'`, `'empregador'`, `'admin'`). Controla o nível de acesso em toda a aplicação.
    - Campos descritivos: `nome`, `sobrenome`, `email`, `telefone`, `avatar_url`, `status`.

## 2. Empregadores e Empresas
- **`empresas`**
    - Identifica o negócio cadastrado por um empregador.
    - `user_id` (FK para `users`): O criador / dono da conta empresarial.
    - Tabela Pai de N entidades descritivas.
    
- **Tabelas Filhas de Empresas (Relação 1:N)**
    - `empresa_beneficios` (FK: `empresa_id`)
    - `empresa_tecnologias` (FK: `empresa_id`)

## 3. Vagas de Emprego
- **`vagas`**
    - A unidade central do sistema (Job Post).
    - `criado_por` (FK para `users`): Quem publicou a vaga.
    - `empresa_id` (FK para `empresas`): A qual negócio esta vaga pertence.
    - Campos importantes: `modalidade` (`'remoto'`, `'hibrido'`, `'presencial'`), `tipo_contrato`, `salario_min`, `salario_max`, `status`.

- **Tabelas Filhas de Vagas (Relação 1:N)**
    - `vaga_beneficios` (FK: `vaga_id`)
    - `vaga_diferenciais` (FK: `vaga_id`)
    - `vaga_requisitos` (FK: `vaga_id`)
    - `vaga_responsabilidades` (FK: `vaga_id`)

## 4. Candidatos e Currículos
- **`candidatos`**
    - Funciona como a entidade de **Currículo** do portal.
    - `user_id` (FK para `users`): Identifica a aba de quem criou o currículo. **Atenção:** Em seu DB há um bloqueio `UNIQUE` no `user_id`, mas a aplicação deve permitir lidar com múltiplos (recomendado fazer `DROP CONSTRAINT candidatos_user_id_key` se for permitir múltiplos currículos).
    
- **Tabelas Filhas de Candidatos (Relação 1:N)**
    - `candidato_experiencias` (FK: `candidato_id`)
    - `candidato_formacoes` (FK: `candidato_id`)
    - `candidato_habilidades` (FK: `candidato_id`)
    - `candidato_idiomas` (FK: `candidato_id`)
    - `candidato_documentos` (FK: `candidato_id`)

## 5. Relacionamento: As Candidaturas (N:N)
O elo principal que junta Empregadores e Candidatos.
- **`candidaturas`**
    - `id` (PK)
    - `vaga_id` (FK para `vagas`)
    - `candidato_id` (FK para `candidatos` - Nota: é para o Currículo do candidato, e não diretamente para a tabela `users`).
    - `status`: Enum (`'pendente'`, `'em_analise'`, `'entrevista'`, `'recusado'`, `'aprovado'`).

## 6. Sistema de Blog
Estrutura clássica de postagens gerenciada pelos Admins.
- `blog_posts` (PK: `id`)
- `blog_categories` (PK: `id`)
- `blog_post_categories` (Tabela N:N interagindo `post_id` e `category_id`)
- `blog_post_images` (FK: `post_id`)

## 7. Módulo Orago (Avaliação de Risco e Leads)
Este módulo é consumido por endpoints de importação, listagem externa e análises de inteligência artificial.
- `_estabelecimentos`: Armazena dados complexos extraídos de CNPJs e fontes diversas.
- `_estabelecimentos_favoritos` (FK: `estabelecimento_id`, FK: `auth.users.id`).
- `_cnaes`: Catálogo.
- `openai_config`: Armazena a configuração de prompt/tokens para o módulo que analisa imagens e dados externos do usuário (FK: `auth.users.id`).

---
*(Nota: Sempre busque manter o ecossistema de chaves estrangeiras perfeitamente alimentado nas queries em `/src/actions` usando o Edge Client / Server Client do Supabase com as regras RLS mapeadas na hierarquia acima).*

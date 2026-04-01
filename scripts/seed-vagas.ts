/**
 * seed-vagas.ts
 * Insere as vagas do mock no banco Supabase respeitando o schema:
 *   vagas → vaga_responsabilidades | vaga_requisitos | vaga_diferenciais | vaga_beneficios
 *
 * Executar:
 *   npx ts-node --project tsconfig.json -e "require('ts-node/register'); require('./scripts/seed-vagas')"
 * ou com dotenv-cli:
 *   npx dotenv -e .env -- npx ts-node scripts/seed-vagas.ts
 */

import { createClient } from '@supabase/supabase-js'

// ─── Env ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converte 'R$ 6.000 – R$ 9.000' → { min: 6000, max: 9000 } */
function parseSalario(s: string): { min: number | null; max: number | null } {
  // remove 'R$', espaços e separa pelo traço/en-dash
  const clean = s.replace(/R\$\s?/g, '').replace(/\./g, '')
  const parts = clean.split(/[–\-]/).map(p => parseFloat(p.trim()))
  const min = isNaN(parts[0]) ? null : parts[0]
  const max = isNaN(parts[1]) ? null : parts[1]
  return { min, max }
}

/** Normaliza modalidade para o CHECK do banco */
function normModalidade(m: string): 'remoto' | 'hibrido' | 'presencial' {
  const map: Record<string, 'remoto' | 'hibrido' | 'presencial'> = {
    remoto: 'remoto',
    híbrido: 'hibrido',
    hibrido: 'hibrido',
    presencial: 'presencial',
  }
  return map[m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] ?? 'presencial'
}

/** Normaliza tipo_contrato para o CHECK do banco */
function normContrato(c: string): 'clt' | 'pj' | 'estagio' | 'temporario' | 'freelancer' | null {
  const map: Record<string, 'clt' | 'pj' | 'estagio' | 'temporario' | 'freelancer'> = {
    clt: 'clt',
    pj: 'pj',
    estágio: 'estagio',
    estagio: 'estagio',
    temporário: 'temporario',
    temporario: 'temporario',
    freelance: 'freelancer',
    freelancer: 'freelancer',
  }
  const key = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return map[key] ?? null
}

/** Normaliza nível para o CHECK do banco */
function normNivel(n: string): 'estagio' | 'junior' | 'pleno' | 'senior' | 'gerente' | 'diretor' | null {
  const map: Record<string, 'estagio' | 'junior' | 'pleno' | 'senior' | 'gerente' | 'diretor'> = {
    estagio: 'estagio',
    estagío: 'estagio',
    junior: 'junior',
    júnior: 'junior',
    pleno: 'pleno',
    senior: 'senior',
    sênior: 'senior',
    gerente: 'gerente',
    diretor: 'diretor',
  }
  const key = n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return map[key] ?? null
}

// ─── Dados completos ──────────────────────────────────────────────────────────
// Cada entrada já contém tanto os campos da listagem quanto os de detalhe.
// Para vagas sem mock de detalhe geramos valores genéricos (igual ao getVagaDetalhe).

interface VagaSeed {
  // listagem
  titulo: string
  empresa: string
  local: string
  modalidade: string
  contrato: string
  area: string
  nivel: string
  salario: string
  destaque: boolean
  // detalhe
  descricao: string
  responsabilidades: string[]
  requisitos: string[]
  diferenciais: string[]
  beneficios: string[]
  email?: string
  link_externo?: string
}

const VAGAS: VagaSeed[] = [
  // ── 1: Desenvolvedor Front-End React ───────────────────────────────────────
  {
    titulo: 'Desenvolvedor Front-End React',
    empresa: 'TechBrasil Ltda.',
    local: 'São Paulo, SP',
    modalidade: 'Remoto',
    contrato: 'CLT',
    area: 'Tecnologia',
    nivel: 'Pleno',
    salario: 'R$ 6.000 – R$ 9.000',
    destaque: true,
    descricao:
      'Estamos em busca de um(a) Desenvolvedor(a) Front-End React para integrar nosso time de engenharia em expansão. Você trabalhará na construção de produtos digitais que impactam milhares de usuários, com autonomia e metodologias ágeis.\n\nSe você é apaixonado(a) por criar interfaces bonitas, performáticas e acessíveis, esse é o seu lugar! Nossa equipe é colaborativa, focada em crescimento técnico e valoriza boas práticas de desenvolvimento.',
    responsabilidades: [
      'Desenvolver e manter interfaces web utilizando React e TypeScript',
      'Colaborar com designers via Figma para garantir fidelidade ao design',
      'Implementar testes unitários e de integração (Jest, React Testing Library)',
      'Otimizar performance de aplicações web (Core Web Vitals)',
      'Participar de code reviews e contribuir para a cultura de qualidade',
      'Integrar APIs RESTful e GraphQL',
      'Contribuir com a documentação técnica da equipe',
    ],
    requisitos: [
      'Experiência sólida com React.js (mínimo 2 anos)',
      'Domínio de TypeScript',
      'Conhecimento de HTML5, CSS3 e design responsivo',
      'Experiência com gerenciamento de estado (Context API, Redux, Zustand)',
      'Familiaridade com Git e metodologias ágeis (Scrum/Kanban)',
      'Inglês técnico para leitura de documentação',
    ],
    diferenciais: [
      'Experiência com Next.js',
      'Conhecimento de Web Performance e acessibilidade (WCAG)',
      'Experiência com microfrontends',
      'Contribuições em projetos open source',
      'Conhecimento de Tailwind CSS ou Styled Components',
    ],
    beneficios: [
      'Plano de saúde e odontológico (Unimed)',
      'Vale refeição R$ 800/mês',
      'Home office 100% remoto',
      'Equipamento fornecido (MacBook Pro)',
      'Plano de carreira estruturado',
      'Budget anual de R$ 3.000 para cursos',
      'Day off no aniversário',
      'Gympass Silver',
    ],
    email: 'vagas@techbrasil.com.br',
  },

  // ── 2: Analista de Marketing Digital ──────────────────────────────────────
  {
    titulo: 'Analista de Marketing Digital',
    empresa: 'Agência Crescer',
    local: 'Rio de Janeiro, RJ',
    modalidade: 'Híbrido',
    contrato: 'CLT',
    area: 'Marketing',
    nivel: 'Júnior',
    salario: 'R$ 3.500 – R$ 5.000',
    destaque: false,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Marketing que desejam crescer em uma agência sólida e inovadora.',
    responsabilidades: [
      'Planejar e executar campanhas de mídia paga (Google Ads, Meta Ads)',
      'Criar e publicar conteúdo para redes sociais',
      'Analisar métricas e elaborar relatórios de desempenho',
      'Apoiar a equipe de SEO na otimização de conteúdo',
    ],
    requisitos: [
      'Experiência mínima de 1 ano em marketing digital',
      'Conhecimento em Google Analytics e Meta Business Suite',
      'Boa comunicação escrita e verbal',
      'Capacidade analítica e atenção aos detalhes',
    ],
    diferenciais: [
      'Certificação Google Ads ou Meta Blueprint',
      'Experiência com e-mail marketing (RD Station, Mailchimp)',
      'Conhecimento básico de SEO',
    ],
    beneficios: [
      'Vale refeição',
      'Plano de saúde',
      'Vale transporte',
      'Horário flexível',
    ],
    email: 'vagas@agenciacrescer.com.br',
  },

  // ── 3: Gerente Comercial ───────────────────────────────────────────────────
  {
    titulo: 'Gerente Comercial',
    empresa: 'Grupo Expansão',
    local: 'Belo Horizonte, MG',
    modalidade: 'Presencial',
    contrato: 'CLT',
    area: 'Vendas',
    nivel: 'Sênior',
    salario: 'R$ 8.000 – R$ 12.000',
    destaque: true,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Vendas que desejam crescer em uma empresa sólida e inovadora.',
    responsabilidades: [
      'Gerir e motivar a equipe comercial (5 vendedores)',
      'Definir metas e acompanhar indicadores de performance',
      'Prospectar e manter relacionamento com grandes contas',
      'Elaborar relatórios e apresentações para a diretoria',
    ],
    requisitos: [
      'Experiência mínima de 3 anos em gestão comercial',
      'Habilidade em negociação e fechamento de contratos',
      'Conhecimento de CRM (Salesforce, Pipedrive ou similar)',
      'Formação superior em Administração, Marketing ou áreas afins',
    ],
    diferenciais: [
      'Pós-graduação em Gestão Comercial ou Marketing',
      'Experiência no setor varejista',
      'Conhecimento de técnicas de vendas consultivas',
    ],
    beneficios: [
      'Carro da empresa',
      'Plano de saúde e odontológico',
      'Comissão por metas atingidas',
      'Vale refeição',
    ],
    email: 'vagas@grupoexpansao.com.br',
  },

  // ── 4: Designer UX/UI ─────────────────────────────────────────────────────
  {
    titulo: 'Designer UX/UI',
    empresa: 'Studio Pixel',
    local: 'Florianópolis, SC',
    modalidade: 'Remoto',
    contrato: 'PJ',
    area: 'Tecnologia',
    nivel: 'Pleno',
    salario: 'R$ 7.000 – R$ 10.000',
    destaque: false,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Tecnologia que desejam crescer em uma empresa sólida e inovadora.',
    responsabilidades: [
      'Criar fluxos de navegação e wireframes',
      'Desenvolver protótipos de alta fidelidade no Figma',
      'Conduzir pesquisas com usuários e testes de usabilidade',
      'Colaborar com o time de desenvolvimento na implementação',
    ],
    requisitos: [
      'Portfólio com projetos de UX/UI',
      'Domínio de Figma ou Adobe XD',
      'Conhecimento de princípios de usabilidade e acessibilidade',
      'Experiência com Design System',
    ],
    diferenciais: [
      'Experiência com Motion Design',
      'Conhecimento básico de HTML/CSS',
      'Experiência em produtos B2B',
    ],
    beneficios: [
      'Contrato PJ com pagamento em dia',
      'Regime 100% remoto',
      'Horário flexível',
      'Budget anual para cursos',
    ],
    email: 'vagas@studiopixel.com.br',
  },

  // ── 5: Enfermeiro(a) UTI ──────────────────────────────────────────────────
  {
    titulo: 'Enfermeiro(a) UTI',
    empresa: 'Hospital São Lucas',
    local: 'Curitiba, PR',
    modalidade: 'Presencial',
    contrato: 'CLT',
    area: 'Saúde',
    nivel: 'Pleno',
    salario: 'R$ 4.500 – R$ 6.500',
    destaque: false,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Saúde que desejam crescer em uma empresa sólida e inovadora.',
    responsabilidades: [
      'Prestar assistência de enfermagem a pacientes em UTI',
      'Administrar medicamentos e realizar procedimentos',
      'Monitorar sinais vitais e estado clínico dos pacientes',
      'Registrar evoluções de enfermagem no sistema hospitalar',
    ],
    requisitos: [
      'Graduação em Enfermagem com COREN ativo',
      'Especialização ou experiência em UTI adulto',
      'Conhecimento de protocolos de segurança do paciente',
      'Disponibilidade para plantões noturnos',
    ],
    diferenciais: [
      'Especialização em terapia intensiva',
      'Cursos em ventilação mecânica e drogas vasoativas',
      'Experiência em UTI cardiológica',
    ],
    beneficios: [
      'Plano de saúde e odontológico',
      'Vale refeição',
      'Vale transporte',
      'Adicional noturno',
    ],
    email: 'vagas@hospitalsaolucas.com.br',
  },

  // ── 6: Engenheiro Civil ───────────────────────────────────────────────────
  {
    titulo: 'Engenheiro Civil',
    empresa: 'Construtora Vertex',
    local: 'Porto Alegre, RS',
    modalidade: 'Presencial',
    contrato: 'CLT',
    area: 'Engenharia',
    nivel: 'Sênior',
    salario: 'R$ 9.000 – R$ 14.000',
    destaque: false,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Engenharia que desejam crescer em uma empresa sólida e inovadora.',
    responsabilidades: [
      'Coordenar projetos de construção civil do início ao fim',
      'Elaborar e revisar projetos técnicos e orçamentos',
      'Gerenciar equipes de obra e fornecedores',
      'Garantir conformidade com normas técnicas e regulatórias',
    ],
    requisitos: [
      'Graduação em Engenharia Civil com CREA ativo',
      'Experiência mínima de 5 anos em gestão de obras',
      'Domínio de AutoCAD e MS Project',
      'Conhecimento de normas ABNT',
    ],
    diferenciais: [
      'Especialização em Gestão de Projetos (PMI/PMP)',
      'Experiência com BIM (Revit)',
      'Experiência em obras de grande porte (acima de R$ 10 milhões)',
    ],
    beneficios: [
      'Carro da empresa',
      'Plano de saúde',
      'Vale refeição',
      'Celular corporativo',
    ],
    email: 'vagas@construtoravertex.com.br',
  },

  // ── 7: Professor de Matemática ────────────────────────────────────────────
  {
    titulo: 'Professor de Matemática',
    empresa: 'Colégio Futuro',
    local: 'Recife, PE',
    modalidade: 'Presencial',
    contrato: 'CLT',
    area: 'Educação',
    nivel: 'Pleno',
    salario: 'R$ 3.000 – R$ 4.500',
    destaque: false,
    descricao:
      'Esta é uma excelente oportunidade para profissionais da área de Educação que desejam crescer em uma empresa sólida e inovadora.',
    responsabilidades: [
      'Ministrar aulas de Matemática para turmas do Ensino Médio',
      'Elaborar planos de aula e materiais didáticos',
      'Aplicar e corrigir avaliações',
      'Participar de reuniões pedagógicas e conselhos de classe',
    ],
    requisitos: [
      'Licenciatura em Matemática ou Pedagogia com habilitação',
      'Experiência mínima de 2 anos em docência',
      'Boa comunicação e didática',
      'Domínio de ferramentas digitais de ensino',
    ],
    diferenciais: [
      'Especialização em Educação',
      'Experiência com plataformas EAD',
      'Conhecimento de metodologias ativas de aprendizagem',
    ],
    beneficios: [
      'Vale refeição',
      'Plano de saúde',
      'Vale transporte',
      'Auxílio educação',
    ],
    email: 'vagas@colegiofuturo.com.br',
  },

  // ── 8: Desenvolvedor Back-End Node.js ─────────────────────────────────────
  {
    titulo: 'Desenvolvedor Back-End Node.js',
    empresa: 'FinTech Boost',
    local: 'Remoto',
    modalidade: 'Remoto',
    contrato: 'PJ',
    area: 'Tecnologia',
    nivel: 'Sênior',
    salario: 'R$ 10.000 – R$ 16.000',
    destaque: true,
    descricao:
      'A FinTech Boost é uma startup de pagamentos digitais em rápido crescimento e buscamos um(a) Desenvolvedor(a) Back-End Sênior para liderar o desenvolvimento da nossa infraestrutura de APIs.\n\nVocê será responsável pela arquitetura de microsserviços que processam mais de 500 mil transações por dia, com foco em escalabilidade, segurança e alta disponibilidade.',
    responsabilidades: [
      'Arquitetar e desenvolver APIs RESTful e GraphQL com Node.js',
      'Liderar tecnicamente o time de back-end (3 desenvolvedores)',
      'Garantir segurança e conformidade com PCI-DSS e LGPD',
      'Projetar soluções de alta disponibilidade e escalabilidade',
      'Implementar pipeline CI/CD e práticas de DevOps',
      'Conduzir code reviews e mentoria técnica',
    ],
    requisitos: [
      'Mínimo 4 anos de experiência com Node.js em produção',
      'Domínio de TypeScript',
      'Experiência com bancos SQL (PostgreSQL) e NoSQL (Redis, MongoDB)',
      'Conhecimento de arquitetura de microsserviços',
      'Experiência com Docker e Kubernetes',
      'Inglês intermediário/avançado',
    ],
    diferenciais: [
      'Experiência no setor financeiro ou fintechs',
      'Certificações AWS (Solutions Architect, Developer)',
      'Conhecimento de processamento de eventos (Kafka, RabbitMQ)',
      'Experiência com Terraform e IaC',
    ],
    beneficios: [
      'Contrato PJ com pagamento em dia',
      'Regime 100% remoto',
      'Horário flexível',
      'Stock options da empresa',
      'Plano de saúde PJ (Bradesco)',
      'Budget de R$ 5.000/ano para capacitação',
    ],
    email: 'tech@fintechboost.com.br',
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱  Iniciando seed de ${VAGAS.length} vagas...\n`)

  for (const vaga of VAGAS) {
    const { min: salario_min, max: salario_max } = parseSalario(vaga.salario)

    // 1. Inserir na tabela vagas
    const { data: vagaRow, error: vagaErr } = await supabase
      .from('vagas')
      .insert({
        titulo: vaga.titulo,
        descricao: vaga.descricao,
        empresa: vaga.empresa,
        local: vaga.local,
        modalidade: normModalidade(vaga.modalidade),
        tipo_contrato: normContrato(vaga.contrato),
        nivel: normNivel(vaga.nivel),
        salario_min,
        salario_max,
        mostrar_salario: true,
        email_contato: vaga.email ?? null,
        link_externo: vaga.link_externo ?? null,
        status: 'ativa',
        destaque: vaga.destaque,
        criado_por: null,
      })
      .select('id')
      .single()

    if (vagaErr || !vagaRow) {
      console.error(`❌  Erro ao inserir vaga "${vaga.titulo}":`, vagaErr?.message)
      continue
    }

    const vagaId = vagaRow.id
    console.log(`✅  [${vagaId}] "${vaga.titulo}" inserida`)

    // 2. Responsabilidades
    if (vaga.responsabilidades.length > 0) {
      const { error } = await supabase.from('vaga_responsabilidades').insert(
        vaga.responsabilidades.map((texto, i) => ({ vaga_id: vagaId, texto, ordem: i }))
      )
      if (error) console.error(`   ⚠️  responsabilidades:`, error.message)
    }

    // 3. Requisitos
    if (vaga.requisitos.length > 0) {
      const { error } = await supabase.from('vaga_requisitos').insert(
        vaga.requisitos.map((texto, i) => ({ vaga_id: vagaId, texto, ordem: i }))
      )
      if (error) console.error(`   ⚠️  requisitos:`, error.message)
    }

    // 4. Diferenciais
    if (vaga.diferenciais.length > 0) {
      const { error } = await supabase.from('vaga_diferenciais').insert(
        vaga.diferenciais.map((texto, i) => ({ vaga_id: vagaId, texto, ordem: i }))
      )
      if (error) console.error(`   ⚠️  diferenciais:`, error.message)
    }

    // 5. Benefícios
    if (vaga.beneficios.length > 0) {
      const { error } = await supabase.from('vaga_beneficios').insert(
        vaga.beneficios.map((texto, i) => ({ vaga_id: vagaId, texto, ordem: i }))
      )
      if (error) console.error(`   ⚠️  beneficios:`, error.message)
    }
  }

  console.log('\n🎉  Seed concluído!\n')
}

seed().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})

// ─────────────────────────────────────────────────────────────
// Tipo: listagem de vagas (card na home)
// ─────────────────────────────────────────────────────────────
export interface VagaItem {
    id: string
    titulo: string
    empresa: string
    local: string
    modalidade: string
    contrato: string
    area: string
    nivel: string
    salario: string
    destaque: boolean
    diasAtras: number
}

// ─────────────────────────────────────────────────────────────
// Tipo: detalhamento de vaga (página /vagas/[id])
// ─────────────────────────────────────────────────────────────
export interface VagaDetalhe extends VagaItem {
    descricao: string          // Texto principal da oportunidade
    responsabilidades: string[] // O que a pessoa vai fazer
    requisitos: string[]       // Requisitos obrigatórios
    diferenciais: string[]     // Requisitos desejáveis (nice to have)
    beneficios: string[]       // Benefícios oferecidos
    sobreEmpresa: string       // Descrição da empresa
    setorEmpresa: string       // Ex: "Tecnologia / SaaS"
    tamanhoEmpresa: string     // Ex: "51–200 funcionários"
    dataPublicacao: string     // ISO date
    dataExpiracao: string      // ISO date
    candidaturas: number       // Número de candidaturas recebidas
    whatsapp?: string          // Número para candidatura via WhatsApp
    email?: string             // E-mail para candidatura
    website?: string           // Site da empresa
}

// ─────────────────────────────────────────────────────────────
// Mock: listagem (home)
// ─────────────────────────────────────────────────────────────
export const VAGAS_MOCK: VagaItem[] = [
    { id: '1', titulo: 'Desenvolvedor Front-End React', empresa: 'TechBrasil Ltda.', local: 'São Paulo, SP', modalidade: 'Remoto', contrato: 'CLT', area: 'Tecnologia', nivel: 'Pleno', salario: 'R$ 6.000 – R$ 9.000', destaque: true, diasAtras: 2 },
    { id: '2', titulo: 'Analista de Marketing Digital', empresa: 'Agência Crescer', local: 'Rio de Janeiro, RJ', modalidade: 'Híbrido', contrato: 'CLT', area: 'Marketing', nivel: 'Júnior', salario: 'R$ 3.500 – R$ 5.000', destaque: false, diasAtras: 1 },
    { id: '3', titulo: 'Gerente Comercial', empresa: 'Grupo Expansão', local: 'Belo Horizonte, MG', modalidade: 'Presencial', contrato: 'CLT', area: 'Vendas', nivel: 'Sênior', salario: 'R$ 8.000 – R$ 12.000', destaque: true, diasAtras: 3 },
    { id: '4', titulo: 'Designer UX/UI', empresa: 'Studio Pixel', local: 'Florianópolis, SC', modalidade: 'Remoto', contrato: 'PJ', area: 'Tecnologia', nivel: 'Pleno', salario: 'R$ 7.000 – R$ 10.000', destaque: false, diasAtras: 1 },
    { id: '5', titulo: 'Enfermeiro(a) UTI', empresa: 'Hospital São Lucas', local: 'Curitiba, PR', modalidade: 'Presencial', contrato: 'CLT', area: 'Saúde', nivel: 'Pleno', salario: 'R$ 4.500 – R$ 6.500', destaque: false, diasAtras: 2 },
    { id: '6', titulo: 'Engenheiro Civil', empresa: 'Construtora Vertex', local: 'Porto Alegre, RS', modalidade: 'Presencial', contrato: 'CLT', area: 'Engenharia', nivel: 'Sênior', salario: 'R$ 9.000 – R$ 14.000', destaque: false, diasAtras: 4 },
    { id: '7', titulo: 'Professor de Matemática', empresa: 'Colégio Futuro', local: 'Recife, PE', modalidade: 'Presencial', contrato: 'CLT', area: 'Educação', nivel: 'Pleno', salario: 'R$ 3.000 – R$ 4.500', destaque: false, diasAtras: 0 },
    { id: '8', titulo: 'Desenvolvedor Back-End Node.js', empresa: 'FinTech Boost', local: 'Remoto', modalidade: 'Remoto', contrato: 'PJ', area: 'Tecnologia', nivel: 'Sênior', salario: 'R$ 10.000 – R$ 16.000', destaque: true, diasAtras: 0 },
]

// ─────────────────────────────────────────────────────────────
// Mock: detalhamento (página da vaga)
// ─────────────────────────────────────────────────────────────
export const VAGAS_DETALHE_MOCK: Record<string, VagaDetalhe> = {
    '1': {
        id: '1',
        titulo: 'Desenvolvedor Front-End React',
        empresa: 'TechBrasil Ltda.',
        local: 'São Paulo, SP',
        modalidade: 'Remoto',
        contrato: 'CLT',
        area: 'Tecnologia',
        nivel: 'Pleno',
        salario: 'R$ 6.000 – R$ 9.000',
        destaque: true,
        diasAtras: 2,
        descricao: `Estamos em busca de um(a) Desenvolvedor(a) Front-End React para integrar nosso time de engenharia em expansão. Você trabalhará na construção de produtos digitais que impactam milhares de usuários, com autonomia e metodologias ágeis.

Se você é apaixonado(a) por criar interfaces bonitas, performáticas e acessíveis, esse é o seu lugar! Nossa equipe é colaborativa, focada em crescimento técnico e valoriza boas práticas de desenvolvimento.`,
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
        sobreEmpresa: `A TechBrasil Ltda. é uma empresa de tecnologia fundada em 2018, especializada em soluções SaaS para o mercado financeiro. Com mais de 200 clientes ativos e operações em 12 estados brasileiros, somos referência em inovação e experiência do usuário.

Nosso time é composto por mais de 80 profissionais apaixonados por tecnologia, com cultura de aprendizado contínuo, autonomia e respeito à diversidade.`,
        setorEmpresa: 'Tecnologia / SaaS Financeiro',
        tamanhoEmpresa: '51–200 funcionários',
        dataPublicacao: '2026-03-05',
        dataExpiracao: '2026-04-05',
        candidaturas: 47,
        whatsapp: '5511999998888',
        email: 'vagas@techbrasil.com.br',
        website: 'https://techbrasil.com.br',
    },
    '8': {
        id: '8',
        titulo: 'Desenvolvedor Back-End Node.js',
        empresa: 'FinTech Boost',
        local: 'Remoto',
        modalidade: 'Remoto',
        contrato: 'PJ',
        area: 'Tecnologia',
        nivel: 'Sênior',
        salario: 'R$ 10.000 – R$ 16.000',
        destaque: true,
        diasAtras: 0,
        descricao: `A FinTech Boost é uma startup de pagamentos digitais em rápido crescimento e buscamos um(a) Desenvolvedor(a) Back-End Sênior para liderar o desenvolvimento da nossa infraestrutura de APIs.

Você será responsável pela arquitetura de microsserviços que processam mais de 500 mil transações por dia, com foco em escalabilidade, segurança e alta disponibilidade.`,
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
        sobreEmpresa: `A FinTech Boost nasceu em 2021 com a missão de democratizar pagamentos digitais para pequenos negócios. Em apenas 3 anos, conquistamos mais de 40 mil lojistas em todo o Brasil e processamos R$ 2 bilhões em transações por ano.

Somos uma empresa diversa, com cultura de ownership e crescimento acelerado.`,
        setorEmpresa: 'Fintech / Pagamentos Digitais',
        tamanhoEmpresa: '11–50 funcionários',
        dataPublicacao: '2026-03-07',
        dataExpiracao: '2026-04-07',
        candidaturas: 12,
        whatsapp: '5511988887777',
        email: 'tech@fintechboost.com.br',
        website: 'https://fintechboost.com.br',
    },
}

/** Retorna detalhamento de uma vaga pelo ID (mock → substituir por Supabase) */
export function getVagaDetalhe(id: string): VagaDetalhe | null {
    // Se tiver mock específico, usa; senão cria um genérico a partir do VAGAS_MOCK
    if (VAGAS_DETALHE_MOCK[id]) return VAGAS_DETALHE_MOCK[id]

    const base = VAGAS_MOCK.find(v => v.id === id)
    if (!base) return null

    return {
        ...base,
        descricao: `Esta é uma excelente oportunidade para profissionais da área de ${base.area} que desejam crescer em uma empresa sólida e inovadora.`,
        responsabilidades: ['Executar as atividades da função', 'Colaborar com a equipe', 'Reportar resultados ao gestor'],
        requisitos: ['Experiência na área', 'Proatividade e boa comunicação'],
        diferenciais: ['Experiência no setor', 'Pós-graduação na área'],
        beneficios: ['Vale refeição', 'Plano de saúde', 'Vale transporte'],
        sobreEmpresa: `Empresa consolidada no mercado, referência no segmento de ${base.area}.`,
        setorEmpresa: base.area,
        tamanhoEmpresa: '51–200 funcionários',
        dataPublicacao: '2026-03-01',
        dataExpiracao: '2026-04-01',
        candidaturas: 25,
        email: 'vagas@empresa.com.br',
    }
}

// ─────────────────────────────────────────────────────────────
// Opções de filtro
// ─────────────────────────────────────────────────────────────
export const FILTER_AREAS = ['Todas', 'Tecnologia', 'Marketing', 'Vendas', 'Saúde', 'Educação', 'Engenharia'] as const
export const FILTER_MODALIDADES = ['Todas', 'Remoto', 'Presencial', 'Híbrido'] as const
export const FILTER_CONTRATOS = ['Todos', 'CLT', 'PJ', 'Freelance', 'Estágio'] as const
export const FILTER_NIVEIS = ['Todos', 'Estágio', 'Júnior', 'Pleno', 'Sênior'] as const

// ─────────────────────────────────────────────────────────────
// Estado de filtros (tipo compartilhado entre componentes)
// ─────────────────────────────────────────────────────────────
export interface FiltrosState {
    area: string
    modalidade: string
    contrato: string
    nivel: string
    apenasDestaque: boolean
}

export const FILTROS_INICIAL: FiltrosState = {
    area: 'Todas',
    modalidade: 'Todas',
    contrato: 'Todos',
    nivel: 'Todos',
    apenasDestaque: false,
}

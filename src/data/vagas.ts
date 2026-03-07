// ─────────────────────────────────────────────────────────────
// Tipo local para a listagem de vagas (dados de UI)
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
// Dados mockados — substituir por chamada de API/Supabase
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

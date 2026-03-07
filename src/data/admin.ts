// ─────────────────────────────────────────────────────────────
// Dados mock para dashboards admin e empregador
// ─────────────────────────────────────────────────────────────

export interface StatCard {
    label: string
    valor: string
    variacao: string
    positivo: boolean
}

export interface AtividadeRecente {
    id: number
    tipo: 'candidatura' | 'vaga_publicada' | 'vaga_expirada' | 'novo_usuario' | 'empresa_cadastro'
    descricao: string
    tempo: string
}

export interface VagaAdmin {
    id: number
    titulo: string
    empresa: string
    local: string
    modalidade: string
    candidaturas: number
    status: 'ativa' | 'pausada' | 'expirada'
    dataPublicacao: string
}

export interface UsuarioAdmin {
    id: number
    nome: string
    email: string
    tipo: 'candidato' | 'empresa'
    dataCadastro: string
    status: 'ativo' | 'inativo'
}

// ── Stats Admin ─────────────────────────────────
export const ADMIN_STATS: StatCard[] = [
    { label: 'Total de Vagas', valor: '1.248', variacao: '+12%', positivo: true },
    { label: 'Candidatos', valor: '45.320', variacao: '+8.5%', positivo: true },
    { label: 'Empresas', valor: '356', variacao: '+4%', positivo: true },
    { label: 'Candidaturas Hoje', valor: '892', variacao: '-2%', positivo: false },
]

// ── Stats Empregador ────────────────────────────
export const EMPREGADOR_STATS: StatCard[] = [
    { label: 'Vagas Ativas', valor: '12', variacao: '+2', positivo: true },
    { label: 'Candidaturas', valor: '347', variacao: '+23%', positivo: true },
    { label: 'Visualizações', valor: '8.920', variacao: '+15%', positivo: true },
    { label: 'Entrevistas', valor: '28', variacao: '+5', positivo: true },
]

// ── Atividades Admin ────────────────────────────
export const ADMIN_ATIVIDADES: AtividadeRecente[] = [
    { id: 1, tipo: 'candidatura', descricao: 'Maria Silva candidatou-se para Desenvolvedor Front-End na TechBrasil', tempo: '2 min atrás' },
    { id: 2, tipo: 'vaga_publicada', descricao: 'Nova vaga publicada: UX Designer na StartupX', tempo: '15 min atrás' },
    { id: 3, tipo: 'novo_usuario', descricao: 'Novo candidato cadastrado: João Santos', tempo: '32 min atrás' },
    { id: 4, tipo: 'empresa_cadastro', descricao: 'Nova empresa cadastrada: Digital Solutions Ltda', tempo: '1h atrás' },
    { id: 5, tipo: 'vaga_expirada', descricao: 'Vaga expirada: Analista de Dados na DataCorp', tempo: '2h atrás' },
    { id: 6, tipo: 'candidatura', descricao: 'Ana Costa candidatou-se para Gerente Comercial no Grupo Expansão', tempo: '3h atrás' },
    { id: 7, tipo: 'vaga_publicada', descricao: 'Nova vaga publicada: Engenheiro de Software na CloudTech', tempo: '4h atrás' },
    { id: 8, tipo: 'novo_usuario', descricao: 'Novo candidato cadastrado: Pedro Lima', tempo: '5h atrás' },
]

// ── Atividades Empregador ───────────────────────
export const EMPREGADOR_ATIVIDADES: AtividadeRecente[] = [
    { id: 1, tipo: 'candidatura', descricao: 'Maria Silva candidatou-se para Desenvolvedor Front-End', tempo: '2 min atrás' },
    { id: 2, tipo: 'candidatura', descricao: 'Carlos Oliveira candidatou-se para UX Designer', tempo: '18 min atrás' },
    { id: 3, tipo: 'candidatura', descricao: 'Ana Costa candidatou-se para Gerente Comercial', tempo: '45 min atrás' },
    { id: 4, tipo: 'candidatura', descricao: 'Pedro Lima candidatou-se para Analista de Dados', tempo: '1h atrás' },
    { id: 5, tipo: 'candidatura', descricao: 'Fernanda Rocha candidatou-se para Desenvolvedor Front-End', tempo: '2h atrás' },
    { id: 6, tipo: 'candidatura', descricao: 'Lucas Souza candidatou-se para DevOps Engineer', tempo: '3h atrás' },
]

// ── Vagas Admin ─────────────────────────────────
export const ADMIN_VAGAS: VagaAdmin[] = [
    { id: 1, titulo: 'Desenvolvedor Front-End React', empresa: 'TechBrasil Ltda.', local: 'São Paulo, SP', modalidade: 'Remoto', candidaturas: 47, status: 'ativa', dataPublicacao: '2026-02-28' },
    { id: 2, titulo: 'UX/UI Designer Senior', empresa: 'StartupX', local: 'Rio de Janeiro, RJ', modalidade: 'Híbrido', candidaturas: 23, status: 'ativa', dataPublicacao: '2026-03-01' },
    { id: 3, titulo: 'Gerente Comercial', empresa: 'Grupo Expansão', local: 'Belo Horizonte, MG', modalidade: 'Presencial', candidaturas: 25, status: 'ativa', dataPublicacao: '2026-02-25' },
    { id: 4, titulo: 'Analista de Dados Python', empresa: 'DataCorp', local: 'Curitiba, PR', modalidade: 'Remoto', candidaturas: 38, status: 'expirada', dataPublicacao: '2026-02-10' },
    { id: 5, titulo: 'DevOps Engineer', empresa: 'CloudTech', local: 'Florianópolis, SC', modalidade: 'Remoto', candidaturas: 15, status: 'ativa', dataPublicacao: '2026-03-05' },
    { id: 6, titulo: 'Product Manager', empresa: 'InnovateBR', local: 'São Paulo, SP', modalidade: 'Híbrido', candidaturas: 31, status: 'pausada', dataPublicacao: '2026-02-20' },
]

// ── Vagas Empregador ────────────────────────────
export const EMPREGADOR_VAGAS: VagaAdmin[] = [
    { id: 1, titulo: 'Desenvolvedor Front-End React', empresa: 'Minha Empresa', local: 'São Paulo, SP', modalidade: 'Remoto', candidaturas: 47, status: 'ativa', dataPublicacao: '2026-02-28' },
    { id: 2, titulo: 'UX/UI Designer Senior', empresa: 'Minha Empresa', local: 'São Paulo, SP', modalidade: 'Híbrido', candidaturas: 23, status: 'ativa', dataPublicacao: '2026-03-01' },
    { id: 3, titulo: 'DevOps Engineer', empresa: 'Minha Empresa', local: 'São Paulo, SP', modalidade: 'Remoto', candidaturas: 15, status: 'ativa', dataPublicacao: '2026-03-05' },
    { id: 4, titulo: 'Analista de Dados', empresa: 'Minha Empresa', local: 'São Paulo, SP', modalidade: 'Remoto', candidaturas: 38, status: 'expirada', dataPublicacao: '2026-02-10' },
]

// ── Usuários Admin ──────────────────────────────
export const ADMIN_USUARIOS: UsuarioAdmin[] = [
    { id: 1, nome: 'Maria Silva', email: 'maria@email.com', tipo: 'candidato', dataCadastro: '2026-03-01', status: 'ativo' },
    { id: 2, nome: 'TechBrasil Ltda.', email: 'rh@techbrasil.com', tipo: 'empresa', dataCadastro: '2026-02-28', status: 'ativo' },
    { id: 3, nome: 'João Santos', email: 'joao@email.com', tipo: 'candidato', dataCadastro: '2026-03-05', status: 'ativo' },
    { id: 4, nome: 'Digital Solutions', email: 'contato@digital.com', tipo: 'empresa', dataCadastro: '2026-03-04', status: 'ativo' },
    { id: 5, nome: 'Ana Costa', email: 'ana@email.com', tipo: 'candidato', dataCadastro: '2026-02-15', status: 'inativo' },
]

// ── Dados do gráfico de candidaturas ────────────
export const GRAFICO_CANDIDATURAS = [
    { dia: 'Seg', valor: 120 },
    { dia: 'Ter', valor: 185 },
    { dia: 'Qua', valor: 156 },
    { dia: 'Qui', valor: 210 },
    { dia: 'Sex', valor: 178 },
    { dia: 'Sáb', valor: 92 },
    { dia: 'Dom', valor: 65 },
]

export const GRAFICO_EMPREGADOR = [
    { dia: 'Seg', valor: 18 },
    { dia: 'Ter', valor: 25 },
    { dia: 'Qua', valor: 22 },
    { dia: 'Qui', valor: 31 },
    { dia: 'Sex', valor: 28 },
    { dia: 'Sáb', valor: 12 },
    { dia: 'Dom', valor: 8 },
]

// Helpers
export function getStatusColor(status: string) {
    switch (status) {
        case 'ativa': return { bg: '#e8f5e9', color: '#2e7d32' }
        case 'pausada': return { bg: '#fff3e0', color: '#e65100' }
        case 'expirada': return { bg: '#ffebee', color: '#c62828' }
        default: return { bg: '#e8ecf5', color: '#09355F' }
    }
}

export function getTipoAtividadeIcon(tipo: AtividadeRecente['tipo']) {
    switch (tipo) {
        case 'candidatura': return { emoji: '📋', color: '#2AB9C0' }
        case 'vaga_publicada': return { emoji: '✅', color: '#2e7d32' }
        case 'vaga_expirada': return { emoji: '⏰', color: '#e65100' }
        case 'novo_usuario': return { emoji: '👤', color: '#1565c0' }
        case 'empresa_cadastro': return { emoji: '🏢', color: '#6a1b9a' }
        default: return { emoji: '📌', color: '#09355F' }
    }
}

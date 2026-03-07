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
    salario?: string
    nivel?: string
}

export interface UsuarioAdmin {
    id: number
    nome: string
    email: string
    tipo: 'candidato' | 'empresa'
    dataCadastro: string
    status: 'ativo' | 'inativo'
}

export interface CandidatoAdmin {
    id: number
    nome: string
    email: string
    cargo: string
    local: string
    experiencia: string
    habilidades: string[]
    dataCadastro: string
    status: 'ativo' | 'inativo'
    candidaturas: number
}

export interface EmpresaAdmin {
    id: number
    nome: string
    setor: string
    local: string
    vagasAtivas: number
    totalFuncionarios: string
    dataCadastro: string
    status: 'ativo' | 'inativo'
    plano: 'gratuito' | 'profissional' | 'enterprise'
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

// ── VAGAS (36+ para lazy loading) ───────────────
const _TITULOS = ['Desenvolvedor Front-End React', 'UX/UI Designer Senior', 'Gerente Comercial', 'Analista de Dados Python', 'DevOps Engineer', 'Product Manager', 'Engenheiro de Software', 'Analista de Marketing Digital', 'Desenvolvedor Back-End Node.js', 'Scrum Master', 'QA Engineer', 'Designer Gráfico', 'Analista Financeiro', 'Consultor SAP', 'Arquiteto de Software', 'Tech Lead', 'Desenvolvedor Full-Stack', 'Analista de RH', 'Gerente de Projetos', 'Coordenador de TI']
const _EMPRESAS = ['TechBrasil Ltda.', 'StartupX', 'Grupo Expansão', 'DataCorp', 'CloudTech', 'InnovateBR', 'Digital Solutions', 'MaxSoft', 'BrasilCode', 'FutureApps', 'NetPrime', 'SmartHR', 'CoreTech', 'BlueWave', 'AlphaDigital']
const _CIDADES = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Florianópolis, SC', 'Porto Alegre, RS', 'Brasília, DF', 'Recife, PE', 'Salvador, BA', 'Campinas, SP']
const _MODALIDADES = ['Remoto', 'Híbrido', 'Presencial']
const _STATUS_VAGA: ('ativa' | 'pausada' | 'expirada')[] = ['ativa', 'ativa', 'ativa', 'pausada', 'expirada']
const _NIVEIS = ['Júnior', 'Pleno', 'Sênior', 'Especialista']
const _SALARIOS = ['R$ 3.000 – R$ 5.000', 'R$ 5.000 – R$ 8.000', 'R$ 8.000 – R$ 12.000', 'R$ 12.000 – R$ 18.000', 'R$ 15.000 – R$ 25.000', 'A combinar']

function gerarVagas(qtd: number): VagaAdmin[] {
    return Array.from({ length: qtd }, (_, i) => ({
        id: i + 1,
        titulo: _TITULOS[i % _TITULOS.length],
        empresa: _EMPRESAS[i % _EMPRESAS.length],
        local: _CIDADES[i % _CIDADES.length],
        modalidade: _MODALIDADES[i % _MODALIDADES.length],
        candidaturas: Math.floor(Math.random() * 80) + 5,
        status: _STATUS_VAGA[i % _STATUS_VAGA.length],
        dataPublicacao: `2026-0${(i % 3) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
        salario: _SALARIOS[i % _SALARIOS.length],
        nivel: _NIVEIS[i % _NIVEIS.length],
    }))
}

export const TODAS_VAGAS: VagaAdmin[] = gerarVagas(42)
export const ADMIN_VAGAS: VagaAdmin[] = TODAS_VAGAS.slice(0, 6)
export const EMPREGADOR_VAGAS: VagaAdmin[] = TODAS_VAGAS.slice(0, 4).map(v => ({ ...v, empresa: 'Minha Empresa' }))

// ── CANDIDATOS (36+ para lazy loading) ──────────
const _NOMES = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Lima', 'Fernanda Rocha', 'Lucas Souza', 'Carla Mendes', 'Rafael Alves', 'Beatriz Ferreira', 'Gabriel Martins', 'Juliana Oliveira', 'Marcos Ribeiro', 'Patricia Gomes', 'Thiago Barbosa', 'Camila Nascimento', 'Bruno Pereira', 'Larissa Cardoso', 'Felipe Araújo', 'Amanda Duarte', 'Roberto Vieira', 'Isabela Moreira', 'Diego Castro', 'Letícia Correia', 'André Teixeira', 'Vanessa Pinto', 'Gustavo Lopes', 'Renata Dias', 'Eduardo Nunes', 'Daniela Freitas', 'Matheus Santos', 'Cristina Reis', 'Leonardo Azevedo', 'Priscila Melo', 'Rodrigo Monteiro', 'Aline Campos', 'Victor Hugo', 'Sabrina Costa', 'Henrique Lima', 'Natália Souza', 'Caio Fernandes']
const _CARGOS = ['Desenvolvedor Front-End', 'Desenvolvedor Back-End', 'Full-Stack Developer', 'UX Designer', 'Product Manager', 'Analista de Dados', 'DevOps Engineer', 'QA Analyst', 'Scrum Master', 'Tech Lead', 'Designer Gráfico', 'Analista de Marketing', 'Gerente de Projetos', 'Arquiteto de Software', 'Analista de RH']
const _EXPERIENCIAS = ['1 ano', '2 anos', '3 anos', '4 anos', '5 anos', '6+ anos', '8+ anos', '10+ anos']
const _HABILIDADES_POOL = ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Figma', 'SQL', 'MongoDB', 'Git', 'Scrum', 'Next.js', 'Tailwind', 'GraphQL', 'Kubernetes', 'Go', 'Vue.js', 'Angular', 'PostgreSQL']

function gerarCandidatos(qtd: number): CandidatoAdmin[] {
    return Array.from({ length: qtd }, (_, i) => ({
        id: i + 1,
        nome: _NOMES[i % _NOMES.length],
        email: _NOMES[i % _NOMES.length].toLowerCase().replace(' ', '.') + '@email.com',
        cargo: _CARGOS[i % _CARGOS.length],
        local: _CIDADES[i % _CIDADES.length],
        experiencia: _EXPERIENCIAS[i % _EXPERIENCIAS.length],
        habilidades: [_HABILIDADES_POOL[(i * 3) % _HABILIDADES_POOL.length], _HABILIDADES_POOL[(i * 3 + 1) % _HABILIDADES_POOL.length], _HABILIDADES_POOL[(i * 3 + 2) % _HABILIDADES_POOL.length]],
        dataCadastro: `2026-0${(i % 3) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
        status: (i % 7 === 0 ? 'inativo' : 'ativo') as 'ativo' | 'inativo',
        candidaturas: Math.floor(Math.random() * 15) + 1,
    }))
}

export const TODOS_CANDIDATOS: CandidatoAdmin[] = gerarCandidatos(40)

// ── EMPRESAS (36+ para lazy loading) ────────────
const _SETORES = ['Tecnologia', 'Finanças', 'Saúde', 'Educação', 'Varejo', 'Indústria', 'Consultoria', 'Logística', 'Marketing', 'Energia']
const _FUNCIONARIOS = ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+']
const _PLANOS: ('gratuito' | 'profissional' | 'enterprise')[] = ['gratuito', 'profissional', 'profissional', 'enterprise']
const _NOMES_EMPRESA = ['TechBrasil Ltda.', 'StartupX', 'Grupo Expansão', 'DataCorp', 'CloudTech', 'InnovateBR', 'Digital Solutions', 'MaxSoft', 'BrasilCode', 'FutureApps', 'NetPrime', 'SmartHR', 'CoreTech', 'BlueWave', 'AlphaDigital', 'VisionTech', 'SkyLab', 'CodeNation', 'DevHouse', 'PixelForge', 'ByteWorks', 'AppMasters', 'NeoSoft', 'WebForce', 'DataDriven', 'CloudBase', 'TechPulse', 'DigiLogic', 'SoftEdge', 'InfoPlus', 'CyberHub', 'MegaByte', 'CodeCraft', 'SmartBiz', 'GoDigital', 'NextGen Corp', 'Quantum Labs', 'DataStream', 'LogicWare', 'TrueCode']

function gerarEmpresas(qtd: number): EmpresaAdmin[] {
    return Array.from({ length: qtd }, (_, i) => ({
        id: i + 1,
        nome: _NOMES_EMPRESA[i % _NOMES_EMPRESA.length],
        setor: _SETORES[i % _SETORES.length],
        local: _CIDADES[i % _CIDADES.length],
        vagasAtivas: Math.floor(Math.random() * 12),
        totalFuncionarios: _FUNCIONARIOS[i % _FUNCIONARIOS.length],
        dataCadastro: `2026-0${(i % 3) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
        status: (i % 8 === 0 ? 'inativo' : 'ativo') as 'ativo' | 'inativo',
        plano: _PLANOS[i % _PLANOS.length],
    }))
}

export const TODAS_EMPRESAS: EmpresaAdmin[] = gerarEmpresas(40)

// ── Usuários Admin (dashboard) ──────────────────
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

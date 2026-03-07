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

export function getStatusCandidaturaColor(status: string) {
    switch (status) {
        case 'aprovado': return { bg: '#e8f5e9', color: '#2e7d32', label: 'Aprovado' }
        case 'recusado': return { bg: '#ffebee', color: '#c62828', label: 'Recusado' }
        case 'entrevista': return { bg: '#e3f2fd', color: '#1565c0', label: 'Entrevista' }
        case 'em_analise': return { bg: '#fff3e0', color: '#e65100', label: 'Em Análise' }
        case 'pendente': return { bg: '#f3e8ff', color: '#7c3aed', label: 'Pendente' }
        default: return { bg: '#e8ecf5', color: '#09355F', label: status }
    }
}

// ── Dados de Relatórios ──────────────────────────
export const RELATORIO_KPIS = [
    { label: 'Novas Vagas', valor: 127, anterior: 98, icon: 'briefcase' },
    { label: 'Novos Candidatos', valor: 342, anterior: 285, icon: 'users' },
    { label: 'Candidaturas', valor: 1284, anterior: 1150, icon: 'filetext' },
    { label: 'Taxa de Conversão', valor: 18.5, anterior: 15.2, icon: 'trendingup', sufixo: '%' },
]

export const RELATORIO_VAGAS_MES = [
    { mes: 'Set', vagas: 45, candidaturas: 380 },
    { mes: 'Out', vagas: 62, candidaturas: 510 },
    { mes: 'Nov', vagas: 78, candidaturas: 620 },
    { mes: 'Dez', vagas: 55, candidaturas: 480 },
    { mes: 'Jan', vagas: 98, candidaturas: 870 },
    { mes: 'Fev', vagas: 115, candidaturas: 1050 },
    { mes: 'Mar', vagas: 127, candidaturas: 1284 },
]

export const RELATORIO_STATUS_CANDIDATURAS = [
    { status: 'Pendente', valor: 385, color: '#7c3aed' },
    { status: 'Em Análise', valor: 312, color: '#e65100' },
    { status: 'Entrevista', valor: 245, color: '#1565c0' },
    { status: 'Aprovado', valor: 198, color: '#2e7d32' },
    { status: 'Recusado', valor: 144, color: '#c62828' },
]

export const RELATORIO_TOP_VAGAS = [
    { titulo: 'Desenvolvedor Full-Stack Senior', empresa: 'TechBrasil Ltda.', candidaturas: 89 },
    { titulo: 'UX/UI Designer Senior', empresa: 'StartupX', candidaturas: 76 },
    { titulo: 'DevOps Engineer', empresa: 'CloudNine', candidaturas: 68 },
    { titulo: 'Product Manager', empresa: 'InnovateBR', candidaturas: 62 },
    { titulo: 'Analista de Dados Python', empresa: 'DataCorp', candidaturas: 57 },
]

export const RELATORIO_CANDIDATOS_CIDADE = [
    { cidade: 'São Paulo', total: 128 },
    { cidade: 'Rio de Janeiro', total: 85 },
    { cidade: 'Belo Horizonte', total: 42 },
    { cidade: 'Curitiba', total: 35 },
    { cidade: 'Porto Alegre', total: 28 },
    { cidade: 'Florianópolis', total: 24 },
]

export const RELATORIO_EMPRESAS_PLANO = [
    { plano: 'Gratuito', valor: 22, color: '#94a3b8' },
    { plano: 'Profissional', valor: 12, color: '#2AB9C0' },
    { plano: 'Enterprise', valor: 6, color: '#FE8341' },
]

export const RELATORIO_TOP_EMPRESAS = [
    { nome: 'TechBrasil Ltda.', vagas: 18, contratacoes: 12, plano: 'enterprise' as const },
    { nome: 'StartupX', vagas: 14, contratacoes: 9, plano: 'profissional' as const },
    { nome: 'CloudNine', vagas: 11, contratacoes: 7, plano: 'enterprise' as const },
    { nome: 'InnovateBR', vagas: 9, contratacoes: 6, plano: 'profissional' as const },
    { nome: 'DataCorp', vagas: 8, contratacoes: 4, plano: 'gratuito' as const },
]

export const RELATORIO_AREAS_BUSCADAS = [
    { area: 'Desenvolvimento', porcentagem: 38 },
    { area: 'Design', porcentagem: 18 },
    { area: 'Dados/Analytics', porcentagem: 15 },
    { area: 'DevOps/Infra', porcentagem: 12 },
    { area: 'Produto', porcentagem: 9 },
    { area: 'Marketing', porcentagem: 8 },
]

// ── Detalhe do Candidato (currículo completo) ────
export interface ExperienciaProfissional {
    id: number
    cargo: string
    empresa: string
    periodo: string
    atual: boolean
    descricao: string
}

export interface FormacaoAcademica {
    id: number
    curso: string
    instituicao: string
    periodo: string
    tipo: 'Graduação' | 'Pós-Graduação' | 'MBA' | 'Mestrado' | 'Doutorado' | 'Curso Técnico' | 'Certificação'
}

export interface DocumentoAnexo {
    id: number
    nome: string
    tipo: 'pdf' | 'doc' | 'img' | 'zip'
    tamanho: string
    dataUpload: string
}

export interface IdiomaItem {
    idioma: string
    nivel: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo'
}

export interface CandidatoDetalhe extends CandidatoAdmin {
    sobrenome: string
    telefone: string
    celular: string
    dataNascimento: string
    cpf: string
    bio: string
    linkedin: string
    github: string
    website: string
    pretensaoSalarial: string
    disponibilidade: string
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    formacoes: FormacaoAcademica[]
    experiencias: ExperienciaProfissional[]
    idiomas: IdiomaItem[]
    documentos: DocumentoAnexo[]
    candidaturasDetalhes: { vaga: string; empresa: string; data: string; status: 'pendente' | 'em_analise' | 'entrevista' | 'aprovado' | 'recusado' }[]
}

export function getCandidatoDetalhe(slug: string): CandidatoDetalhe | undefined {
    const id = parseInt(slug)
    const candidato = TODOS_CANDIDATOS.find(c => c.id === id)
    if (!candidato) return undefined

    const nomePartes = candidato.nome.split(' ')

    return {
        ...candidato,
        sobrenome: nomePartes.length > 1 ? nomePartes.slice(1).join(' ') : '',
        telefone: `(${11 + (id % 10)}) ${3000 + id}-${1000 + id * 3}`,
        celular: `(${11 + (id % 10)}) 9${8000 + id}-${2000 + id * 2}`,
        dataNascimento: `19${85 + (id % 15)}-0${(id % 12) + 1}-${String((id % 28) + 1).padStart(2, '0')}`,
        cpf: `${String(100 + id).slice(0, 3)}.${String(400 + id).slice(0, 3)}.${String(700 + id).slice(0, 3)}-${String(10 + (id % 90)).slice(0, 2)}`,
        bio: `Profissional ${candidato.cargo} com ${candidato.experiencia} de experiência no mercado de tecnologia. Apaixonado por criar soluções inovadoras e colaborar com equipes multidisciplinares. Busco constantemente me atualizar com as melhores práticas e novas tecnologias do setor.`,
        linkedin: `https://linkedin.com/in/${candidato.nome.toLowerCase().replace(' ', '-')}`,
        github: `https://github.com/${candidato.nome.toLowerCase().replace(' ', '')}`,
        website: id % 3 === 0 ? `https://${candidato.nome.toLowerCase().replace(' ', '')}.dev` : '',
        pretensaoSalarial: _SALARIOS[id % _SALARIOS.length],
        disponibilidade: id % 3 === 0 ? 'Imediata' : id % 3 === 1 ? '15 dias' : '30 dias',
        cep: `0${1000 + id * 10}-${100 + id}`,
        logradouro: ['Rua das Flores', 'Av. Brasil', 'Rua Augusta', 'Av. Paulista', 'Rua XV de Novembro'][id % 5],
        numero: String(100 + id * 7),
        complemento: id % 2 === 0 ? `Apto ${100 + id}` : '',
        bairro: ['Centro', 'Jardins', 'Bela Vista', 'Copacabana', 'Boa Viagem'][id % 5],
        cidade: candidato.local.split(',')[0].trim(),
        estado: candidato.local.split(',')[1]?.trim() || 'SP',
        formacoes: [
            {
                id: 1,
                curso: ['Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação', 'Design Digital', 'Administração'][id % 5],
                instituicao: ['USP', 'UNICAMP', 'UFMG', 'UFRJ', 'PUC-SP', 'FIAP', 'Mackenzie'][id % 7],
                periodo: `20${String(10 + (id % 5)).padStart(2, '0')} – 20${String(14 + (id % 5)).padStart(2, '0')}`,
                tipo: 'Graduação' as const,
            },
            ...(id % 2 === 0 ? [{
                id: 2,
                curso: ['Gestão de Projetos', 'Inteligência Artificial', 'UX Research', 'Data Science', 'Cloud Computing'][id % 5],
                instituicao: ['USP', 'FGV', 'FIAP', 'Coursera', 'MIT OpenCourseWare'][id % 5],
                periodo: `20${String(18 + (id % 3)).padStart(2, '0')} – 20${String(19 + (id % 3)).padStart(2, '0')}`,
                tipo: 'Pós-Graduação' as const,
            }] : []),
            ...(id % 4 === 0 ? [{
                id: 3,
                curso: ['AWS Solutions Architect', 'Google Cloud Professional', 'Scrum Master Certified', 'PMP', 'Kubernetes Administrator'][id % 5],
                instituicao: ['AWS', 'Google', 'Scrum Alliance', 'PMI', 'CNCF'][id % 5],
                periodo: `2024`,
                tipo: 'Certificação' as const,
            }] : []),
        ],
        experiencias: [
            {
                id: 1,
                cargo: candidato.cargo,
                empresa: _EMPRESAS[id % _EMPRESAS.length],
                periodo: '2023 – Atual',
                atual: true,
                descricao: `Responsável pelo desenvolvimento e manutenção de aplicações web utilizando ${candidato.habilidades.join(', ')}. Colaboração com equipe de produto para definir requisitos e implementar novas funcionalidades.`,
            },
            {
                id: 2,
                cargo: `${candidato.cargo} Júnior`,
                empresa: _EMPRESAS[(id + 3) % _EMPRESAS.length],
                periodo: '2021 – 2023',
                atual: false,
                descricao: 'Desenvolvimento de interfaces responsivas e integração com APIs REST. Participação em code reviews e implementação de testes unitários e de integração.',
            },
            ...(id % 3 === 0 ? [{
                id: 3,
                cargo: 'Estagiário de Desenvolvimento',
                empresa: _EMPRESAS[(id + 7) % _EMPRESAS.length],
                periodo: '2020 – 2021',
                atual: false,
                descricao: 'Apoio no desenvolvimento de funcionalidades e correção de bugs. Aprendizado de metodologias ágeis e boas práticas de programação.',
            }] : []),
        ],
        idiomas: [
            { idioma: 'Português', nivel: 'Nativo' },
            { idioma: 'Inglês', nivel: (['Intermediário', 'Avançado', 'Fluente'] as const)[id % 3] },
            ...(id % 3 === 0 ? [{ idioma: 'Espanhol', nivel: 'Básico' as const }] : []),
        ],
        documentos: [
            { id: 1, nome: `curriculo_${candidato.nome.toLowerCase().replace(' ', '_')}.pdf`, tipo: 'pdf' as const, tamanho: `${120 + id * 3}KB`, dataUpload: '2026-02-15' },
            { id: 2, nome: 'certificado_graduacao.pdf', tipo: 'pdf' as const, tamanho: `${250 + id * 5}KB`, dataUpload: '2026-01-20' },
            ...(id % 2 === 0 ? [{ id: 3, nome: 'portfolio.pdf', tipo: 'pdf' as const, tamanho: `${1.2 + (id % 5) * 0.3}MB`, dataUpload: '2026-02-28' }] : []),
            ...(id % 3 === 0 ? [{ id: 4, nome: 'carta_recomendacao.pdf', tipo: 'pdf' as const, tamanho: `${80 + id * 2}KB`, dataUpload: '2026-03-01' }] : []),
            ...(id % 4 === 0 ? [{ id: 5, nome: 'certificados_cursos.zip', tipo: 'zip' as const, tamanho: `${2.5 + (id % 3)}MB`, dataUpload: '2026-02-10' }] : []),
        ],
        candidaturasDetalhes: [
            { vaga: _TITULOS[id % _TITULOS.length], empresa: _EMPRESAS[id % _EMPRESAS.length], data: '2026-03-05', status: 'em_analise' as const },
            { vaga: _TITULOS[(id + 3) % _TITULOS.length], empresa: _EMPRESAS[(id + 2) % _EMPRESAS.length], data: '2026-02-28', status: 'entrevista' as const },
            { vaga: _TITULOS[(id + 6) % _TITULOS.length], empresa: _EMPRESAS[(id + 4) % _EMPRESAS.length], data: '2026-02-15', status: (['aprovado', 'recusado', 'pendente'] as const)[id % 3] },
        ],
    }
}

// ── Detalhe da Vaga ──────────────────────────────
export interface VagaDetalhe extends VagaAdmin {
    descricao: string
    requisitos: string[]
    diferenciais: string[]
    beneficios: string[]
    responsabilidades: string[]
    regime: string
    horario: string
    candidatosRecentes: { id: number; nome: string; cargo: string; data: string; status: 'pendente' | 'em_analise' | 'entrevista' | 'aprovado' | 'recusado' }[]
}

const _BENEFICIOS = ['Vale Refeição', 'Vale Transporte', 'Plano de Saúde', 'Plano Odontológico', 'Gympass', 'Day Off no Aniversário', 'Home Office', 'PLR', 'Seguro de Vida', 'Auxílio Home Office', 'Horário Flexível', 'Stock Options']
const _REQUISITOS_POOL = ['Experiência com metodologias ágeis (Scrum/Kanban)', 'Conhecimento em Git e versionamento de código', 'Experiência com bancos de dados relacionais e NoSQL', 'Inglês intermediário ou superior', 'Experiência em trabalho remoto', 'Capacidade de comunicação e trabalho em equipe', 'Conhecimento em Cloud (AWS, GCP ou Azure)', 'Experiência com CI/CD e DevOps', 'Domínio de testes automatizados', 'Conhecimento em arquitetura de microsserviços']

export function getVagaDetalhe(slug: string): VagaDetalhe | undefined {
    const id = parseInt(slug)
    const vaga = TODAS_VAGAS.find(v => v.id === id)
    if (!vaga) return undefined

    return {
        ...vaga,
        descricao: `Estamos em busca de um(a) ${vaga.titulo} para integrar nosso time de ${vaga.modalidade === 'Remoto' ? 'trabalho remoto' : vaga.local}. A pessoa ideal será responsável por contribuir com projetos inovadores, colaborando com equipes multidisciplinares para entregar soluções de alto impacto.\n\nSe você é apaixonado(a) por tecnologia e busca um ambiente dinâmico e colaborativo, essa vaga é para você!`,
        requisitos: [
            `${(id % 3) + 2}+ anos de experiência na área`,
            _REQUISITOS_POOL[id % _REQUISITOS_POOL.length],
            _REQUISITOS_POOL[(id + 3) % _REQUISITOS_POOL.length],
            _REQUISITOS_POOL[(id + 5) % _REQUISITOS_POOL.length],
            `Formação em ${['Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação', 'áreas correlatas'][id % 4]} ou equivalente`,
        ],
        diferenciais: [
            _REQUISITOS_POOL[(id + 7) % _REQUISITOS_POOL.length],
            `Certificação ${['AWS', 'Google Cloud', 'Scrum', 'PMP'][id % 4]}`,
            'Experiência em startups ou empresas de tecnologia',
        ],
        beneficios: [
            _BENEFICIOS[id % _BENEFICIOS.length],
            _BENEFICIOS[(id + 1) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 3) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 5) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 7) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 9) % _BENEFICIOS.length],
        ],
        responsabilidades: [
            'Desenvolver e manter aplicações de alta qualidade',
            'Participar de revisões de código e contribuir para a melhoria contínua',
            'Colaborar com designers e product managers na definição de requisitos',
            'Garantir a qualidade e performance das entregas',
            'Documentar processos e soluções técnicas',
        ],
        regime: ['CLT', 'PJ', 'CLT'][id % 3],
        horario: vaga.modalidade === 'Remoto' ? 'Flexível' : '09h às 18h',
        candidatosRecentes: Array.from({ length: Math.min(vaga.candidaturas, 6) }, (_, i) => ({
            id: (id * 10) + i + 1,
            nome: _NOMES[(id + i) % _NOMES.length],
            cargo: _CARGOS[(id + i) % _CARGOS.length],
            data: `2026-0${(i % 3) + 1}-${String((i % 28) + 5).padStart(2, '0')}`,
            status: (['pendente', 'em_analise', 'entrevista', 'aprovado', 'recusado'] as const)[i % 5],
        })),
    }
}

// ── Detalhe da Empresa ───────────────────────────
export interface EmpresaDetalhe extends EmpresaAdmin {
    descricao: string
    website: string
    email: string
    telefone: string
    cnpj: string
    fundacao: string
    linkedin: string
    endereco: string
    vagasPublicadas: { id: number; titulo: string; modalidade: string; candidaturas: number; status: 'ativa' | 'pausada' | 'expirada' }[]
    beneficiosOferecidos: string[]
    tecnologiasUsadas: string[]
}

export function getEmpresaDetalhe(slug: string): EmpresaDetalhe | undefined {
    const id = parseInt(slug)
    const empresa = TODAS_EMPRESAS.find(e => e.id === id)
    if (!empresa) return undefined

    return {
        ...empresa,
        descricao: `A ${empresa.nome} é uma empresa líder no setor de ${empresa.setor}, com sede em ${empresa.local}. Com um time de ${empresa.totalFuncionarios} colaboradores, trabalhamos com as mais modernas tecnologias para entregar soluções inovadoras ao mercado.\n\nNosso objetivo é transformar o futuro do ${empresa.setor.toLowerCase()} no Brasil através de produtos e serviços de alta qualidade.`,
        website: `https://www.${empresa.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        email: `rh@${empresa.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        telefone: `(${11 + (id % 10)}) ${3000 + id}-${4000 + id * 2}`,
        cnpj: `${String(10 + id).slice(0, 2)}.${String(100 + id * 3).slice(0, 3)}.${String(200 + id * 7).slice(0, 3)}/0001-${String(10 + (id % 90)).slice(0, 2)}`,
        fundacao: `20${String(10 + (id % 14)).padStart(2, '0')}`,
        linkedin: `https://linkedin.com/company/${empresa.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        endereco: `${['Rua das Flores', 'Av. Brasil', 'Rua Augusta', 'Av. Paulista', 'Rua XV de Novembro'][id % 5]}, ${100 + id * 11} – ${['Centro', 'Jardins', 'Bela Vista', 'Vila Olímpia', 'Pinheiros'][id % 5]}, ${empresa.local}`,
        vagasPublicadas: Array.from({ length: Math.max(empresa.vagasAtivas, 2) }, (_, i) => ({
            id: (id * 100) + i + 1,
            titulo: _TITULOS[(id + i) % _TITULOS.length],
            modalidade: _MODALIDADES[(id + i) % _MODALIDADES.length],
            candidaturas: Math.floor(Math.random() * 60) + 3,
            status: (['ativa', 'ativa', 'ativa', 'pausada', 'expirada'] as const)[i % 5],
        })),
        beneficiosOferecidos: [
            _BENEFICIOS[id % _BENEFICIOS.length],
            _BENEFICIOS[(id + 2) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 4) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 6) % _BENEFICIOS.length],
            _BENEFICIOS[(id + 8) % _BENEFICIOS.length],
        ],
        tecnologiasUsadas: [
            _HABILIDADES_POOL[id % _HABILIDADES_POOL.length],
            _HABILIDADES_POOL[(id + 2) % _HABILIDADES_POOL.length],
            _HABILIDADES_POOL[(id + 4) % _HABILIDADES_POOL.length],
            _HABILIDADES_POOL[(id + 6) % _HABILIDADES_POOL.length],
            _HABILIDADES_POOL[(id + 8) % _HABILIDADES_POOL.length],
        ],
    }
}

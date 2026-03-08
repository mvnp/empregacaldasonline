// ── Tipos do usuário e autenticação ──

export type TipoUsuario = 'candidato' | 'empregador' | 'admin'
export type StatusUsuario = 'ativo' | 'inativo' | 'bloqueado'

export interface User {
    id: number
    auth_id: string
    tipo: TipoUsuario
    nome: string
    sobrenome: string | null
    email: string
    telefone: string | null
    avatar_url: string | null
    data_nascimento: string | null
    area_interesse: string | null
    razao_social: string | null
    cnpj: string | null
    setor: string | null
    tamanho_empresa: string | null
    responsavel_rh: string | null
    status: StatusUsuario
    created_at: string
    updated_at: string
}

// ── Permissões por tipo de usuário ──

export const PERMISSOES: Record<TipoUsuario, {
    rotaInicial: string
    rotasPermitidas: string[]
    label: string
}> = {
    admin: {
        rotaInicial: '/admin',
        rotasPermitidas: [
            '/admin',
            '/admin/vagas',
            '/admin/candidatos',
            '/admin/empresas',
            '/admin/relatorios',
            '/admin/configuracoes',
            '/admin/perfil',
        ],
        label: 'Administrador',
    },
    empregador: {
        rotaInicial: '/admin/empregador',
        rotasPermitidas: [
            '/admin/empregador',
            '/admin/empregador/vagas',
            '/admin/empregador/candidatos',
            '/admin/empregador/relatorios',
            '/admin/empregador/configuracoes',
            '/admin/perfil',
        ],
        label: 'Empregador',
    },
    candidato: {
        rotaInicial: '/admin/candidato',
        rotasPermitidas: [
            '/admin/candidato',
            '/admin/candidato/curriculo',
            '/admin/candidato/candidaturas',
            '/admin/candidato/vagas',
            '/admin/candidato/documentos',
            '/admin/candidato/configuracoes',
            '/admin/candidato/perfil',
            '/admin/perfil',
        ],
        label: 'Candidato',
    },
}

// ── Helper: verifica se uma rota é permitida para o tipo de usuário ──
export function rotaPermitida(tipo: TipoUsuario, pathname: string): boolean {
    const permissao = PERMISSOES[tipo]
    return permissao.rotasPermitidas.some(rota =>
        pathname === rota || pathname.startsWith(rota + '/')
    )
}

// ── Helper: retorna a rota inicial do tipo de usuário ──
export function getRotaInicial(tipo: TipoUsuario): string {
    return PERMISSOES[tipo].rotaInicial
}

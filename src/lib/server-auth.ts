import { createServerSupabaseClient, createAdminClient } from './supabase'

/**
 * Utilitário de segurança para garantir que a Server Action está sendo
 * invocada por um usuário genuinamente Autenticado e com a Role de Admin.
 * 
 * Lança um Error nativo que interrompe a execução caso seja um Hacker ou usuário comum.
 * Retorna uma instância do AdminClient configurada e segura para uso se tudo ok.
 */
export async function requireAdmin() {
    const client = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
        throw new Error('Acesso negado: Requisitante não está autenticado.')
    }

    const adminClient = createAdminClient()
    
    // Validar se o UUID autenticado tem registro oficial como administrador na tabela de usuários
    const { data: userData } = await adminClient
        .from('users')
        .select('tipo')
        .eq('auth_id', user.id)
        .single() as { data: any; error: any }

    if (!userData || userData.tipo !== 'admin') {
        throw new Error('Acesso negado: Requisitante não possui privilégios administrativos requeridos.')
    }

    // Se chegou até aqui, é um Admin legítimo. 
    return adminClient
}

/**
 * Similar, mas permite Admin OR Empregador
 */
export async function requireAdminOrEmpregador() {
    const client = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
        throw new Error('Acesso negado: Requisitante não está autenticado.')
    }

    const adminClient = createAdminClient()
    
    const { data: userData } = await adminClient
        .from('users')
        .select('tipo')
        .eq('auth_id', user.id)
        .single() as { data: any; error: any }

    if (!userData || !['admin', 'empregador'].includes(userData.tipo)) {
        throw new Error('Acesso negado: Requisitante não possui privilégios de empresa ou administrador.')
    }

    return { adminClient, userId: user.id }
}

/**
 * Similar, mas apenas para estar autenticado estritamente
 */
export async function requireAuth() {
    const client = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
        throw new Error('Acesso negado: Requisitante não está autenticado.')
    }

    return { userClient: client, user }
}

'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import type { TipoUsuario, User } from '@/types/user'
import { getRotaInicial } from '@/types/user'

// ── Cadastro de Candidato ──
export async function cadastrarCandidato(formData: {
    nome: string
    sobrenome: string
    email: string
    telefone: string
    area: string
    senha: string
}) {
    const supabase = await createServerSupabaseClient()

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
    })

    if (authError || !authData.user) {
        return {
            success: false,
            error: authError?.message === 'User already registered'
                ? 'Este e-mail já está cadastrado.'
                : authError?.message || 'Erro ao criar conta.',
        }
    }

    // 2. Inserir na tabela users vinculando auth_id (admin client bypassa RLS)
    const admin = createAdminClient()
    const { error: dbError } = await admin.from('users').insert({
        auth_id: authData.user.id,
        tipo: 'candidato' as TipoUsuario,
        nome: formData.nome,
        sobrenome: formData.sobrenome || null,
        email: formData.email,
        telefone: formData.telefone || null,
        area_interesse: formData.area || null,
    } as any)

    if (dbError) {
        await admin.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Erro ao criar perfil. Tente novamente.' }
    }

    // 3. Auto-login após cadastro
    await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
    })

    return { success: true, redirectTo: getRotaInicial('candidato') }
}

// ── Cadastro de Empresa ──
export async function cadastrarEmpresa(formData: {
    razaoSocial: string
    cnpj: string
    email: string
    telefone: string
    setor: string
    tamanho: string
    responsavel: string
    senha: string
}) {
    const supabase = await createServerSupabaseClient()

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
    })

    if (authError || !authData.user) {
        return {
            success: false,
            error: authError?.message === 'User already registered'
                ? 'Este e-mail já está cadastrado.'
                : authError?.message || 'Erro ao criar conta.',
        }
    }

    // 2. Inserir na tabela users como empregador (admin client bypassa RLS)
    const admin = createAdminClient()
    const { error: dbError } = await admin.from('users').insert({
        auth_id: authData.user.id,
        tipo: 'empregador' as TipoUsuario,
        nome: formData.responsavel || formData.razaoSocial,
        email: formData.email,
        telefone: formData.telefone || null,
        razao_social: formData.razaoSocial,
        cnpj: formData.cnpj || null,
        setor: formData.setor || null,
        tamanho_empresa: formData.tamanho || null,
        responsavel_rh: formData.responsavel || null,
    } as any)

    if (dbError) {
        await admin.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Erro ao criar perfil da empresa. Tente novamente.' }
    }

    // 3. Auto-login após cadastro
    await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
    })

    return { success: true, redirectTo: getRotaInicial('empregador') }
}

// ── Login ──
export async function login(formData: {
    email: string
    senha: string
}) {
    const supabase = await createServerSupabaseClient()

    // 1. Autenticar no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
    })

    if (authError || !authData.user) {
        return {
            success: false,
            error: 'E-mail ou senha incorretos.',
        }
    }

    // 2. Buscar dados do usuário na tabela users (admin client bypassa RLS)
    const admin = createAdminClient()
    const { data: user, error: userError } = await admin
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single() as { data: any; error: any }

    if (userError || !user) {
        return {
            success: false,
            error: 'Conta não encontrada. Entre em contato com o suporte.',
        }
    }

    // 3. Verificar se está bloqueado
    if (user.status === 'bloqueado') {
        await supabase.auth.signOut()
        return {
            success: false,
            error: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
        }
    }

    if (user.status === 'inativo') {
        await supabase.auth.signOut()
        return {
            success: false,
            error: 'Sua conta está inativa. Entre em contato com o suporte.',
        }
    }

    // 4. Retornar sucesso com a rota de redirecionamento baseada no tipo
    const redirectTo = getRotaInicial(user.tipo)

    return {
        success: true,
        redirectTo,
        user: {
            id: user.id,
            nome: user.nome,
            tipo: user.tipo,
        },
    }
}

// ── Logout ──
export async function logout() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/login')
}

// ── Obter usuário logado ──
export async function getUsuarioLogado(): Promise<User | null> {
    const supabase = await createServerSupabaseClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return null

    const admin = createAdminClient()
    const { data: user } = await admin
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single() as { data: any; error: any }

    return user as User | null
}

// ── Verificar permissão (para uso em Server Components/Actions) ──
export async function verificarPermissao(tiposPermitidos: TipoUsuario[]): Promise<User> {
    const user = await getUsuarioLogado()

    if (!user) {
        redirect('/login')
    }

    if (!tiposPermitidos.includes(user.tipo)) {
        redirect(getRotaInicial(user.tipo))
    }

    return user
}

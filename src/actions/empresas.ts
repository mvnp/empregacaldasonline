'use server'

import { createAdminClient } from '@/lib/supabase'
import { requireAdmin, requireAdminOrEmpregador } from '@/lib/server-auth'

export async function buscarTodasEmpresasNomes() {
    let admin;
    try {
        const auth = await requireAdminOrEmpregador();
        admin = auth.adminClient;
    } catch {
        return [];
    }
    const { data } = await admin
        .from('empresas')
        .select('nome_fantasia')
        .order('nome_fantasia', { ascending: true });
        
    if (!data) return [];
    return Array.from(new Set(data.map((e: any) => e.nome_fantasia))).filter(Boolean);
}

export async function listarEmpresas() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('empresas')
        .select(`
            *,
            vagas(id, status, candidaturas(id))
        `)
        .order('nome_fantasia', { ascending: true }) as { data: any; error: any }

    if (error) return []
    return data || []
}

export async function buscarEmpresa(id: number) {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return null;
    }

    const { data, error } = await admin
        .from('empresas')
        .select(`
            *,
            tecnologias:empresa_tecnologias(texto),
            beneficios:empresa_beneficios(texto),
            vagas(
                id, titulo, modalidade, status,
                candidaturas(id)
            )
        `)
        .eq('id', id)
        .single() as { data: any; error: any }

    if (error || !data) return null
    return data
}

export async function buscarEmpresaPublica(id: number) {
    const admin = createAdminClient()
    const { data } = await admin
        .from('empresas')
        .select(`*, vagas(id, status)`)
        .eq('id', id)
        .eq('status', 'ativa')
        .single() as { data: any }
    return data || null
}

export async function listarMinhasEmpresas() {
    let user;
    const admin = createAdminClient()
    try {
        const { getUsuarioLogado } = await import('@/actions/auth')
        user = await getUsuarioLogado()
    } catch { return [] }

    if (!user) return []

    const { data, error } = await admin
        .from('empresas')
        .select(`*, vagas(id, status)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: any; error: any }

    return error ? [] : (data || [])
}

export async function listarEmpresasPublicas() {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('empresas')
        .select(`
            *,
            vagas(id, status)
        `)
        .eq('status', 'ativa')
        .order('nome_fantasia', { ascending: true }) as { data: any; error: any }

    if (error) return []
    return data || []
}

export async function buscarEmpresaPorNome(nome: string) {
    let admin;
    try {
        const auth = await requireAdminOrEmpregador();
        admin = auth.adminClient;
    } catch {
        const { createAdminClient } = await import('@/lib/supabase')
        admin = createAdminClient();
    }
    const { data } = await admin
        .from('empresas')
        .select('*')
        .eq('nome_fantasia', nome)
        .limit(1)
        .single();
    return data || null;
}

// ── Cadastrar empresa diretamente (admin) ──
export interface EmpresaFormData {
    nome_fantasia: string
    razao_social?: string
    cnpj?: string
    email_contato: string
    telefone?: string
    whatsapp?: string
    website?: string
    linkedin?: string
    local?: string
    logradouro?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    descricao?: string
    setor?: string
    tamanho_empresa?: string
    fundacao_ano?: string
    status?: string
}

export async function cadastrarEmpresaAdmin(data: EmpresaFormData) {
    let adminClient;
    try {
        adminClient = await requireAdmin();
    } catch {
        return { success: false, error: 'Sem permissão.' }
    }

    if (!data.nome_fantasia?.trim()) return { success: false, error: 'Nome fantasia é obrigatório.' }
    if (!data.email_contato?.trim()) return { success: false, error: 'E-mail de contato é obrigatório.' }

    // Verificar se já existe empresa com esse nome ou e-mail
    const { data: existente } = await (adminClient.from('empresas') as any)
        .select('id')
        .or(`nome_fantasia.ilike.${data.nome_fantasia.trim()},email_contato.eq.${data.email_contato.trim()}`)
        .limit(1)
        .maybeSingle()

    if (existente) return { success: false, error: 'Já existe uma empresa com este nome ou e-mail.' }

    // Criar usuário Auth para o empregador
    const { data: novoAuth, error: authErr } = await (adminClient as any).auth.admin.createUser({
        email: data.email_contato.trim(),
        password: 'Mudar@123',
        email_confirm: true,
        user_metadata: { name: data.nome_fantasia.trim() },
    })

    let userId: number | null = null

    if (novoAuth?.user) {
        const { data: newUserDb } = await (adminClient.from('users') as any).insert({
            auth_id: novoAuth.user.id,
            tipo: 'empregador',
            nome: data.nome_fantasia.trim(),
            sobrenome: '(Empresa)',
            email: data.email_contato.trim(),
        }).select('id').single()

        if (newUserDb) userId = newUserDb.id
    }

    if (!userId) {
        // fallback: pega o user admin logado como criador
        const { createAdminClient: makeAdmin } = await import('@/lib/supabase')
        const supabase = await import('@/lib/supabase').then(m => m.createServerSupabaseClient())
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
            const { data: dbUser } = await makeAdmin()
                .from('users').select('id').eq('auth_id', authUser.id).single() as any
            if (dbUser) userId = dbUser.id
        }
    }

    const { data: novaEmpresa, error: empErr } = await (adminClient.from('empresas') as any).insert({
        user_id: userId,
        nome_fantasia: data.nome_fantasia.trim(),
        razao_social: data.razao_social?.trim() || data.nome_fantasia.trim(),
        cnpj: data.cnpj?.trim() || null,
        email_contato: data.email_contato.trim(),
        telefone: data.telefone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        website: data.website?.trim() || null,
        linkedin: data.linkedin?.trim() || null,
        local: data.local?.trim() || null,
        logradouro: data.logradouro?.trim() || null,
        numero: data.numero?.trim() || null,
        bairro: data.bairro?.trim() || null,
        cidade: data.cidade?.trim() || null,
        estado: data.estado?.trim() || null,
        descricao: data.descricao?.trim() || null,
        setor: data.setor?.trim() || null,
        tamanho_empresa: data.tamanho_empresa?.trim() || null,
        fundacao_ano: data.fundacao_ano ? parseInt(data.fundacao_ano) : null,
        status: data.status || 'ativa',
    }).select('id').single()

    if (empErr || !novaEmpresa) {
        return { success: false, error: 'Erro ao cadastrar empresa: ' + (empErr?.message || 'desconhecido') }
    }

    return { success: true, id: novaEmpresa.id }
}

export async function listarEmpresasDeCandidatos() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('candidato_experiencias')
        .select('empresa, cargo, candidato_id')
        .not('empresa', 'is', null)
        .neq('empresa', '') as { data: any[]; error: any }

    if (error || !data) return []

    // Agrupa por nome de empresa (case-insensitive)
    const mapa = new Map<string, { empresa: string; cargos: Set<string>; candidatos: Set<number> }>()

    for (const row of data) {
        const nome = (row.empresa as string).trim()
        if (!nome) continue
        const chave = nome.toLowerCase()
        if (!mapa.has(chave)) {
            mapa.set(chave, { empresa: nome, cargos: new Set(), candidatos: new Set() })
        }
        const entry = mapa.get(chave)!
        if (row.cargo) entry.cargos.add(row.cargo)
        if (row.candidato_id) entry.candidatos.add(row.candidato_id)
    }

    return Array.from(mapa.values())
        .map(e => ({
            nome: e.empresa,
            totalCargos: e.cargos.size,
            totalCandidatos: e.candidatos.size,
            cargosExemplo: Array.from(e.cargos).slice(0, 3),
        }))
        .sort((a, b) => b.totalCandidatos - a.totalCandidatos)
}

export async function atualizarEmpresaAdmin(id: number, data: EmpresaFormData) {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return { success: false, error: 'Sem permissão.' }
    }

    if (!data.nome_fantasia?.trim()) return { success: false, error: 'Nome fantasia é obrigatório.' }

    const { error } = await (admin.from('empresas') as any).update({
        nome_fantasia: data.nome_fantasia.trim(),
        razao_social: data.razao_social?.trim() || null,
        cnpj: data.cnpj?.trim() || null,
        email_contato: data.email_contato.trim(),
        telefone: data.telefone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        website: data.website?.trim() || null,
        linkedin: data.linkedin?.trim() || null,
        local: data.local?.trim() || null,
        logradouro: data.logradouro?.trim() || null,
        numero: data.numero?.trim() || null,
        bairro: data.bairro?.trim() || null,
        cidade: data.cidade?.trim() || null,
        estado: data.estado?.trim() || null,
        descricao: data.descricao?.trim() || null,
        setor: data.setor?.trim() || null,
        tamanho_empresa: data.tamanho_empresa?.trim() || null,
        fundacao_ano: data.fundacao_ano ? parseInt(data.fundacao_ano) : null,
        status: data.status || 'ativa',
    }).eq('id', id)

    if (error) {
        return { success: false, error: 'Erro ao atualizar: ' + error.message }
    }

    return { success: true, id }
}

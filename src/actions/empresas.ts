'use server'

import { createAdminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/server-auth'

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

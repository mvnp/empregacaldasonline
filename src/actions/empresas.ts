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

// ── Empresas mencionadas em candidato_experiencias ──
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


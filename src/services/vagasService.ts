import { createStaticClient, createServerSupabaseClient } from '@/lib/supabase'
import { Vaga, FiltrosVaga, RespostaPaginada } from '@/types'

// ==============================
// Busca de Vagas (público)
// ==============================

export async function getVagas(
    filtros: FiltrosVaga = {},
    pagina = 1,
    porPagina = 12
): Promise<RespostaPaginada<Vaga>> {
    const supabase = createStaticClient()
    const inicio = (pagina - 1) * porPagina

    let query = supabase
        .from('vagas')
        .select('*', { count: 'exact' })
        .eq('ativa', true)
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .range(inicio, inicio + porPagina - 1)

    if (filtros.busca) {
        query = query.or(
            `titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%,empresa.ilike.%${filtros.busca}%`
        )
    }
    if (filtros.area) query = query.eq('area', filtros.area)
    if (filtros.modalidade) query = query.eq('modalidade', filtros.modalidade)
    if (filtros.tipo_contrato) query = query.eq('tipo_contrato', filtros.tipo_contrato)
    if (filtros.nivel) query = query.eq('nivel', filtros.nivel)
    if (filtros.localizacao) query = query.ilike('localizacao', `%${filtros.localizacao}%`)
    if (filtros.destaque) query = query.eq('destaque', true)

    const { data, count, error } = await query

    if (error) throw error

    return {
        dados: data as Vaga[],
        total: count ?? 0,
        pagina,
        por_pagina: porPagina,
        total_paginas: Math.ceil((count ?? 0) / porPagina),
    }
}

export async function getVagaPorId(id: string): Promise<Vaga | null> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('id', id)
        .eq('ativa', true)
        .single()

    if (error) return null
    return data as Vaga
}

export async function getVagasDestaque(limite = 6): Promise<Vaga[]> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('ativa', true)
        .eq('destaque', true)
        .order('created_at', { ascending: false })
        .limit(limite)

    if (error) return []
    return data as Vaga[]
}

// ==============================
// Admin: Vagas (autenticado)
// ==============================

export async function getAllVagasAdmin(): Promise<Vaga[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Vaga[]
}

export async function criarVaga(vaga: Omit<Vaga, 'id' | 'created_at' | 'updated_at'>): Promise<Vaga> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('vagas')
        .insert(vaga)
        .select()
        .single()

    if (error) throw error
    return data as Vaga
}

export async function atualizarVaga(id: string, vaga: Partial<Vaga>): Promise<Vaga> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('vagas')
        .update({ ...vaga, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Vaga
}

export async function deletarVaga(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('vagas').delete().eq('id', id)
    if (error) throw error
}

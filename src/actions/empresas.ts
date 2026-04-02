'use server'

import { createAdminClient } from '@/lib/supabase'

export async function listarEmpresas() {
    const admin = createAdminClient()

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
    const admin = createAdminClient()

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

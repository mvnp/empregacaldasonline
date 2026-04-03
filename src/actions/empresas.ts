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

'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function candidatarVaga(vagaId: number, candidatoId: number) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Usário não autenticado.' }

    const admin = createAdminClient()

    // Encontrar user_id
    const { data: userData } = await admin.from('users').select('id, tipo').eq('auth_id', user.id).single() as any
    if (!userData || userData.tipo !== 'candidato') {
        return { success: false, error: 'Apenas perfis de candidato podem se candidatar.' }
    }

    // Tentar inserir candidatura
    const { error } = await (admin.from('candidaturas') as any).insert({ 
        vaga_id: vagaId, 
        candidato_id: candidatoId, 
        status: 'pendente' 
    })

    if (error) {
        if (error.code === '23505') return { success: false, error: 'Você já se candidatou para esta vaga com este currículo.' }
        return { success: false, error: 'Erro de conexão ao se candidatar. Tente novamente mais tarde.' }
    }
    
    return { success: true }
}

export async function verificarCandidatura(vagaId: number) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const admin = createAdminClient()

    const { data: userData } = await admin.from('users').select('id, tipo').eq('auth_id', user.id).single() as any
    if (!userData || userData.tipo !== 'candidato') return false

    const { data: candidatos } = await admin.from('candidatos').select('id').eq('user_id', userData.id) as any
    if (!candidatos || candidatos.length === 0) return false

    const candidatosIds = candidatos.map((c: any) => c.id)

    const { data } = await (admin.from('candidaturas') as any)
        .select('id')
        .eq('vaga_id', vagaId)
        .in('candidato_id', candidatosIds)
        .limit(1)

    return data && data.length > 0
}

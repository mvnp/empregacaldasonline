'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function candidatarVaga(vagaId: number) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Usário não autenticado.' }

    const admin = createAdminClient()

    // Encontrar user_id
    const { data: userData } = await admin.from('users').select('id, tipo').eq('auth_id', user.id).single() as any
    if (!userData || userData.tipo !== 'candidato') {
        return { success: false, error: 'Apenas perfis de candidato podem se candidatar.' }
    }

    // Encontrar candidato_id associado ao user_id
    const { data: candidatoData } = await admin.from('candidatos').select('id').eq('user_id', userData.id).single() as any
    if (!candidatoData) {
        return { success: false, error: 'Você precisa completar seu perfil de candidato antes de se candidatar.' }
    }

    // Tentar iserir candidatura
    const { error } = await (admin.from('candidaturas') as any).insert({ 
        vaga_id: vagaId, 
        candidato_id: candidatoData.id, 
        status: 'pendente' 
    })

    if (error) {
        // O código '23505' é Unique Violation (já candidatou)
        if (error.code === '23505') return { success: false, error: 'Você já se candidatou para esta vaga.' }
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

    const { data: candidatoData } = await admin.from('candidatos').select('id').eq('user_id', userData.id).single() as any
    if (!candidatoData) return false

    const { data } = await (admin.from('candidaturas') as any).select('id').eq('vaga_id', vagaId).eq('candidato_id', candidatoData.id).single()
    return !!data
}

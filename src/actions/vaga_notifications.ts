'use server'

import { createAdminClient } from '@/lib/supabase'

export interface VagaNotificationPayload {
    vaga_id: number
    motivo: string
    relato?: string
}

export async function criarVagaNotification(payload: VagaNotificationPayload): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient()

    const { vaga_id, motivo, relato } = payload

    if (!vaga_id || !motivo) {
        return { success: false, error: 'Dados obrigatórios ausentes.' }
    }

    const { error } = await (supabase.from('vaga_notifications') as any)
        .insert({
            vaga_id,
            motivo,
            relato: relato || null,
        })

    if (error) {
        console.error('[vaga_notifications] Erro ao inserir:', error)
        return { success: false, error: 'Erro ao enviar notificação. Tente novamente.' }
    }

    return { success: true }
}

'use server'

import { createAdminClient } from '@/lib/supabase'

const BUCKET = 'vagas-imagens'

/**
 * Faz upload de uma imagem (base64 dataURL) para o Supabase Storage
 * e registra o caminho na tabela `vaga_imagens`.
 *
 * Pode ser chamado ANTES de salvar a vaga (vaga_id = null) ou depois.
 * Retorna o storage_path e a url_publica para uso no frontend.
 */
export async function salvarImagemVaga(
    base64DataUrl: string,
    nomeOriginal: string,
    vagaId?: number | null
): Promise<{
    success: boolean
    storage_path?: string
    url_publica?: string
    registro_id?: number
    error?: string
}> {
    try {
        const admin = createAdminClient()

        // ─── Converter base64 → Buffer ───────────────────────────────────
        const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/)
        if (!matches) return { success: false, error: 'Formato de imagem inválido.' }

        const mimeType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // ─── Gerar path único ─────────────────────────────────────────────
        const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const storage_path = `anuncios/${timestamp}_${randomSuffix}.${ext}`

        // ─── Upload para o bucket ─────────────────────────────────────────
        const { error: uploadError } = await admin.storage
            .from(BUCKET)
            .upload(storage_path, buffer, {
                contentType: mimeType,
                upsert: false,
            })

        if (uploadError) {
            return { success: false, error: `Erro no upload: ${uploadError.message}` }
        }

        // ─── Obter URL pública ────────────────────────────────────────────
        const { data: publicUrlData } = admin.storage
            .from(BUCKET)
            .getPublicUrl(storage_path)

        const url_publica = publicUrlData?.publicUrl ?? null

        // ─── Registrar na tabela vaga_imagens ─────────────────────────────
        const { data: registro, error: dbError } = await (admin.from('vaga_imagens') as any)
            .insert({
                vaga_id: vagaId ?? null,
                storage_path,
                url_publica,
                nome_original: nomeOriginal,
            })
            .select('id')
            .single()

        if (dbError) {
            // Não bloqueia o fluxo — imagem já está no storage
            console.error('[vaga_imagens] Erro ao registrar no banco:', dbError.message)
            return { success: true, storage_path, url_publica }
        }

        return {
            success: true,
            storage_path,
            url_publica,
            registro_id: registro?.id,
        }
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro desconhecido.' }
    }
}

/**
 * Vincula um registro de imagem a uma vaga após o cadastro.
 * Usado quando o upload foi feito antes da vaga existir.
 */
export async function vincularImagemVaga(registroId: number, vagaId: number) {
    try {
        const admin = createAdminClient()
        await (admin.from('vaga_imagens') as any)
            .update({ vaga_id: vagaId })
            .eq('id', registroId)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

'use server'

import { createAdminClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/server-auth'

const BUCKET = 'media'

/**
 * Upload de arquivo para a biblioteca (Media)
 */
export async function uploadMedia(
    base64DataUrl: string,
    nomeOriginal: string,
    mimeType?: string
) {
    try {
        await requireAdmin()
        const admin = createAdminClient()

        // 1. Converter base64 → Buffer
        const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/)
        if (!matches) throw new Error('Formato de arquivo inválido.')

        const actualMimeType = mimeType || matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // 2. Gerar path único
        const ext = actualMimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
        const timestamp = Date.now()
        const storagePath = `lib/${timestamp}_${nomeOriginal.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`

        // 3. Upload para o Storage
        const { error: uploadError } = await admin.storage
            .from(BUCKET)
            .upload(storagePath, buffer, {
                contentType: actualMimeType,
                upsert: false,
            })

        if (uploadError) throw new Error(`Erro no storage: ${uploadError.message}`)

        // 4. Obter URL Pública
        const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath)
        const urlPublica = publicUrlData?.publicUrl

        // 5. Salvar no Banco
        const { data, error: dbError } = await (admin.from('media') as any)
            .insert({
                storage_path: storagePath,
                url_publica: urlPublica,
                nome_original: nomeOriginal,
                mime_type: actualMimeType,
                size_bytes: buffer.length
            })
            .select()
            .single()

        if (dbError) throw new Error(`Erro no banco: ${dbError.message}`)

        return { success: true, data }
    } catch (err: any) {
        console.error('[media] Erto no upload:', err.message)
        return { success: false, error: err.message }
    }
}

/**
 * Listar arquivos da biblioteca
 */
export async function listarMedia() {
    try {
        await requireAdmin()
        const admin = createAdminClient()

        const { data, error } = await admin
            .from('media')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data: data || [] }
    } catch (err: any) {
        return { success: false, error: err.message, data: [] }
    }
}

/**
 * Remover arquivo da biblioteca
 */
export async function removerMedia(id: number) {
    try {
        await requireAdmin()
        const admin = createAdminClient()

        // 1. Buscar dados para saber o storage_path
        const { data: item } = await (admin.from('media') as any)
            .select('storage_path')
            .eq('id', id)
            .single()

        if (item?.storage_path) {
            // 2. Remover do Storage
            await admin.storage.from(BUCKET).remove([item.storage_path])
        }

        // 3. Remover do Banco
        const { error } = await admin.from('media').delete().eq('id', id)
        if (error) throw error

        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

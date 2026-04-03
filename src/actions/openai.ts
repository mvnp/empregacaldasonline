'use server'

import { requireAdmin, requireAuth } from '@/lib/server-auth'
import { revalidatePath } from 'next/cache'

export async function salvarConfiguracaoOpenAI(data: { openai_token: string, model: string, title: string, prompt: string }) {
    try {
        const adminClient = await requireAdmin()
        const { user } = await requireAuth()

        if (!user) return { success: false, error: 'Não autorizado.' }

        const { error } = await adminClient
            .from('openai_config')
            .upsert({
                user_id: user.id,
                openai_token: data.openai_token,
                model: data.model,
                title: data.title,
                prompt: data.prompt,
                created_at: new Date().toISOString()
            } as any, { onConflict: 'user_id' })

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/configuracoes')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function lerConfiguracaoOpenAI() {
    try {
        const adminClient = await requireAdmin()
        const { user } = await requireAuth()
        
        if (!user) return null

        const { data, error } = await adminClient
            .from('openai_config')
            .select('*')
            .eq('user_id', user.id)
            .single() as { data: any, error: any }

        if (error || !data) return null
        return data as { openai_token: string, model: string, title?: string, prompt?: string }
    } catch {
        return null
    }
}

export async function extrairDadosVagaDeImagem(base64Image: string) {
    const config = await lerConfiguracaoOpenAI()
    if (!config || !config.openai_token) {
        return { success: false, error: 'Chave API da OpenAI não configurada no banco de dados. Acesse as Configurações.' }
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openai_token}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: config.prompt || 'Extraia as informações desta imagem de anúncio de vaga de emprego e retorne um objeto JSON com as seguintes chaves: "titulo" (Título da Vaga) e "descricao" (Descrição da Vaga contendo responsabilidades, requisitos, etc.). Em caso de indisponibilidade não preencha.' },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const err = await response.json()
            return { success: false, error: err.error?.message || 'Erro ao processar imagem na OpenAI.' }
        }

        const data = await response.json()
        const content = data.choices[0].message.content
        
        try {
            const parsed = JSON.parse(content)
            return { success: true, data: parsed }
        } catch {
            return { success: false, error: 'Falha ao interpretar o retorno da IA.' }
        }
        
    } catch (e: any) {
        return { success: false, error: e.message || 'Erro inesperado na IA.' }
    }
}

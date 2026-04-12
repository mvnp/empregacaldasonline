'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/server-auth'
import { v4 as uuidv4 } from 'uuid'

async function getAdminClient() {
    return await requireAdmin()
}

export async function buscarEmpresasParaAutosuggest(termo: string) {
    if (!termo || termo.length < 2) return []

    const admin = await getAdminClient()
    
    // Procura por nome fantasia, razao social ou cnpj
    const { data, error } = await (admin.from('empresas') as any)
        .select('id, nome_fantasia, razao_social, cnpj')
        .or(`nome_fantasia.ilike.%${termo}%,razao_social.ilike.%${termo}%,cnpj.ilike.%${termo}%`)
        .limit(10)

    if (error) {
        console.error('Erro ao buscar empresas:', error)
        return []
    }

    return (data || []).map((e: any) => ({
        id: e.id,
        label: `${e.nome_fantasia || e.razao_social} ${e.cnpj ? '(' + e.cnpj + ')' : ''}`
    }))
}

export async function listarPublicidades() {
    const admin = await getAdminClient()
    
    const { data, error } = await (admin.from('empresa_pubs') as any)
        .select(`
            *,
            empresas (nome_fantasia, razao_social, cnpj),
            imagens:empresa_pub_imagens (formato, arquivo_url)
        `)
        .order('created_at', { ascending: false })

    if (error) return { success: false, error: 'Erro ao carregar publicidades' }
    return { success: true, publicidades: data }
}

export async function criarPublicidade(formData: FormData) {
    try {
        const admin = await getAdminClient()

        const empresaId = Number(formData.get('empresa_id'))
        const linkDestino = formData.get('link_destino') as string
        const dataInicio = formData.get('data_inicio') as string
        const dataFim = formData.get('data_fim') as string
        const orcamentoStr = formData.get('orcamento') as string // vem como texto limpo

        if (!empresaId || !linkDestino || !dataInicio || !dataFim) {
            return { success: false, error: 'Preencha todos os campos obrigatórios básicos.' }
        }

        // 1. Inserir a publicidade
        const orcamento = Number(orcamentoStr.replace(/[^0-9.-]+/g, "")) || 0

        const { data: pubData, error: pubError } = await (admin.from('empresa_pubs') as any)
            .insert({
                empresa_id: empresaId,
                link_destino: linkDestino,
                data_inicio: new Date(dataInicio).toISOString(),
                data_fim: new Date(dataFim).toISOString(),
                orcamento_real: orcamento,
                status: 'ativo'
            })
            .select()
            .single()

        if (pubError || !pubData) {
            console.error(pubError)
            return { success: false, error: 'Erro ao criar a publicidade.' }
        }

        const pubId = pubData.id

        // 2. Processar os formatos de imagem
        const formatosPermitidos = ['rectangle', 'leaderboard', 'billboard', 'native']
        
        for (const formato of formatosPermitidos) {
            const file = formData.get(`imagem_${formato}`) as File | null
            if (file && file.size > 0) {
                // Upload para o bucket
                const fileExt = file.name.split('.').pop()
                const fileName = `${pubId}/${formato}_${uuidv4()}.${fileExt}`
                
                const { error: uploadError } = await admin.storage
                    .from('publicidades')
                    .upload(fileName, file)

                if (uploadError) {
                    console.error(`Erro ao subir imagem formato ${formato}:`, uploadError)
                    continue; // Pula esta imagem se der erro mas tenta as outras
                }

                const { data: publicUrlData } = admin.storage
                    .from('publicidades')
                    .getPublicUrl(fileName)

                // Salva registro na tabela img
                await (admin.from('empresa_pub_imagens') as any)
                    .insert({
                        pub_id: pubId,
                        formato: formato,
                        arquivo_url: publicUrlData.publicUrl
                    })
            }
        }

        return { success: true }
    } catch (e: any) {
        console.error(e)
        return { success: false, error: 'Erro inesperado no servidor.' }
    }
}

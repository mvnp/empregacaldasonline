'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/server-auth'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { headers } from 'next/headers'
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

    // Fetch total clicks
    const { data: statsData } = await (admin.from('pub_click_stats') as any).select('pub_id, clicks');
    const totalClicksByPub: Record<number, number> = {};
    if (statsData) {
        statsData.forEach((stat: any) => {
            totalClicksByPub[stat.pub_id] = (totalClicksByPub[stat.pub_id] || 0) + Number(stat.clicks);
        });
    }

    // Fetch clicks today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: logsData } = await (admin.from('pub_click_logs') as any)
        .select('pub_id')
        .gte('clicked_at', todayStart.toISOString());
    
    const clicksTodayByPub: Record<number, number> = {};
    if (logsData) {
        logsData.forEach((log: any) => {
            clicksTodayByPub[log.pub_id] = (clicksTodayByPub[log.pub_id] || 0) + 1;
        });
    }

    const publicidadesComClicks = data.map((pub: any) => ({
        ...pub,
        total_clicks: totalClicksByPub[pub.id] || 0,
        clicks_hoje: clicksTodayByPub[pub.id] || 0
    }));

    return { success: true, publicidades: publicidadesComClicks }
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
        const cleanOrcStr = orcamentoStr.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g, "")
        const orcamento = Number(cleanOrcStr) || 0

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

export async function buscarPublicidade(id: number) {
    const admin = await getAdminClient()
    const { data, error } = await (admin.from('empresa_pubs') as any)
        .select(`
            *,
            empresas (nome_fantasia, razao_social, cnpj)
        `)
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function atualizarPublicidade(id: number, form: {
    status: string
    link_destino: string
    data_inicio: string
    data_fim: string
    orcamento: number
}) {
    try {
        const admin = await getAdminClient()
        const { error } = await (admin.from('empresa_pubs') as any)
            .update({
                status: form.status,
                link_destino: form.link_destino,
                data_inicio: new Date(form.data_inicio).toISOString(),
                data_fim: new Date(form.data_fim).toISOString(),
                orcamento_real: form.orcamento,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            console.error(error)
            return { success: false, error: 'Erro ao atualizar a campanha.' }
        }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: 'Erro inesperado no servidor.' }
    }
}

// =============================================================================
// Contagem de Clicks de Publicidade
// =============================================================================

/**
 * Registra um clique em uma publicidade.
 * Regra: o mesmo IP não é contado novamente na mesma pub_id+formato dentro de 1 hora.
 *
 * O trigger `trg_pub_click_stats` no banco incrementa automaticamente
 * o contador em `pub_click_stats` após cada INSERT em `pub_click_logs`.
 */
export async function registrarClickPublicidade(params: {
    pub_id: number
    empresa_id: number
    formato: string
    page: string
}) {
    try {
        const { pub_id, empresa_id, formato, page } = params

        // Captura o IP real do visitante
        const headersList = await headers()
        const ip =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            '0.0.0.0'

        // Identifica o user_id se estiver logado (via cookie de sessão)
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        let userId: number | null = null
        if (user) {
            const { data: userRow } = await (supabase.from('users') as any)
                .select('id')
                .eq('auth_id', user.id)
                .single()
            userId = userRow?.id ?? null
        }

        // Usa o admin client para bypassar RLS no insert
        const admin = createAdminClient()

        // Verifica deduplicação: mesmo IP + pub_id + formato em <= 1 hora
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { data: existing } = await (admin.from('pub_click_logs') as any)
            .select('id')
            .eq('ip', ip)
            .eq('pub_id', pub_id)
            .eq('formato', formato)
            .gte('clicked_at', oneHourAgo)
            .limit(1)
            .maybeSingle()

        if (existing) {
            // Clique já computado para este IP na última hora — ignora silenciosamente
            return { success: true, counted: false, reason: 'duplicate' }
        }

        // Insere o log — o trigger do banco incrementa pub_click_stats
        const { error } = await (admin.from('pub_click_logs') as any)
            .insert({
                empresa_id,
                pub_id,
                formato,
                page,
                ip,
                user_id: userId,
                clicked_at: new Date().toISOString(),
            })

        if (error) {
            console.error('[registrarClickPublicidade] Erro ao inserir log:', error)
            return { success: false, error: 'Erro ao registrar o clique.' }
        }

        return { success: true, counted: true }
    } catch (e: any) {
        console.error('[registrarClickPublicidade] Exceção:', e)
        return { success: false, error: 'Erro inesperado no servidor.' }
    }
}

/**
 * Retorna os contadores de clicks por publicidade (somente admins).
 * Pode filtrar por empresa_id ou pub_id.
 */
export async function listarClickStats(filtros?: {
    empresa_id?: number
    pub_id?: number
}) {
    const admin = await getAdminClient()

    let query = (admin.from('pub_click_stats') as any)
        .select(`
            *,
            empresa_pubs (link_destino, status, data_inicio, data_fim),
            empresas (nome_fantasia, razao_social)
        `)
        .order('clicks', { ascending: false })

    if (filtros?.empresa_id) query = query.eq('empresa_id', filtros.empresa_id)
    if (filtros?.pub_id)     query = query.eq('pub_id', filtros.pub_id)

    const { data, error } = await query

    if (error) {
        console.error('[listarClickStats] Erro:', error)
        return { success: false, error: 'Erro ao carregar estatísticas.', stats: [] }
    }

    return { success: true, stats: data ?? [] }
}

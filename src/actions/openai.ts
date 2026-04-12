'use server'

import { requireAdmin, requireAuth } from '@/lib/server-auth'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'
import fs from 'fs/promises'
import path from 'path'

async function gravarLog(contexto: string, detalhes: any, retornoBruto?: any) {
    try {
        const logPath = path.join(process.cwd(), 'openai_erros.log');
        const entry = `[${new Date().toISOString()}] ${contexto}\nDETALHES: ${typeof detalhes === 'object' ? JSON.stringify(detalhes, null, 2) : detalhes}\nRETORNO BRUTO: ${retornoBruto ? (typeof retornoBruto === 'string' ? retornoBruto : JSON.stringify(retornoBruto, null, 2)) : 'N/A'}\n------------------------------------------\n\n`;
        await fs.appendFile(logPath, entry, 'utf-8');
        console.error(`[OpenAI LOG] ${contexto}`, detalhes);
    } catch (e) {
        console.error('Falha ao escrever log de erro', e);
    }
}

// Mapa de preços (in/out por 1M tokens) para cálculo aproximado de custo
const PRICING_MAP: Record<string, { in: number, out: number }> = {
    'gpt-5-nano': { in: 0.05, out: 0.40 },
    'gpt-4.1-nano': { in: 0.10, out: 0.40 },
    'gpt-4o-mini': { in: 0.15, out: 0.60 },
    'gpt-5.4-nano': { in: 0.20, out: 1.25 },
    'gpt-5-mini': { in: 0.25, out: 2.00 },
    'gpt-4.1-mini': { in: 0.40, out: 1.60 },
    'gpt-5.4-mini': { in: 0.75, out: 4.50 },
    'o3-mini': { in: 1.10, out: 4.40 },
    'o4-mini': { in: 1.10, out: 4.40 },
    'gpt-5.1': { in: 1.25, out: 10.00 },
    'gpt-5': { in: 1.25, out: 10.00 },
    'gpt-5.2': { in: 1.75, out: 14.00 },
    'gpt-5.3': { in: 1.75, out: 14.00 },
    'gpt-4.1': { in: 2.00, out: 8.00 },
    'o3': { in: 2.00, out: 8.00 },
    'gpt-4o': { in: 2.50, out: 10.00 },
    'gpt-5.4': { in: 2.50, out: 15.00 },
    'gpt-5-pro': { in: 15.00, out: 120.00 },
    'gpt-5.2-pro': { in: 21.00, out: 168.00 },
    'gpt-5.4-pro': { in: 30.00, out: 180.00 },
};

async function registrarConsumoToken(userId: string, model: string, promptTokens: number, completionTokens: number) {
    try {
        const adminClient = createAdminClient();
        const baseModel = model.toLowerCase().replace(/-20\d{2}-\d{2}-\d{2}/, ''); // limpa datas ex: gpt-4o-2024-05-13 => gpt-4o
        let matchModelId = Object.keys(PRICING_MAP).find(k => baseModel.includes(k)) || 'gpt-4o';
        
        const price = PRICING_MAP[matchModelId] || { in: 2.50, out: 10.00 };
        const costUsd = ((promptTokens / 1_000_000) * price.in) + ((completionTokens / 1_000_000) * price.out);

        await adminClient.from('openai_usage_logs').insert({
            user_id: userId,
            model: model,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens,
            cost_usd: costUsd
        });
    } catch (e) {
        console.error('Erro ao registrar consumo OpenAI', e);
    }
}

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
        return data as { user_id: string, openai_token: string, model: string, title?: string, prompt?: string }
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
                ...( (config.model || '').match(/^(o1|o3|o4|gpt-5|gpt-4\.5)/i) ? { max_completion_tokens: 15000 } : { max_tokens: 1000 } ),
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const err = await response.json()
            await gravarLog('Falha HTTP da API OpenAI', err, response.statusText);
            return { success: false, error: err.error?.message || 'Erro ao processar imagem na OpenAI.' }
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        
        if (data.usage && config.user_id) {
            await registrarConsumoToken(config.user_id, config.model || 'gpt-4o', data.usage.prompt_tokens, data.usage.completion_tokens);
        }

        if (!content) {
            const refusal = data.choices?.[0]?.message?.refusal;
            if (refusal) {
                await gravarLog('Requisição recusada pela IA', refusal, data);
                return { success: false, error: 'A IA recusou o processamento da imagem por questões de segurança técnica.' };
            }
            await gravarLog('Retorno de Conteúdo Vazio', 'A IA não gerou nenhum texto.', data);
            return { success: false, error: 'A IA retornou um documento vazio. Tente novamente.' };
        }

        try {
            // Corrige possíveis formatações markdown do retorno
            let rawStr = content || '';
            rawStr = rawStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(rawStr)

            if (parsed.empresa && typeof parsed.empresa === 'string') {
                const adminClient = createAdminClient()
                const { data: dbEmpresa } = await (adminClient.from('empresas') as any)
                    .select('id, local, email_contato, telefone, whatsapp, website')
                    .ilike('nome_fantasia', `%${parsed.empresa.trim()}%`)
                    .limit(1)
                    .maybeSingle()
                
                if (dbEmpresa) {
                    if (!parsed.local && dbEmpresa.local) parsed.local = dbEmpresa.local
                    if (!parsed.email_contato && dbEmpresa.email_contato) parsed.email_contato = dbEmpresa.email_contato
                    if (!parsed.telefone_contato && dbEmpresa.telefone) parsed.telefone_contato = dbEmpresa.telefone
                    if (!parsed.whatsapp_contato && dbEmpresa.whatsapp) parsed.whatsapp_contato = dbEmpresa.whatsapp
                    if (!parsed.link_externo && dbEmpresa.website) parsed.link_externo = dbEmpresa.website
                }
            }

            return { success: true, data: parsed }
        } catch (parseError: any) {
            await gravarLog('Falha ao interpretar JSON', parseError.message, data);
            return { success: false, error: 'Falha ao interpretar o retorno da IA. Detalhes salvos no log.' }
        }
        
    } catch (e: any) {
        await gravarLog('Erro inesperado no Try/Catch externo', e.message);
        return { success: false, error: e.message || 'Erro inesperado na IA.' }
    }
}

export async function gerarDescricaoComIA(titulo: string) {
    if (!titulo || !titulo.trim()) {
        return { success: false, error: 'O título da vaga é obrigatório para gerar a descrição.' }
    }

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
                        content: `Escreva uma breve e atrativa descrição de vaga de emprego baseada no título "${titulo}". Descreva a visão geral, cultura típica e oportunidades que a vaga pode oferecer. Retorne apenas o texto descritivo simples e direto, sem formatação Markdown e sem blocos complexos, em um único parágrafo bem redigido.`
                    }
                ],
                ...( (config.model || '').match(/^(o1|o3|o4|gpt-5|gpt-4\.5)/i) ? { max_completion_tokens: 8000 } : { max_tokens: 350 } ),
            })
        })

        if (!response.ok) {
            const err = await response.json()
            await gravarLog('Falha HTTP da API OpenAI (Geração)', err, response.statusText);
            return { success: false, error: err.error?.message || 'Erro ao gerar descrição na OpenAI.' }
        }

        const data = await response.json()
        const content = data.choices[0].message.content

        if (data.usage && config.user_id) {
            await registrarConsumoToken(config.user_id, config.model || 'gpt-4o', data.usage.prompt_tokens, data.usage.completion_tokens);
        }

        return { success: true, data: content }
    } catch (e: any) {
        await gravarLog('Erro inesperado no Try/Catch externo (Geração)', e.message);
        return { success: false, error: e.message || 'Erro inesperado na IA ao gerar descrição.' }
    }
}

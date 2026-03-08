'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

// ── Tipos ──
export interface VagaFormData {
    titulo: string
    descricao: string
    empresa: string
    local: string
    modalidade: 'remoto' | 'hibrido' | 'presencial'
    tipo_contrato: string
    nivel: string
    salario_min: string
    salario_max: string
    mostrar_salario: boolean
    email_contato: string
    link_externo: string
    status: string
    destaque: boolean
    responsabilidades: string[]
    requisitos: string[]
    diferenciais: string[]
    beneficios: string[]
}

// ── Cadastrar Vaga ──
export async function cadastrarVaga(formData: VagaFormData) {
    const supabase = await createServerSupabaseClient()

    // Verificar se está logado
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
        return { success: false, error: 'Você precisa estar logado.' }
    }

    // Buscar user id
    const admin = createAdminClient()
    const { data: user } = await admin
        .from('users')
        .select('id, tipo')
        .eq('auth_id', authUser.id)
        .single() as { data: any; error: any }

    if (!user) {
        return { success: false, error: 'Usuário não encontrado.' }
    }

    // Verificar permissão (admin ou empregador)
    if (!['admin', 'empregador'].includes(user.tipo)) {
        return { success: false, error: 'Sem permissão para criar vagas.' }
    }

    // Validações
    if (!formData.titulo?.trim()) return { success: false, error: 'Título é obrigatório.' }
    if (!formData.empresa?.trim()) return { success: false, error: 'Empresa é obrigatória.' }
    if (!formData.modalidade) return { success: false, error: 'Modalidade é obrigatória.' }

    // 1. Inserir vaga
    const { data: vaga, error: vagaError } = await admin.from('vagas').insert({
        titulo: formData.titulo.trim(),
        descricao: formData.descricao?.trim() || null,
        empresa: formData.empresa.trim(),
        local: formData.local?.trim() || null,
        modalidade: formData.modalidade,
        tipo_contrato: formData.tipo_contrato || null,
        nivel: formData.nivel || null,
        salario_min: formData.salario_min ? parseFloat(formData.salario_min) : null,
        salario_max: formData.salario_max ? parseFloat(formData.salario_max) : null,
        mostrar_salario: formData.mostrar_salario,
        email_contato: formData.email_contato?.trim() || null,
        link_externo: formData.link_externo?.trim() || null,
        status: formData.status || 'ativa',
        destaque: formData.destaque || false,
        criado_por: user.id,
    } as any).select('id').single() as { data: any; error: any }

    if (vagaError || !vaga) {
        return { success: false, error: 'Erro ao criar vaga. Tente novamente.' }
    }

    const vagaId = vaga.id

    // 2. Inserir itens auxiliares
    const inserirItens = async (tabela: string, itens: string[]) => {
        const dados = itens
            .filter(t => t.trim())
            .map((texto, idx) => ({ vaga_id: vagaId, texto: texto.trim(), ordem: idx }))
        if (dados.length > 0) {
            await admin.from(tabela).insert(dados as any)
        }
    }

    await Promise.all([
        inserirItens('vaga_responsabilidades', formData.responsabilidades || []),
        inserirItens('vaga_requisitos', formData.requisitos || []),
        inserirItens('vaga_diferenciais', formData.diferenciais || []),
        inserirItens('vaga_beneficios', formData.beneficios || []),
    ])

    return { success: true, vagaId }
}

// ── Listar vagas ──
export async function listarVagas() {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false }) as { data: any; error: any }

    if (error) return []
    return data || []
}

// ── Buscar vaga por ID com itens ──
export async function buscarVaga(id: number) {
    const admin = createAdminClient()

    const [vagaRes, respRes, reqRes, difRes, benRes] = await Promise.all([
        admin.from('vagas').select('*').eq('id', id).single(),
        admin.from('vaga_responsabilidades').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_requisitos').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_diferenciais').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_beneficios').select('*').eq('vaga_id', id).order('ordem'),
    ]) as any[]

    if (vagaRes.error || !vagaRes.data) return null

    return {
        ...vagaRes.data,
        responsabilidades: (respRes.data || []).map((r: any) => r.texto),
        requisitos: (reqRes.data || []).map((r: any) => r.texto),
        diferenciais: (difRes.data || []).map((r: any) => r.texto),
        beneficios: (benRes.data || []).map((r: any) => r.texto),
    }
}

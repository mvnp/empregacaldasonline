'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { requireAdmin, requireAdminOrEmpregador } from '@/lib/server-auth'
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
    salario_a_combinar: boolean
    email_contato: string
    telefone_contato: string
    whatsapp_contato: string
    link_externo: string
    status: string
    destaque: boolean
    json_content?: string | null
    responsabilidades: string[]
    requisitos: string[]
    diferenciais: string[]
    beneficios: string[]
}

// ── Funções Auxiliares ──
async function encontrarEmpresaExistente(
    admin: any, 
    nome: string, 
    telefone?: string, 
    whatsapp?: string,
    email?: string,
    website?: string
) {
    const conditions = []
    
    if (nome?.trim()) conditions.push(`nome_fantasia.ilike.${nome.trim()}`)
    if (telefone?.trim()) conditions.push(`telefone.eq.${telefone.trim()}`)
    if (whatsapp?.trim()) conditions.push(`whatsapp.eq.${whatsapp.trim()}`)
    if (email?.trim()) conditions.push(`email_contato.ilike.${email.trim()}`)
    if (website?.trim()) conditions.push(`website.ilike.${website.trim()}`)
    
    if (conditions.length === 0) return null

    const { data } = await admin.from('empresas')
        .select('id')
        .or(conditions.join(','))
        .limit(1)
        .maybeSingle()
        
    return data ? data.id : null
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

    const empresa_id = await encontrarEmpresaExistente(
        admin, 
        formData.empresa, 
        formData.telefone_contato, 
        formData.whatsapp_contato,
        formData.email_contato,
        formData.link_externo
    );

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
        salario_a_combinar: formData.salario_a_combinar || false,
        email_contato: formData.email_contato?.trim() || null,
        telefone: formData.telefone_contato?.trim() || null,
        whatsapp: formData.whatsapp_contato?.trim() || null,
        link_externo: formData.link_externo?.trim() || null,
        status: formData.status || 'ativa',
        destaque: formData.destaque || false,
        json_content: formData.json_content ? JSON.parse(formData.json_content) : null,
        criado_por: user.id,
        empresa_id: empresa_id
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
            await (admin.from(tabela) as any).insert(dados as any)
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

// ── Editar Vaga ──
export async function editarVaga(vagaId: number, formData: VagaFormData) {
    const supabase = await createServerSupabaseClient()

    // Verificar se está logado
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
        return { success: false, error: 'Você precisa estar logado.' }
    }

    const admin = createAdminClient()
    const { data: user } = await admin
        .from('users')
        .select('id, tipo')
        .eq('auth_id', authUser.id)
        .single() as { data: any; error: any }

    if (!user || !['admin', 'empregador'].includes(user.tipo)) {
        return { success: false, error: 'Sem permissão.' }
    }

    // Validações
    if (!formData.titulo?.trim()) return { success: false, error: 'Título é obrigatório.' }
    if (!formData.empresa?.trim()) return { success: false, error: 'Empresa é obrigatória.' }

    const empresa_id = await encontrarEmpresaExistente(
        admin, 
        formData.empresa, 
        formData.telefone_contato, 
        formData.whatsapp_contato,
        formData.email_contato,
        formData.link_externo
    );

    // 1. Atualizar vaga
    const { error: vagaError } = await (admin.from('vagas') as any).update({
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
        salario_a_combinar: formData.salario_a_combinar || false,
        email_contato: formData.email_contato?.trim() || null,
        telefone: formData.telefone_contato?.trim() || null,
        whatsapp: formData.whatsapp_contato?.trim() || null,
        link_externo: formData.link_externo?.trim() || null,
        status: formData.status || 'ativa',
        destaque: formData.destaque || false,
        json_content: formData.json_content ? JSON.parse(formData.json_content) : null,
        empresa_id: empresa_id,
        updated_at: new Date().toISOString()
    } as any).eq('id', vagaId);

    if (vagaError) return { success: false, error: 'Erro ao atualizar vaga.' }

    // 2. Recriar itens auxiliares (apaga tudo e recria pra ficar simples)
    await Promise.all([
        admin.from('vaga_responsabilidades').delete().eq('vaga_id', vagaId),
        admin.from('vaga_requisitos').delete().eq('vaga_id', vagaId),
        admin.from('vaga_diferenciais').delete().eq('vaga_id', vagaId),
        admin.from('vaga_beneficios').delete().eq('vaga_id', vagaId),
    ]);

    const inserirItens = async (tabela: string, itens: string[]) => {
        const dados = itens
            .filter(t => t.trim())
            .map((texto, idx) => ({ vaga_id: vagaId, texto: texto.trim(), ordem: idx }))
        if (dados.length > 0) {
            await (admin.from(tabela) as any).insert(dados as any)
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

// ── Listar vagas (admin — sem paginação) ──
export async function listarVagas() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('vagas')
        .select('*, candidaturas(id)')
        .order('created_at', { ascending: false }) as { data: any; error: any }

    if (error) return []
    return data || []
}

// ── Listar vagas públicas com paginação e filtros ──
export interface FiltrosPublicos {
    busca?: string
    modalidade?: string   // 'remoto' | 'hibrido' | 'presencial' | ''
    nivel?: string        // 'junior' | 'pleno' | 'senior' | ...
    tipo_contrato?: string // 'clt' | 'pj' | ...
    apenasDestaque?: boolean
    page?: number         // 1-indexed
    perPage?: number      // padrão 5
}

export interface VagaPublica {
    id: number
    titulo: string
    empresa: string
    local: string | null
    modalidade: string
    tipo_contrato: string | null
    nivel: string | null
    salario_min: number | null
    salario_max: number | null
    mostrar_salario: boolean
    salario_a_combinar: boolean
    destaque: boolean
    created_at: string
}

export interface ListagemVagasResult {
    vagas: VagaPublica[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

export async function listarVagasPublicas(filtros: FiltrosPublicos = {}): Promise<ListagemVagasResult> {
    const admin = createAdminClient()

    const page = Math.max(1, filtros.page ?? 1)
    const perPage = filtros.perPage ?? 5
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Build query para count
    let countQuery = admin
        .from('vagas')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativa')

    // Build query para dados
    let dataQuery = admin
        .from('vagas')
        .select('id, titulo, empresa, local, modalidade, tipo_contrato, nivel, salario_min, salario_max, mostrar_salario, salario_a_combinar, destaque, created_at')
        .eq('status', 'ativa')
        .order('id', { ascending: false })
        .range(from, to)

    // Filtros opcionais
    if (filtros.busca?.trim()) {
        const termo = `%${filtros.busca.trim()}%`
        countQuery = countQuery.or(`titulo.ilike.${termo},empresa.ilike.${termo}`)
        dataQuery = dataQuery.or(`titulo.ilike.${termo},empresa.ilike.${termo}`)
    }
    if (filtros.modalidade) {
        countQuery = countQuery.eq('modalidade', filtros.modalidade)
        dataQuery = dataQuery.eq('modalidade', filtros.modalidade)
    }
    if (filtros.nivel) {
        countQuery = countQuery.eq('nivel', filtros.nivel)
        dataQuery = dataQuery.eq('nivel', filtros.nivel)
    }
    if (filtros.tipo_contrato) {
        countQuery = countQuery.eq('tipo_contrato', filtros.tipo_contrato)
        dataQuery = dataQuery.eq('tipo_contrato', filtros.tipo_contrato)
    }
    if (filtros.apenasDestaque) {
        countQuery = countQuery.eq('destaque', true)
        dataQuery = dataQuery.eq('destaque', true)
    }

    const [{ count }, { data }] = await Promise.all([
        countQuery as any,
        dataQuery as any,
    ])

    const total = count ?? 0
    const vagas: VagaPublica[] = data ?? []

    return {
        vagas,
        total,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
    }
}

// ── Buscar vaga por ID com itens ──
export async function buscarVaga(id: number) {
    let admin;
    try {
        // SECURITY PATCH: Ver os dados da vaga completa INCLUINDO candidaturas (PII) requer privilégios.
        const res = await requireAdminOrEmpregador();
        admin = res.adminClient;
    } catch {
        return null; // A rota pública usa listarVagasPublicas/outros getters para não expor os e-mails dos candidatos. Se tentarem buscarVaga direta, é bloqueado.
    }

    const [vagaRes, respRes, reqRes, difRes, benRes] = await Promise.all([
        admin.from('vagas').select('*, candidaturas(*, candidato:candidatos(*))').eq('id', id).single(),
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

export async function buscarVagaPublica(id: number) {
    const admin = createAdminClient();
    const [vagaRes, respRes, reqRes, difRes, benRes] = await Promise.all([
        admin.from('vagas').select('*').eq('id', id).eq('status', 'ativa').single(),
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

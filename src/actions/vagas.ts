'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { requireAdmin, requireAdminOrEmpregador } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
    tipo_pagamento?: string | null
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

export async function buscarTodosTitulosVagas() {
    let admin;
    try {
        const auth = await requireAdminOrEmpregador();
        admin = auth.adminClient;
    } catch {
        const { createAdminClient } = await import('@/lib/supabase')
        admin = createAdminClient();
    }
    const { data } = await admin
        .from('vagas')
        .select('titulo')
        .order('titulo', { ascending: true });
        
    if (!data) return [];
    return Array.from(new Set(data.map((v: any) => v.titulo))).filter(Boolean);
}

function slugify(text: string) {
    const slug = text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')

    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4)
    return `${slug}-${timestamp}`
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

    // Se o email de contato estiver vazio, iremos preencher com um email fake
    if (!formData.email_contato || !formData.email_contato.trim()) {
        const nomeClean = formData.empresa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const hash = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        formData.email_contato = `${nomeClean}${hash}@empregacaldas.online`;
    }

    let empresa_id = await encontrarEmpresaExistente(
        admin,
        formData.empresa,
        formData.telefone_contato,
        formData.whatsapp_contato,
        formData.email_contato,
        formData.link_externo
    );

    if (!empresa_id) {
        // Criar usuário para este empregador no supabase auth
        const { data: novoAuthUser, error: authErr } = await admin.auth.admin.createUser({
            email: formData.email_contato.trim(),
            password: 'Mudar@123',
            email_confirm: true,
            user_metadata: { name: formData.empresa.trim() }
        });

        let newUserId = user.id; //Fallback para o criador admin

        if (novoAuthUser && novoAuthUser.user) {
            // Criar usuario na tabela users vinculada ao auth_id recem criado
            const { data: newUserDb } = await (admin.from('users') as any).insert({
                auth_id: novoAuthUser.user.id,
                tipo: 'empregador',
                nome: formData.empresa.trim(),
                sobrenome: '(Empresa)',
                email: formData.email_contato.trim()
            }).select('id').single();

            if (newUserDb) {
                newUserId = newUserDb.id;
            }
        }

        // Criar empresa vinculada
        const { data: novaEmpresa } = await (admin.from('empresas') as any).insert({
            user_id: newUserId,
            nome_fantasia: formData.empresa.trim(),
            razao_social: formData.empresa.trim(),
            local: formData.local?.trim() || null,
            email_contato: formData.email_contato?.trim() || null,
            telefone: formData.telefone_contato?.trim() || null,
            whatsapp: formData.whatsapp_contato?.trim() || null,
            website: formData.link_externo?.trim() || null,
            status: 'ativa'
        }).select('id').single();

        if (novaEmpresa) {
            empresa_id = novaEmpresa.id;
        }
    }

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
        slug: slugify(formData.titulo),
        tipo_pagamento: formData.tipo_pagamento || null,
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

    revalidatePath('/admin/vagas')
    revalidatePath('/vagas')
    revalidatePath('/')

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

    let empresa_id = await encontrarEmpresaExistente(
        admin,
        formData.empresa,
        formData.telefone_contato,
        formData.whatsapp_contato,
        formData.email_contato,
        formData.link_externo
    );

    if (!empresa_id) {
        // Criar empresa se não detectou nenhuma existente
        const { data: novaEmpresa } = await (admin.from('empresas') as any).insert({
            user_id: user.id,
            nome_fantasia: formData.empresa.trim(),
            local: formData.local?.trim() || null,
            email_contato: formData.email_contato?.trim() || null,
            telefone: formData.telefone_contato?.trim() || null,
            whatsapp: formData.whatsapp_contato?.trim() || null,
            website: formData.link_externo?.trim() || null,
            status: 'ativa'
        }).select('id').single();

        if (novaEmpresa) {
            empresa_id = novaEmpresa.id;
        }
    }

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
        slug: slugify(formData.titulo),
        tipo_pagamento: formData.tipo_pagamento || null,
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

    revalidatePath('/admin/vagas')
    revalidatePath('/vagas')
    revalidatePath(`/vagas/${vagaId}`)
    revalidatePath('/')

    return { success: true, vagaId }
}

// ── Listar vagas (admin — sem paginação, legado) ──
export async function listarVagas() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('vagas')
        .select('*, candidaturas(id), empresas(id, user_id, user:user_id(id, tipo))')
        .order('created_at', { ascending: false }) as { data: any; error: any }

    if (error) return []
    return data || []
}

// ── Listar vagas (admin — com filtros e paginação no backend) ──
export interface FiltrosAdmin {
    busca?: string
    status?: string
    modalidade?: string
    cidade?: string
    page?: number
    perPage?: number
}

export interface ListagemVagasAdminResult {
    vagas: any[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

export async function buscarCidadesVagas(): Promise<string[]> {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('vagas')
        .select('local')
        .not('local', 'is', null);

    if (error || !data) return [];

    const cidades = [...new Set(data.map((v: any) => v.local))] as string[];
    return cidades.sort();
}

export async function listarVagasAdmin(filtros: FiltrosAdmin = {}): Promise<ListagemVagasAdminResult> {
    console.log('[vagas] listarVagasAdmin filtros:', filtros)
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return { vagas: [], total: 0, page: 1, perPage: 18, totalPages: 0 };
    }

    const page = Math.max(1, filtros.page ?? 1)
    const perPage = filtros.perPage ?? 18
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Build queries base
    let countQuery = admin
        .from('vagas')
        .select('id', { count: 'exact', head: true })

    let dataQuery = admin
        .from('vagas')
        .select('*, candidaturas(id), empresas(id, user_id, user:user_id(id, tipo))')
        .order('created_at', { ascending: false })
        .range(from, to)

    // Filtro de busca: título ou empresa (ilike no banco)
    if (filtros.busca?.trim()) {
        const termo = `%${filtros.busca.trim()}%`
        countQuery = countQuery.or(`titulo.ilike.${termo},empresa.ilike.${termo}`) as any
        dataQuery = dataQuery.or(`titulo.ilike.${termo},empresa.ilike.${termo}`) as any
    }

    // Filtro de status
    if (filtros.status) {
        countQuery = countQuery.eq('status', filtros.status) as any
        dataQuery = dataQuery.eq('status', filtros.status) as any
    }

    // Filtro de modalidade
    if (filtros.modalidade) {
        countQuery = countQuery.ilike('modalidade', filtros.modalidade) as any
        dataQuery = dataQuery.ilike('modalidade', filtros.modalidade) as any
    }

    // Filtro de cidade
    if (filtros.cidade) {
        countQuery = countQuery.eq('local', filtros.cidade) as any
        dataQuery = dataQuery.eq('local', filtros.cidade) as any
    }

    const [{ count }, { data, error }] = await Promise.all([
        countQuery as any,
        dataQuery as any,
    ])

    if (error) return { vagas: [], total: 0, page, perPage, totalPages: 0 }

    const total = count ?? 0

    return {
        vagas: data || [],
        total,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
    }
}

// ── Listar vagas para página Em Massa (rascunho → pausada → ativa, created_at DESC) ──
export interface VagaEmMassaItem {
    id: number
    titulo: string
    empresa: string
    status: string
    modalidade: string
    nivel: string | null
    created_at: string
    vaga_imagens?: any[]
}

export interface ListagemEmMassaResult {
    vagas: VagaEmMassaItem[]
    total: number
    page: number
    temMais: boolean
}

export async function listarVagasParaEmMassa(page = 1, perPage = 30): Promise<ListagemEmMassaResult> {
    let admin: any
    try {
        admin = await requireAdmin()
    } catch {
        return { vagas: [], total: 0, page: 1, temMais: false }
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Ordenação: status DESC (r > p > e > a) = rascunho primeiro, depois created_at DESC
    const { data, count, error } = await (admin
        .from('vagas')
        .select('id, titulo, empresa, status, modalidade, nivel, created_at, vaga_imagens(*)', { count: 'exact' })
        .order('status', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to) as any)

    if (error) return { vagas: [], total: 0, page, temMais: false }

    const total = count ?? 0
    return {
        vagas: data || [],
        total,
        page,
        temMais: to + 1 < total,
    }
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
    descricao: string | null
    local: string | null
    modalidade: string
    tipo_contrato: string | null
    nivel: string | null
    salario_min: number | null
    salario_max: number | null
    mostrar_salario: boolean
    salario_a_combinar: boolean
    destaque: boolean
    slug: string | null
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
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const isLogged = !!authUser

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
        .select('id, titulo, empresa, descricao, local, modalidade, tipo_contrato, nivel, salario_min, salario_max, mostrar_salario, salario_a_combinar, destaque, slug, created_at, tipo_pagamento')
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })
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
    let vagas: VagaPublica[] = data ?? []

    if (!isLogged) {
        vagas = vagas.map(v => ({
            ...v,
            empresa: 'Empresa: Cadastre-se ou faça login'
        }))
    }

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
        admin.from('vagas').select('*, candidaturas(*, candidato:candidatos(*)), vaga_imagens(*)').eq('id', id).single(),
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
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const isLogged = !!authUser

    const [vagaRes, respRes, reqRes, difRes, benRes] = await Promise.all([
        admin.from('vagas').select('*').eq('id', id).eq('status', 'ativa').single(),
        admin.from('vaga_responsabilidades').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_requisitos').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_diferenciais').select('*').eq('vaga_id', id).order('ordem'),
        admin.from('vaga_beneficios').select('*').eq('vaga_id', id).order('ordem'),
    ]) as any[]

    if (vagaRes.error || !vagaRes.data) return null

    const vaga = {
        ...vagaRes.data,
        responsabilidades: (respRes.data || []).map((r: any) => r.texto),
        requisitos: (reqRes.data || []).map((r: any) => r.texto),
        diferenciais: (difRes.data || []).map((r: any) => r.texto),
        beneficios: (benRes.data || []).map((r: any) => r.texto),
    }

    if (!isLogged) {
        vaga.empresa = 'Empresa: Cadastre-se ou faça login'
        if (vaga.telefone_contato) vaga.telefone_contato = '(64) *****-*****'
        if (vaga.whatsapp_contato) vaga.whatsapp_contato = '(64) *****-*****'
        if (vaga.email_contato) vaga.email_contato = '**********@ecn.online'
        // Let the frontend handle the salary format using the specific string, or override it here:
        // By changing `mostrar_salario` it makes it simpler, but if we want the actual string, UI might be easier
        // I will just override the boolean so the UI reacts to `empresa` field.
    }

    return vaga
}

export async function removerVaga(vagaId: number) {
    const supabase = await createServerSupabaseClient()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
        return { success: false, error: 'Você precisa estar logado.' }
    }

    const admin = createAdminClient()
    const { data: user } = await (admin.from('users') as any)
        .select('id, tipo')
        .eq('auth_id', authUser.id)
        .single()

    if (!user || !['admin', 'empregador'].includes(user.tipo)) {
        return { success: false, error: 'Sem permissão.' }
    }

    const { error } = await (admin.from('vagas') as any).delete().eq('id', vagaId)

    if (error) {
        return { success: false, error: 'Erro ao excluir vaga. ' + error.message }
    }

    revalidatePath('/admin/vagas')
    revalidatePath('/vagas')
    revalidatePath('/')

    return { success: true }
}

// ── Cadastrar Vaga em Rascunho (via IA em Massa) ──
export async function cadastrarVagaRascunho(dadosIA: {
    titulo?: string
    empresa?: string
    descricao?: string
    local?: string
    modalidade?: string
    nivel?: string
    tipo_contrato?: string
    salario_min?: string | number
    salario_max?: string | number
    mostrar_salario?: boolean
    salario_a_combinar?: boolean
    email_contato?: string
    telefone_contato?: string
    whatsapp_contato?: string
    link_externo?: string
    destaque?: boolean
    responsabilidades?: string[]
    requisitos?: string[]
    diferenciais?: string[]
    beneficios?: string[]
    tipo_pagamento?: string
}) {
    const supabase = await createServerSupabaseClient()
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
        return { success: false, error: 'Sem permissão para criar vagas.' }
    }

    const titulo = dadosIA.titulo?.trim() || 'Vaga sem título'
    const empresa = dadosIA.empresa?.trim() || 'Empresa não identificada'

    // Tentar encontrar empresa existente
    let empresa_id: number | null = null
    if (dadosIA.empresa?.trim()) {
        empresa_id = await encontrarEmpresaExistente(
            admin,
            dadosIA.empresa,
            dadosIA.telefone_contato,
            dadosIA.whatsapp_contato,
            dadosIA.email_contato,
            dadosIA.link_externo
        )
    }

    // E-mail de contato fallback
    let email_contato = dadosIA.email_contato?.trim() || ''
    if (!email_contato) {
        const nomeClean = empresa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
        const hash = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
        email_contato = `${nomeClean}${hash}@empregacaldas.online`
    }

    // Criar empresa se não encontrou
    if (!empresa_id) {
        const { data: novoAuthUser } = await admin.auth.admin.createUser({
            email: email_contato,
            password: 'Mudar@123',
            email_confirm: true,
            user_metadata: { name: empresa }
        })

        let newUserId = user.id
        if (novoAuthUser?.user) {
            const { data: newUserDb } = await (admin.from('users') as any).insert({
                auth_id: novoAuthUser.user.id,
                tipo: 'empregador',
                nome: empresa,
                sobrenome: '(Empresa)',
                email: email_contato
            }).select('id').single()
            if (newUserDb) newUserId = newUserDb.id
        }

        const { data: novaEmpresa } = await (admin.from('empresas') as any).insert({
            user_id: newUserId,
            nome_fantasia: empresa,
            razao_social: empresa,
            local: dadosIA.local?.trim() || null,
            email_contato: email_contato,
            telefone: dadosIA.telefone_contato?.trim() || null,
            whatsapp: dadosIA.whatsapp_contato?.trim() || null,
            website: dadosIA.link_externo?.trim() || null,
            status: 'ativa'
        }).select('id').single()

        if (novaEmpresa) empresa_id = novaEmpresa.id
    }

    // ── Normalizar valores da IA para os CHECK constraints do banco ──
    function stripAccents(s: string) {
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    }

    const MODALIDADE_MAP: Record<string, string> = {
        'remoto': 'remoto', 'remote': 'remoto',
        'hibrido': 'hibrido', 'hybrid': 'hibrido',
        'presencial': 'presencial', 'on-site': 'presencial', 'onsite': 'presencial',
    }
    const NIVEL_ALLOWED = ['estagio', 'junior', 'pleno', 'senior', 'gerente', 'diretor']
    const NIVEL_ALIAS: Record<string, string> = {
        'estagiario': 'estagio', 'intern': 'estagio', 'trainee': 'estagio',
        'jr': 'junior',
        'mid': 'pleno', 'mid-level': 'pleno',
        'sr': 'senior',
        'manager': 'gerente',
        'director': 'diretor',
    }
    const CONTRATO_MAP: Record<string, string> = {
        'clt': 'clt', 'efetivo': 'clt', 'pj': 'pj',
        'estagio': 'estagio',
        'temporario': 'temporario',
        'freelancer': 'freelancer', 'freelance': 'freelancer',
    }

    const rawModalidade = stripAccents(dadosIA.modalidade || '')
    const modalidade = (MODALIDADE_MAP[rawModalidade] || 'presencial') as 'remoto' | 'hibrido' | 'presencial'

    const rawNivel = stripAccents(dadosIA.nivel || '')
    const nivel: string | null = NIVEL_ALLOWED.includes(rawNivel)
        ? rawNivel
        : (NIVEL_ALIAS[rawNivel] ?? null)

    const rawContrato = stripAccents(dadosIA.tipo_contrato || '')
    const tipo_contrato = CONTRATO_MAP[rawContrato] || null

    const { data: vaga, error: vagaError } = await admin.from('vagas').insert({
        titulo,
        descricao: dadosIA.descricao?.trim() || null,
        empresa,
        local: dadosIA.local?.trim() || null,
        modalidade,
        tipo_contrato,
        nivel,
        salario_min: dadosIA.salario_min ? parseFloat(String(dadosIA.salario_min)) : null,
        salario_max: dadosIA.salario_max ? parseFloat(String(dadosIA.salario_max)) : null,
        mostrar_salario: dadosIA.mostrar_salario ?? false,
        salario_a_combinar: dadosIA.salario_a_combinar ?? true,
        email_contato,
        telefone: dadosIA.telefone_contato?.trim() || null,
        whatsapp: dadosIA.whatsapp_contato?.trim() || null,
        link_externo: dadosIA.link_externo?.trim() || null,
        status: 'rascunho',
        destaque: dadosIA.destaque ?? false,
        slug: slugify(titulo),
        tipo_pagamento: dadosIA.tipo_pagamento || null,
        criado_por: user.id,
        empresa_id: empresa_id
    } as any).select('id').single() as { data: any; error: any }

    if (vagaError || !vaga) {
        return { success: false, error: 'Erro ao criar vaga em rascunho: ' + (vagaError?.message || '') }
    }

    const vagaId = vaga.id

    const inserirItens = async (tabela: string, itens: string[]) => {
        const dados = (itens || [])
            .filter(t => t?.trim())
            .map((texto, idx) => ({ vaga_id: vagaId, texto: texto.trim(), ordem: idx }))
        if (dados.length > 0) {
            await (admin.from(tabela) as any).insert(dados as any)
        }
    }

    await Promise.all([
        inserirItens('vaga_responsabilidades', dadosIA.responsabilidades || []),
        inserirItens('vaga_requisitos', dadosIA.requisitos || []),
        inserirItens('vaga_diferenciais', dadosIA.diferenciais || []),
        inserirItens('vaga_beneficios', dadosIA.beneficios || []),
    ])

    revalidatePath('/admin/vagas')
    revalidatePath('/admin/vagas/em-massa')
    revalidatePath('/vagas')
    revalidatePath('/')

    return { success: true, vagaId }
}

// ── Publicar Vaga (trocar rascunho → ativa) ──
export async function publicarVaga(vagaId: number) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, error: 'Não autenticado.' }

    const admin = createAdminClient()
    const { data: user } = await admin
        .from('users').select('id, tipo').eq('auth_id', authUser.id).single() as { data: any; error: any }

    if (!user || !['admin', 'empregador'].includes(user.tipo)) {
        return { success: false, error: 'Sem permissão.' }
    }

    const { error } = await (admin.from('vagas') as any)
        .update({ status: 'ativa', updated_at: new Date().toISOString() })
        .eq('id', vagaId)

    if (error) return { success: false, error: 'Erro ao publicar vaga: ' + error.message }
    revalidatePath('/admin/vagas')
    revalidatePath('/vagas')
    revalidatePath('/')
    
    return { success: true }
}

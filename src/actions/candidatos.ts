'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { requireAdmin, requireAuth } from '@/lib/server-auth'

// ── Tipos ──
export interface ExperienciaItem {
    cargo: string
    empresa: string
    descricao: string
    data_inicio: string
    data_fim: string
    em_andamento: boolean
}

export interface FormacaoItem {
    curso: string
    instituicao: string
    grau: string
    data_inicio: string
    data_fim: string
    em_andamento: boolean
}

export interface IdiomaItem {
    idioma: string
    nivel: string
}

export interface DocumentoItem {
    titulo: string
    tipo: string
    url: string
}

export interface CandidatoFormData {
    user_id: number
    nome_completo: string
    cargo_desejado: string
    resumo: string
    local: string
    data_nascimento: string
    email: string
    telefone: string
    whatsapp: string
    linkedin: string
    portfolio: string
    github: string
    disponivel: boolean
    pretensao_min: string
    pretensao_max: string
    experiencias: ExperienciaItem[]
    formacoes: FormacaoItem[]
    habilidades: string[]
    idiomas: IdiomaItem[]
    documentos: DocumentoItem[]
}

// ── Cadastrar Candidato ──
export async function cadastrarCandidato(formData: CandidatoFormData) {
    const supabase = await createServerSupabaseClient()

    // Verificar se está logado
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
        return { success: false, error: 'Você precisa estar logado.' }
    }

    // Buscar user
    const admin = createAdminClient()
    const { data: user } = await admin
        .from('users')
        .select('id, tipo')
        .eq('auth_id', authUser.id)
        .single() as { data: any; error: any }

    if (!user || !['admin', 'candidato'].includes(user.tipo)) {
        return { success: false, error: 'Sem permissão.' }
    }

    if (!formData.nome_completo?.trim()) return { success: false, error: 'Nome completo é obrigatório.' }
    if (!formData.email?.trim()) return { success: false, error: 'E-mail é obrigatório.' }
    if (!formData.user_id) return { success: false, error: 'Usuário vinculado é obrigatório.' }

    // 1. Atualizar dados principais do Usuário (na tabela users)
    const partesNome = formData.nome_completo.trim().split(' ');
    const nome = partesNome[0];
    const sobrenome = partesNome.slice(1).join(' ');

    await (admin.from('users') as any).update({
        nome: nome,
        sobrenome: sobrenome || null,
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null
    }).eq('id', formData.user_id);

    // 2. Inserir o novo currículo/perfil (candidatos)
    const { data: candidato, error: candError } = await admin.from('candidatos').insert({
        user_id: formData.user_id,
        nome_completo: formData.nome_completo.trim(),
        cargo_desejado: formData.cargo_desejado?.trim() || null,
        resumo: formData.resumo?.trim() || null,
        local: formData.local?.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || null,
        linkedin: formData.linkedin?.trim() || null,
        portfolio: formData.portfolio?.trim() || null,
        github: formData.github?.trim() || null,
        disponivel: formData.disponivel,
        pretensao_min: formData.pretensao_min ? parseFloat(formData.pretensao_min) : null,
        pretensao_max: formData.pretensao_max ? parseFloat(formData.pretensao_max) : null,
    } as any).select('id').single() as { data: any; error: any }

    if (candError || !candidato) {
        const msg = candError?.message?.includes('candidatos_user_unique') || candError?.message?.includes('candidatos_user_id_key')
            ? 'Erro: O banco Supabase rejeitou outro currículo pois está bloqueado! Acesse seu Banco de Dados (SQL Editor) e rode: ALTER TABLE candidatos DROP CONSTRAINT candidatos_user_id_key; para permitir currículos ilimitados como na sua regra.'
            : 'Erro ao criar candidato. Tente novamente.'
        return { success: false, error: msg }
    }

    const candId = candidato.id

    // 2. Inserir experiências
    const exps = (formData.experiencias || [])
        .filter(e => e.cargo.trim() && e.empresa.trim())
        .map((e, idx) => ({
            candidato_id: candId,
            cargo: e.cargo.trim(),
            empresa: e.empresa.trim(),
            descricao: e.descricao?.trim() || null,
            data_inicio: e.data_inicio || null,
            data_fim: e.em_andamento ? null : (e.data_fim || null),
            em_andamento: e.em_andamento,
            ordem: idx,
        }))
    if (exps.length > 0) await admin.from('candidato_experiencias').insert(exps as any)

    // 3. Inserir formações
    const forms = (formData.formacoes || [])
        .filter(f => f.curso.trim() && f.instituicao.trim())
        .map((f, idx) => ({
            candidato_id: candId,
            curso: f.curso.trim(),
            instituicao: f.instituicao.trim(),
            grau: f.grau?.trim() || null,
            data_inicio: f.data_inicio || null,
            data_fim: f.em_andamento ? null : (f.data_fim || null),
            em_andamento: f.em_andamento,
            ordem: idx,
        }))
    if (forms.length > 0) await admin.from('candidato_formacoes').insert(forms as any)

    // 4. Inserir habilidades
    const habs = (formData.habilidades || [])
        .filter(h => h.trim())
        .map((h, idx) => ({ candidato_id: candId, texto: h.trim(), ordem: idx }))
    if (habs.length > 0) await admin.from('candidato_habilidades').insert(habs as any)

    // 5. Inserir idiomas
    const idiomas = (formData.idiomas || [])
        .filter(i => i.idioma.trim())
        .map((i, idx) => ({
            candidato_id: candId,
            idioma: i.idioma.trim(),
            nivel: i.nivel || null,
            ordem: idx,
        }))
    if (idiomas.length > 0) await admin.from('candidato_idiomas').insert(idiomas as any)

    // 6. Inserir documentos
    const docs = (formData.documentos || [])
        .filter(d => d.titulo.trim())
        .map((d, idx) => ({
            candidato_id: candId,
            titulo: d.titulo.trim(),
            tipo: d.tipo?.trim() || null,
            url: d.url?.trim() || null,
            ordem: idx,
        }))
    if (docs.length > 0) await admin.from('candidato_documentos').insert(docs as any)

    return { success: true, candidatoId: candId }
}

export async function atualizarCandidato(id: number, userId: number, formData: CandidatoFormData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, error: 'Você precisa estar logado.' }

    const admin = createAdminClient()
    
    // Check ownership
    const { data: currentCand } = await admin.from('candidatos').select('user_id').eq('id', id).single() as any
    if (!currentCand || currentCand.user_id !== userId) {
        return { success: false, error: 'Você não tem permissão para editar este currículo.' }
    }

    // 1. Atualizar candidato
    const { error: candError } = await (admin.from('candidatos') as any).update({
        nome_completo: formData.nome_completo.trim(),
        cargo_desejado: formData.cargo_desejado?.trim() || null,
        resumo: formData.resumo?.trim() || null,
        local: formData.local?.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || null,
        linkedin: formData.linkedin?.trim() || null,
        portfolio: formData.portfolio?.trim() || null,
        github: formData.github?.trim() || null,
        disponivel: formData.disponivel,
        pretensao_min: formData.pretensao_min ? parseFloat(formData.pretensao_min) : null,
        pretensao_max: formData.pretensao_max ? parseFloat(formData.pretensao_max) : null,
        updated_at: new Date().toISOString()
    } as any).eq('id', id)

    if (candError) return { success: false, error: 'Erro ao atualizar informações principais.' }

    // Função auxiliar para recriar relações
    const recreateRelations = async (table: string, tableRows: any[]) => {
        await (admin.from(table) as any).delete().eq('candidato_id', id)
        if (tableRows.length > 0) {
            await (admin.from(table) as any).insert(tableRows)
        }
    }

    // 2. Recriar experiências
    const exps = (formData.experiencias || []).filter(e => e.cargo.trim() && e.empresa.trim()).map((e, idx) => ({
        candidato_id: id, cargo: e.cargo.trim(), empresa: e.empresa.trim(), descricao: e.descricao?.trim() || null,
        data_inicio: e.data_inicio || null, data_fim: e.em_andamento ? null : (e.data_fim || null),
        em_andamento: e.em_andamento, ordem: idx,
    }))
    await recreateRelations('candidato_experiencias', exps)

    // 3. Recriar formações
    const forms = (formData.formacoes || []).filter(f => f.curso.trim() && f.instituicao.trim()).map((f, idx) => ({
        candidato_id: id, curso: f.curso.trim(), instituicao: f.instituicao.trim(), grau: f.grau?.trim() || null,
        data_inicio: f.data_inicio || null, data_fim: f.em_andamento ? null : (f.data_fim || null),
        em_andamento: f.em_andamento, ordem: idx,
    }))
    await recreateRelations('candidato_formacoes', forms)

    // 4. Recriar habilidades
    const habs = (formData.habilidades || []).filter(h => h.trim()).map((h, idx) => ({ candidato_id: id, texto: h.trim(), ordem: idx }))
    await recreateRelations('candidato_habilidades', habs)

    // 5. Recriar idiomas
    const idiomas = (formData.idiomas || []).filter(i => i.idioma.trim()).map((i, idx) => ({
        candidato_id: id, idioma: i.idioma.trim(), nivel: i.nivel || null, ordem: idx,
    }))
    await recreateRelations('candidato_idiomas', idiomas)

    // 6. Recriar documentos
    const docs = (formData.documentos || []).filter(d => d.titulo.trim()).map((d, idx) => ({
        candidato_id: id, titulo: d.titulo.trim(), tipo: d.tipo?.trim() || null, url: d.url?.trim() || null, ordem: idx,
    }))
    await recreateRelations('candidato_documentos', docs)

    return { success: true }
}

export async function excluirCurriculo(id: number, userId: number) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, error: 'Você precisa estar logado.' }

    const admin = createAdminClient()
    
    // Check ownership
    const { data: currentCand } = await admin.from('candidatos').select('user_id').eq('id', id).single() as any
    if (!currentCand || currentCand.user_id !== userId) {
        return { success: false, error: 'Você não tem permissão para excluir este currículo.' }
    }

    const { error } = await admin.from('candidatos').delete().eq('id', id)
    if (error) return { success: false, error: 'Erro ao excluir o currículo.' }

    return { success: true }
}

export async function buscarCandidato(id: number) {
    // SECURITY PATCH: Requer autenticação para ver PII de candidatos
    let admin;
    try {
        admin = (await requireAuth()).userClient;
    } catch {
        return null;
    }
    // NOTA: Caso empresas precisem ver, o ideal é usar RLS e userClient normal aqui invés de adminClient para obedecer policies!
    // Como era inseguro e usava createAdminClient direto, por hora mantemos a busca simples porém EXIGINDO estar logado.
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
        .from('candidatos')
        .select(`
            *,
            experiencias:candidato_experiencias(*),
            formacoes:candidato_formacoes(*),
            habilidades:candidato_habilidades(*),
            idiomas:candidato_idiomas(*),
            documentos:candidato_documentos(*),
            candidaturas:candidaturas(
                status, created_at,
                vaga:vagas(titulo, empresa)
            )
        `)
        .eq('id', id)
        .single() as { data: any; error: any }

    if (error || !data) return null
    return data
}

// ── Listar candidatos ──
export async function listarCandidatos() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data, error } = await admin
        .from('candidatos')
        .select('*, candidato_habilidades(texto), candidato_experiencias(data_inicio), candidaturas(id)')
        .order('created_at', { ascending: false }) as { data: any; error: any }

    if (error) return []
    return data || []
}

// ── Buscar usuários tipo candidato para vincular ──
export async function buscarUsuariosCandidato() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }

    const { data } = await admin
        .from('users')
        .select(`
            id, nome, sobrenome, email, telefone,
            candidatos (
                local, data_nascimento, whatsapp, linkedin, portfolio, github, pretensao_min, pretensao_max
            )
        `)
        .eq('tipo', 'candidato')
        .eq('status', 'ativo')
        .order('nome') as { data: any; error: any }

    return data || []
}

export async function buscarMeuUserId() {
    try {
        const { user } = await requireAuth();
        const adminClient = createAdminClient();
        const { data } = await adminClient.from('users').select('id').eq('auth_id', user.id).single() as { data: any };
        return data?.id || null;
    } catch {
        return null;
    }
}

export async function buscarMeuUsuarioCompleto() {
    try {
        const { user } = await requireAuth();
        const adminClient = createAdminClient();
        const { data } = await adminClient.from('users').select(`
            id, nome, sobrenome, email, telefone, tipo,
            ia_creditos ( creditos ),
            candidatos (
                local, data_nascimento, whatsapp, linkedin, portfolio, github, pretensao_min, pretensao_max
            )
        `).eq('auth_id', user.id).single() as { data: any };
        
        if (data) {
            data.creditos_ia = data.ia_creditos?.creditos ?? 5;
        }
        return data || null;
    } catch {
        return null;
    }
}

export async function listarMeusCurriculos(userId: number) {
    const admin = createAdminClient()
    const { data } = await admin
        .from('candidatos')
        .select(`
            id, cargo_desejado, nome_completo, created_at,
            experiencias:candidato_experiencias(cargo)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) as any

    return data || []
}

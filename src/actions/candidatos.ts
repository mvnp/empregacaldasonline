'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

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

    // Validações
    if (!formData.nome_completo?.trim()) return { success: false, error: 'Nome completo é obrigatório.' }
    if (!formData.email?.trim()) return { success: false, error: 'E-mail é obrigatório.' }
    if (!formData.user_id) return { success: false, error: 'Usuário vinculado é obrigatório.' }

    // 1. Inserir candidato
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
        const msg = candError?.message?.includes('candidatos_user_unique')
            ? 'Este usuário já possui um perfil de candidato.'
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

// ── Listar candidatos ──
export async function listarCandidatos() {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('candidatos')
        .select('*')
        .order('created_at', { ascending: false }) as { data: any; error: any }

    if (error) return []
    return data || []
}

// ── Buscar usuários tipo candidato para vincular ──
export async function buscarUsuariosCandidato() {
    const admin = createAdminClient()
    const { data } = await admin
        .from('users')
        .select('id, nome, sobrenome, email')
        .eq('tipo', 'candidato')
        .eq('status', 'ativo')
        .order('nome') as { data: any; error: any }

    return data || []
}

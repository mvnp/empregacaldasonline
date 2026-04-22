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
            data_inicio: e.data_inicio || '1900-01-01',  // NOT NULL no banco
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
            data_inicio: f.data_inicio || '1900-01-01',  // NOT NULL no banco
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
        data_inicio: e.data_inicio || '1900-01-01',  // NOT NULL no banco
        data_fim: e.em_andamento ? null : (e.data_fim || null),
        em_andamento: e.em_andamento, ordem: idx,
    }))
    await recreateRelations('candidato_experiencias', exps)

    // 3. Recriar formações
    const forms = (formData.formacoes || []).filter(f => f.curso.trim() && f.instituicao.trim()).map((f, idx) => ({
        candidato_id: id, curso: f.curso.trim(), instituicao: f.instituicao.trim(), grau: f.grau?.trim() || null,
        data_inicio: f.data_inicio || '1900-01-01',  // NOT NULL no banco
        data_fim: f.em_andamento ? null : (f.data_fim || null),
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
            ),
            categorias:candidato_categorias(
                categoria_id,
                vaga_categorias(descricao, slug)
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
            id, cargo_desejado, nome_completo, created_at, share_token,
            experiencias:candidato_experiencias(cargo)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) as any

    return data || []
}

// ── Helpers de sanitização ──
function sanitizarTelefone(tel: string | null | undefined): string {
    if (!tel) return ''
    return tel.replace(/\D/g, '')
}

function sanitizarEmail(email: string | null | undefined): string {
    if (!email) return ''
    return email.trim().toLowerCase()
}

// ── Cadastrar Candidato via PDF (IA) ──
export interface CandidatoPDFData {
    // Dados pessoais extraídos do PDF
    nome: string
    sobrenome: string
    email: string | null
    data_nascimento: string | null
    cpf: string | null
    telefone: string | null
    whatsapp: string | null
    // Dados do currículo
    cargo_desejado: string
    resumo: string
    local: string | null
    linkedin: string | null
    github: string | null
    portfolio: string | null
    habilidades: string[]
    experiencias: ExperienciaItem[]
    formacoes: FormacaoItem[]
    idiomas: IdiomaItem[]
    categoriaIds?: number[]
    // PDF storage
    pdfBase64: string
    pdfNomeOriginal: string
}

export async function cadastrarCandidatoViaPDF(dados: CandidatoPDFData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, error: 'Você precisa estar logado.' }

    const admin = createAdminClient()

    // Verificar se é admin
    const { data: adminUser } = await admin.from('users').select('id, tipo').eq('auth_id', authUser.id).single() as { data: any, error: any }
    if (!adminUser || adminUser.tipo !== 'admin') {
        return { success: false, error: 'Apenas administradores podem usar esta funcionalidade.' }
    }

    // ── 1. ARMAZENAR O PDF NO STORAGE ──
    let pdfStoragePath: string | null = null
    let pdfPublicUrl: string | null = null

    try {
        const pdfBuffer = Buffer.from(dados.pdfBase64, 'base64')
        const nomeArquivo = `${Date.now()}_${dados.pdfNomeOriginal.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const storagePath = `arquivos/${nomeArquivo}`

        const { data: uploadData, error: uploadError } = await admin.storage
            .from('curriculos')
            .upload(storagePath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (!uploadError && uploadData) {
            pdfStoragePath = uploadData.path
            const { data: urlData } = admin.storage.from('curriculos').getPublicUrl(storagePath)
            pdfPublicUrl = urlData?.publicUrl || null
        }
    } catch (e) {
        console.error('Erro ao armazenar PDF:', e)
        // Não bloqueia o fluxo — apenas loga
    }

    // ── 2. SANITIZAR E BUSCAR USUÁRIO E CANDIDATO EXISTENTES ──
    const emailSanitizado = sanitizarEmail(dados.email)
    const telefoneSanitizado = sanitizarTelefone(dados.telefone)
    const whatsappSanitizado = sanitizarTelefone(dados.whatsapp)

    let userId: number | null = null
    let userExistente = false
    // ID do candidato já existente (null = precisa criar novo)
    let existingCandidatoId: number | null = null

    // Buscar por e-mail primeiro (tabela users)
    if (emailSanitizado) {
        const { data: userPorEmail } = await admin.from('users').select('id').ilike('email', emailSanitizado).maybeSingle() as { data: any }
        if (userPorEmail) {
            userId = userPorEmail.id
            userExistente = true
        }
    }

    // Buscar por telefone / whatsapp / celular se não encontrou por email
    // Estratégia: pré-filtro com os últimos 6 dígitos (aparecem em qualquer formato),
    // depois filtragem JS sanitizando AMBOS os lados (input e valor do banco).
    if (!userId && (telefoneSanitizado || whatsappSanitizado)) {
        const numerosParaBuscar = [telefoneSanitizado, whatsappSanitizado].filter(Boolean)
        for (const num of numerosParaBuscar) {
            const sufixo = num.slice(-6) // últimos 6 dígitos — aparecem contíguos em qualquer formatação

            // Busca na tabela users (telefone, celular)
            const { data: usersPorTel } = await admin.from('users')
                .select('id, telefone, celular')
                .or(`telefone.ilike.%${sufixo}%,celular.ilike.%${sufixo}%`) as { data: any[] | null }
            const userMatch = (usersPorTel || []).find(u =>
                (u.telefone && sanitizarTelefone(u.telefone) === num) ||
                (u.celular  && sanitizarTelefone(u.celular)  === num)
            )
            if (userMatch) { userId = userMatch.id; userExistente = true; break }

            // Busca na tabela candidatos (telefone, whatsapp) — captura id DO CANDIDATO e user_id
            const { data: candsPorTel } = await admin.from('candidatos')
                .select('id, user_id, telefone, whatsapp')
                .or(`telefone.ilike.%${sufixo}%,whatsapp.ilike.%${sufixo}%`) as { data: any[] | null }
            const candMatch = (candsPorTel || []).find(c =>
                (c.telefone && sanitizarTelefone(c.telefone) === num) ||
                (c.whatsapp && sanitizarTelefone(c.whatsapp) === num)
            )
            if (candMatch) {
                userId = candMatch.user_id
                existingCandidatoId = candMatch.id  // ← candidato_id correto!
                userExistente = true
                break
            }
        }
    }

    // Se já temos userId mas ainda não verificamos se tem candidato na tabela candidatos
    if (userId && existingCandidatoId === null) {
        const { data: candExistente } = await admin.from('candidatos')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as { data: any }
        if (candExistente) {
            existingCandidatoId = candExistente.id
        }
    }

    // ── 3. CRIAR USUÁRIO SE NÃO EXISTE ──
    if (!userId) {
        // Gerar e-mail único para auth
        const nomeSlug = `${dados.nome}${dados.sobrenome}`.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
        const emailAuth = emailSanitizado || `${nomeSlug}_${Date.now()}@eco.com.br`
        const senhaTemp = `Eco@${Date.now().toString().slice(-6)}`

        // Criar na auth do Supabase
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email: emailAuth,
            password: senhaTemp,
            email_confirm: true,
        })

        if (authError || !authData.user) {
            return { success: false, error: `Erro ao criar usuário na auth: ${authError?.message || 'Desconhecido'}` }
        }

        // Criar na tabela users
        const { data: novoUser, error: userError } = await admin.from('users').insert({
            auth_id: authData.user.id,
            tipo: 'candidato',
            nome: dados.nome.trim(),
            sobrenome: dados.sobrenome?.trim() || null,
            email: emailAuth,
            telefone: dados.telefone?.trim() || null,
            celular: dados.whatsapp?.trim() || null,
            data_nascimento: dados.data_nascimento || null,
            cpf: dados.cpf || null,
            status: 'ativo',
        } as any).select('id').single() as { data: any, error: any }

        if (userError || !novoUser) {
            // Rollback da auth
            await admin.auth.admin.deleteUser(authData.user.id)
            return { success: false, error: `Erro ao criar usuário: ${userError?.message || 'Desconhecido'}` }
        }

        userId = novoUser.id
    }

    // ── 4. DETERMINAR O candidato_id CORRETO ──
    // Cenário A: candidato já existe → atualiza dados e usa id existente
    // Cenário B: user existe mas sem candidato / novo user → cria candidato
    let candId: number
    const emailCurriculo = emailSanitizado || `candidato_${userId}@eco.com.br`

    if (existingCandidatoId !== null) {
        // Candidato já existe: apenas atualizar dados principais
        candId = existingCandidatoId
        await (admin.from('candidatos') as any).update({
            nome_completo: `${dados.nome} ${dados.sobrenome}`.trim(),
            cargo_desejado: dados.cargo_desejado?.trim() || null,
            resumo: dados.resumo?.trim() || null,
            local: dados.local?.trim() || null,
            data_nascimento: dados.data_nascimento || null,
            email: emailCurriculo,
            telefone: dados.telefone?.trim() || null,
            whatsapp: dados.whatsapp?.trim() || null,
            linkedin: dados.linkedin?.trim() || null,
            portfolio: dados.portfolio?.trim() || null,
            github: dados.github?.trim() || null,
            disponivel: true,
            updated_at: new Date().toISOString(),
        } as any).eq('id', candId)
    } else {
        // Candidato não existe: criar novo registro
        const { data: candidato, error: candError } = await admin.from('candidatos').insert({
            user_id: userId,
            nome_completo: `${dados.nome} ${dados.sobrenome}`.trim(),
            cargo_desejado: dados.cargo_desejado?.trim() || null,
            resumo: dados.resumo?.trim() || null,
            local: dados.local?.trim() || null,
            data_nascimento: dados.data_nascimento || null,
            email: emailCurriculo,
            telefone: dados.telefone?.trim() || null,
            whatsapp: dados.whatsapp?.trim() || null,
            linkedin: dados.linkedin?.trim() || null,
            portfolio: dados.portfolio?.trim() || null,
            github: dados.github?.trim() || null,
            disponivel: true,
        } as any).select('id').single() as { data: any, error: any }

        if (candError || !candidato) {
            const msg = candError?.message?.includes('candidatos_user_id_key')
                ? 'O banco rejeitou múltiplos currículos. Rode: ALTER TABLE candidatos DROP CONSTRAINT candidatos_user_id_key;'
                : `Erro ao criar currículo: ${candError?.message || 'Desconhecido'}`
            return { success: false, error: msg }
        }

        candId = candidato.id
    }

    // ── 5. RECRIAR DADOS RELACIONADOS com o candidato_id correto ──
    // Apaga registros anteriores para evitar duplicatas (seja candidato novo ou existente)
    await (admin.from('candidato_experiencias') as any).delete().eq('candidato_id', candId)
    await (admin.from('candidato_formacoes') as any).delete().eq('candidato_id', candId)
    await (admin.from('candidato_habilidades') as any).delete().eq('candidato_id', candId)
    await (admin.from('candidato_idiomas') as any).delete().eq('candidato_id', candId)
    await (admin.from('candidato_categorias') as any).delete().eq('candidato_id', candId)

    const DATA_INICIO_FALLBACK = '1900-01-01' // fallback quando a IA não extrai a data

    const exps = (dados.experiencias || []).filter(e => e.cargo?.trim() || e.empresa?.trim())
        .map((e, idx) => ({
            candidato_id: candId,
            cargo: e.cargo?.trim() || 'Não informado',
            empresa: e.empresa?.trim() || 'Não informada',
            descricao: e.descricao?.trim() || null,
            data_inicio: e.data_inicio || DATA_INICIO_FALLBACK,  // NOT NULL no banco
            data_fim: e.em_andamento ? null : (e.data_fim || null),
            em_andamento: e.em_andamento,
            ordem: idx,
        }))
    if (exps.length > 0) {
        const { error: expErr } = await admin.from('candidato_experiencias').insert(exps as any)
        if (expErr) console.error('[cadastrarCandidatoViaPDF] Erro ao inserir experiencias:', expErr.message)
    }

    const forms = (dados.formacoes || []).filter(f => f.curso?.trim() || f.instituicao?.trim())
        .map((f, idx) => ({
            candidato_id: candId,
            curso: f.curso?.trim() || 'Não informado',
            instituicao: f.instituicao?.trim() || 'Não informada',
            grau: f.grau?.trim() || null,
            data_inicio: f.data_inicio || DATA_INICIO_FALLBACK,  // NOT NULL no banco
            data_fim: f.em_andamento ? null : (f.data_fim || null),
            em_andamento: f.em_andamento,
            ordem: idx,
        }))
    if (forms.length > 0) {
        const { error: formErr } = await admin.from('candidato_formacoes').insert(forms as any)
        if (formErr) console.error('[cadastrarCandidatoViaPDF] Erro ao inserir formacoes:', formErr.message)
    }

    const habs = (dados.habilidades || []).filter(h => h?.trim())
        .map((h, idx) => ({ candidato_id: candId, texto: h.trim(), ordem: idx }))
    if (habs.length > 0) await admin.from('candidato_habilidades').insert(habs as any)

    const idiomas = (dados.idiomas || []).filter(i => i.idioma?.trim())
        .map((i, idx) => ({ candidato_id: candId, idioma: i.idioma.trim(), nivel: i.nivel || null, ordem: idx }))
    if (idiomas.length > 0) await admin.from('candidato_idiomas').insert(idiomas as any)

    const categorias = dados.categoriaIds || []
    if (categorias.length > 0) {
        const catRows = categorias.map(cId => ({ candidato_id: candId, categoria_id: cId }))
        await admin.from('candidato_categorias').insert(catRows as any)
    }

    // ── 6. REGISTRAR DOCUMENTO PDF NA TABELA candidato_documentos ──
    if (pdfPublicUrl || pdfStoragePath) {
        await admin.from('candidato_documentos').insert({
            candidato_id: candId,
            titulo: 'Currículo (PDF)',
            tipo: 'PDF',
            url: pdfPublicUrl || pdfStoragePath,
            ordem: 0,
        } as any)
    }

    return {
        success: true,
        candidatoId: candId,
        userId,
        userExistente,
    }
}

// ── Buscar currículo PDF de um usuário (para /admin/usuarios) ──
export async function buscarDocumentoPDFDoUsuario(userId: number): Promise<{ url: string, candidatoId: number } | null> {
    try {
        const admin = createAdminClient()
        const { data } = await admin.from('candidatos')
            .select('id, candidato_documentos(url, tipo, titulo)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as { data: any }

        if (!data) return null
        const docs: any[] = data.candidato_documentos || []
        const pdfDoc = docs.find((d: any) => d.tipo === 'PDF' || d.titulo?.toLowerCase().includes('pdf') || d.url?.toLowerCase().endsWith('.pdf'))
        if (!pdfDoc) return null
        return { url: pdfDoc.url, candidatoId: data.id }
    } catch { return null }
}

// ── Upload de currículo PDF para usuário existente (modal /admin/usuarios) ──
export async function uploadCurriculoPDFExistente(userId: number, base64PDF: string, nomeOriginal: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return { success: false, error: 'Não autenticado.' }

    const admin = createAdminClient()
    const { data: adminUser } = await admin.from('users').select('id, tipo').eq('auth_id', authUser.id).single() as { data: any }
    if (!adminUser || adminUser.tipo !== 'admin') return { success: false, error: 'Apenas admins.' }

    try {
        const pdfBuffer = Buffer.from(base64PDF, 'base64')
        const safe = nomeOriginal.replace(/[^a-zA-Z0-9._-]/g, '_')
        const storagePath = `arquivos/${Date.now()}_${safe}`

        const { data: uploadData, error: uploadError } = await admin.storage
            .from('curriculos').upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: false })

        if (uploadError) return { success: false, error: uploadError.message }

        const { data: urlData } = admin.storage.from('curriculos').getPublicUrl(uploadData.path)
        const publicUrl = urlData?.publicUrl || null

        // Buscar ou criar candidato para esse user
        let { data: cand } = await admin.from('candidatos').select('id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle() as { data: any }
        if (!cand) {
            const { data: u } = await admin.from('users').select('nome, sobrenome, email').eq('id', userId).single() as { data: any }
            const { data: newCand } = await admin.from('candidatos').insert({
                user_id: userId,
                nome_completo: `${u?.nome || ''} ${u?.sobrenome || ''}`.trim(),
                email: u?.email || `candidato_${userId}@eco.com.br`,
                disponivel: true,
            } as any).select('id').single() as { data: any }
            cand = newCand
        }

        if (!cand) return { success: false, error: 'Erro ao localizar/criar currículo.' }

        await admin.from('candidato_documentos').insert({
            candidato_id: cand.id, titulo: 'Currículo (PDF)', tipo: 'PDF', url: publicUrl || storagePath, ordem: 0,
        } as any)

        return { success: true, url: publicUrl }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ── Buscar Candidato por ID (para edição) ──
export async function buscarCandidatoPorId(id: number) {
    try {
        const admin = await requireAdmin()
        
        const { data, error } = await (admin
            .from('candidatos') as any)
            .select(`
                *,
                candidato_experiencias(*),
                candidato_formacoes(*),
                candidato_habilidades(*),
                candidato_idiomas(*),
                candidato_documentos(*)
            `)
            .eq('id', id)
            .single()

        if (error) return { success: false, error: error.message, data: null }
        return { success: true, data }
    } catch (e: any) {
        return { success: false, error: e.message, data: null }
    }
}

// ============ CATEGORIAS ============

export async function listarVagaCategorias() {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('vaga_categorias')
        .select('id, descricao, slug')
        .order('descricao') as { data: any; error: any }
    if (error || !data) return []
    return data as { id: number; descricao: string; slug: string }[]
}

export async function buscarCategoriasDoCandidato(candidatoId: number) {
    const admin = createAdminClient()
    const { data } = await admin
        .from('candidato_categorias')
        .select('categoria_id')
        .eq('candidato_id', candidatoId) as { data: any }
    return (data || []).map((r: any) => r.categoria_id as number)
}

export async function salvarCategoriasCandidato(candidatoId: number, categoriaIds: number[]) {
    try {
        const admin = await requireAdmin()
        await admin.from('candidato_categorias').delete().eq('candidato_id', candidatoId)
        if (categoriaIds.length > 0) {
            const rows = categoriaIds.map(catId => ({ candidato_id: candidatoId, categoria_id: catId }))
            const { error } = await admin.from('candidato_categorias').insert(rows as any)
            if (error) return { success: false, error: error.message }
        }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function buscarCandidatoParaCategorizacao(candidatoId: number) {
    try {
        const admin = await requireAdmin()
        const { data, error } = await (admin.from('candidatos') as any)
            .select('nome_completo, cargo_desejado, resumo, candidato_experiencias(cargo, empresa, descricao), candidato_formacoes(curso, instituicao, grau), candidato_habilidades(texto), candidato_idiomas(idioma, nivel)')
            .eq('id', candidatoId)
            .single()
        if (error || !data) return null
        return data
    } catch {
        return null
    }
}

/**
 * Busca o PDF de currículo de um candidato (pelo candidato_id) e retorna base64 + nome.
 * Usado pelo botão "Usar arquivo já carregado" nos modais de extração via IA.
 */
export async function buscarPdfBase64DoCandidato(candidatoId: number): Promise<{ base64: string, nome: string } | null> {
    try {
        const admin = await requireAdmin()

        // Busca todos os documentos do candidato
        const { data: docs, error } = await (admin.from('candidato_documentos') as any)
            .select('url, titulo, tipo')
            .eq('candidato_id', candidatoId)

        if (error) {
            console.error('[buscarPdfBase64] Query error:', error.message)
            return null
        }

        if (!docs || docs.length === 0) {
            console.warn('[buscarPdfBase64] Nenhum documento para candidato_id:', candidatoId)
            return null
        }

        // Localiza o PDF pelo tipo ou título ou extensão
        const pdfDoc = (docs as any[]).find((d: any) =>
            d.tipo?.toUpperCase() === 'PDF' ||
            d.titulo?.toLowerCase().includes('pdf') ||
            d.url?.toLowerCase().endsWith('.pdf')
        )

        if (!pdfDoc?.url) {
            console.warn('[buscarPdfBase64] Nenhum PDF encontrado. Docs:', JSON.stringify(docs))
            return null
        }

        // Extrai o storage path da URL pública
        // Formato: https://xxx.supabase.co/storage/v1/object/public/curriculos/arquivos/filename.pdf
        const match = pdfDoc.url.match(/\/public\/curriculos\/(.+?)(\?|$)/)
        if (!match) {
            console.warn('[buscarPdfBase64] URL fora do padrão esperado:', pdfDoc.url)
            return null
        }

        const storagePath = decodeURIComponent(match[1])
        const nome = storagePath.split('/').pop() || 'curriculo.pdf'

        // Download via Supabase Storage SDK (não depende de fetch externo)
        const { data: blob, error: downloadError } = await admin.storage
            .from('curriculos')
            .download(storagePath)

        if (downloadError || !blob) {
            console.error('[buscarPdfBase64] Download error:', downloadError?.message, 'path:', storagePath)
            return null
        }

        const arrayBuffer = await blob.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        return { base64, nome }
    } catch (e: any) {
        console.error('[buscarPdfBase64] Exceção:', e?.message)
        return null
    }
}
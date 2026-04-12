'use server'

import { requireAdmin } from '@/lib/server-auth'
import { StatusUsuario, TipoUsuario, User } from '@/types/user'
import { revalidatePath } from 'next/cache'

export async function listarUsuarios() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return [];
    }
    
    const { data, error } = await (admin.from('users') as any)
        .select(`
            *,
            empresas (
                id,
                nome_fantasia,
                razao_social
            )
        `)
        .order('created_at', { ascending: false })
    
    if (error) return []

    // Busca separada pra candidatos (FK inverso não é embedded automaticamente)
    const candidatoUsers = (data || []).filter((u: any) => u.tipo === 'candidato')
    if (candidatoUsers.length > 0) {
        const ids = candidatoUsers.map((u: any) => u.id)
        const { data: cands } = await (admin.from('candidatos') as any)
            .select('user_id, whatsapp, telefone')
            .in('user_id', ids)
        
        const candMap: Record<number, any> = {}
        for (const c of (cands || [])) candMap[c.user_id] = c

        return (data || []).map((u: any) => ({
            ...u,
            _candidato: candMap[u.id] || null
        }))
    }

    return data || []
}

export async function buscarUsuario(id: number) {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return null;
    }
    const { data, error } = await admin.from('users').select('*').eq('id', id).single()
    if (error) return null;
    return data;
}

export async function atualizarStatusUsuario(id: number, status: StatusUsuario) {
    const admin = await requireAdmin();
    const { error } = await (admin.from('users') as any).update({ status }).eq('id', id)
    if (!error) revalidatePath('/admin/usuarios')
    return { success: !error, error: error?.message }
}

export async function excluirUsuario(id: number) {
    const admin = await requireAdmin();
    
    const { data } = await (admin.from('users') as any).select('auth_id').eq('id', id).single();
    if (!data) return { success: false, error: 'Usuário não encontrado' };
    
    // Apaga usuário no supabase auth (que delega em cascade)
    const { error: authError } = await admin.auth.admin.deleteUser(data.auth_id);
    if (authError) return { success: false, error: authError.message };
    
    const { error } = await (admin.from('users') as any).delete().eq('id', id);
    if (!error) revalidatePath('/admin/usuarios')
    return { success: !error, error: error?.message }
}

export async function atualizarTipoUsuario(id: number, tipo: TipoUsuario) {
    const admin = await requireAdmin();
    const { error } = await (admin.from('users') as any).update({ tipo }).eq('id', id)
    if (!error) revalidatePath('/admin/usuarios/[id]')
    return { success: !error, error: error?.message }
}

export async function atualizarSenhaUsuario(id: number, novaSenha: string) {
    const admin = await requireAdmin();
    
    const { data } = await (admin.from('users') as any).select('auth_id').eq('id', id).single();
    if (!data) return { success: false, error: 'Usuário não encontrado' };
    
    const { error } = await admin.auth.admin.updateUserById(data.auth_id, { password: novaSenha });
    return { success: !error, error: error?.message }
}

// Atualizaçoes dinâmicas permitidas pelas telas de forms (baseado do tipo)
export async function atualizarDadosUsuario(id: number, payload: Partial<User>) {
    const admin = await requireAdmin();
    const { error } = await (admin.from('users') as any).update(payload).eq('id', id)
    if (!error) revalidatePath('/admin/usuarios/[id]')
    return { success: !error, error: error?.message }
}

export async function getPerfilCompleto(id: number) {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return null;
    }
    const { data: user } = await (admin.from('users') as any).select('*').eq('id', id).single();
    if (!user) return null;

    if (user.tipo === 'candidato') {
        const { data: candidato } = await (admin.from('candidatos') as any).select('*').eq('user_id', user.id).single();
        return { ...user, candidato_perfil: candidato || null };
    }
    
    if (user.tipo === 'empregador') {
        const { data: empresas } = await (admin.from('empresas') as any).select('*').eq('user_id', user.id);
        return { ...user, empresas: empresas || [] };
    }

    return { ...user };
}

// ── Sincronizar usuários candidatos que não têm registro em candidatos ──
export async function sincronizarCandidatosOrfaos() {
    let admin;
    try {
        admin = await requireAdmin();
    } catch {
        return { success: false, error: 'Sem permissão', criados: 0 };
    }

    // Passo 1: pega todos os user_ids que já têm registro em candidatos
    const { data: jaExistem } = await (admin.from('candidatos') as any)
        .select('user_id')

    const idsComRegistro = new Set((jaExistem || []).map((c: any) => c.user_id))

    // Passo 2: busca todos users candidatos sem registro
    const { data: todosCandidatoUsers, error } = await (admin.from('users') as any)
        .select('id, nome, sobrenome, email, telefone, area_interesse, data_nascimento, status')
        .eq('tipo', 'candidato')

    if (error) return { success: false, error: error.message, criados: 0 }

    const semRegistro = (todosCandidatoUsers || []).filter((u: any) => !idsComRegistro.has(u.id))

    if (semRegistro.length === 0) {
        return { success: true, criados: 0, mensagem: 'Todos os candidatos já possuem perfil criado!' }
    }

    // Insere em lote com mapeamento inteligente de colunas
    const inserts = semRegistro.map((u: any) => ({
        user_id: u.id,
        nome_completo: [u.nome, u.sobrenome].filter(Boolean).join(' ') || u.email.split('@')[0],
        email: u.email,
        telefone: u.telefone || null,
        whatsapp: u.telefone || null,        // mesma origem, campo duplicado
        data_nascimento: u.data_nascimento || null,
        cargo_desejado: u.area_interesse || null,  // area_interesse → cargo_desejado
        status: u.status === 'bloqueado' ? 'bloqueado' : 'ativo',
        disponivel: u.status === 'ativo',
    }))

    const { error: insertError } = await (admin.from('candidatos') as any).insert(inserts)

    if (insertError) return { success: false, error: insertError.message, criados: 0 }

    revalidatePath('/admin/usuarios')
    return { success: true, criados: inserts.length }
}

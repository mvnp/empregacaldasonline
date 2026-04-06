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
    
    // Explicitly excluding rows if needed, or join with other data
    const { data, error } = await admin.from('users').select('*').order('created_at', { ascending: false })
    if (error) return []
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

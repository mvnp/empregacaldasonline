import { createServerSupabaseClient } from '@/lib/supabase'

export async function getSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function getUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function signIn(email: string, password: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

export async function signOut() {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

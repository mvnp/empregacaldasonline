import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (para Server Components e Actions)
export async function createServerSupabaseClient() {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // Em Server Components, set de cookies pode falhar — ignorar
                }
            },
        },
    })
}

// Static client (sem cookies, para cache e RSC sem auth)
export function createStaticClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

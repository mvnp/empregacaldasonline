import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Arquivos estáticos: deixar passar
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next()
    }

    // Criar Supabase client com cookies
    let response = NextResponse.next({ request })
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Atualizar sessão (refresh token se necessário)
    const { data: { user } } = await supabase.auth.getUser()

    // Rotas públicas
    const isPublica = pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/cadastro') ||
        pathname.startsWith('/esqueci-a-senha') ||
        pathname.startsWith('/blog') ||
        pathname.startsWith('/vagas')

    if (isPublica) {
        // Se já logado e acessa /login, redireciona pra /admin
        if (user && pathname === '/login') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        return response
    }

    // Rotas protegidas (/admin/*): exigir autenticação
    if (pathname.startsWith('/admin') && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Verificação de permissão por tipo fica nos Server Components
    // via verificarPermissao() — o middleware só garante que está logado
    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

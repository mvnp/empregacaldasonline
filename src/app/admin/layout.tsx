import { getUsuarioLogado, verificarOnboardingCandidato } from '@/actions/auth'
import AdminLayoutClient from './AdminLayoutClient'
import { UserProvider } from '@/contexts/UserContext'
import { cookies } from 'next/headers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getUsuarioLogado()
    const cookieStore = await cookies()
    const isImpersonating = !!cookieStore.get('admin_impersonation')?.value

    // Carrega status de onboarding apenas para candidatos
    const onboarding = user?.tipo === 'candidato'
        ? await verificarOnboardingCandidato()
        : null

    return (
        <UserProvider user={user} onboarding={onboarding}>
            <AdminLayoutClient isImpersonating={isImpersonating}>
                {children}
            </AdminLayoutClient>
        </UserProvider>
    )
}

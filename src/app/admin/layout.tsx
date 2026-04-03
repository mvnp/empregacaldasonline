import { getUsuarioLogado } from '@/actions/auth'
import AdminLayoutClient from './AdminLayoutClient'
import { UserProvider } from '@/contexts/UserContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getUsuarioLogado()
    
    return (
        <UserProvider user={user}>
            <AdminLayoutClient>
                {children}
            </AdminLayoutClient>
        </UserProvider>
    )
}

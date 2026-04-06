import { buscarUsuario } from '@/actions/admin_users'
import AdminEditarUserClient from './AdminEditarUserClient'

export const dynamic = 'force-dynamic'

export default async function AdminEditarUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    const user = await buscarUsuario(userId);

    if (!user) {
        return <div style={{ padding: '2rem' }}>Usuário não encontrado.</div>
    }

    return <AdminEditarUserClient user={user} />
}

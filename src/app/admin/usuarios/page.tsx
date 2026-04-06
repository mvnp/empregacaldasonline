import { listarUsuarios } from '@/actions/admin_users'
import AdminUsuariosClient from './AdminUsuariosClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsuariosPage() {
    const data = await listarUsuarios()
    return <AdminUsuariosClient usuarios={data} />
}

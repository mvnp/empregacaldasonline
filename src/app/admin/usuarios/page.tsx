import { listarUsuarios, listarUsuariosUltimosCandidatos } from '@/actions/admin_users'
import AdminUsuariosClient from './AdminUsuariosClient'

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: Promise<{ filtroTipo?: string }>
}

export default async function AdminUsuariosPage({ searchParams }: Props) {
    const { filtroTipo } = await searchParams

    const data = filtroTipo === 'ultimos_candidatos'
        ? await listarUsuariosUltimosCandidatos()
        : await listarUsuarios()

    return <AdminUsuariosClient usuarios={data} filtroTipoInicial={filtroTipo ?? ''} />
}

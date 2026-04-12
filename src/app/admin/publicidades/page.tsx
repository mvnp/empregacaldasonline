import { listarPublicidades } from '@/actions/publicidade'
import PublicidadesClient from './PublicidadesClient'

export const dynamic = 'force-dynamic'

export default async function AdminPublicidadesPage() {
    const res = await listarPublicidades()
    const publicidades = res.success ? (res.publicidades || []) : []

    return <PublicidadesClient publicidades={publicidades} />
}

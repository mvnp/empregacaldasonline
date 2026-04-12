import { buscarPublicidade } from '@/actions/publicidade'
import EditarPublicidadeClient from './EditarPublicidadeClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditarPublicidadePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const pId = Number(id)
    if (!pId) redirect('/admin/publicidades')

    const publicidade = await buscarPublicidade(pId)
    if (!publicidade) redirect('/admin/publicidades')

    return <EditarPublicidadeClient publicidade={publicidade} />
}

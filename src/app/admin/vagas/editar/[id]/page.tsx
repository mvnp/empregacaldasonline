import { buscarVaga } from '@/actions/vagas'
import { redirect } from 'next/navigation'
import VagaFormClient from '../../VagaFormClient'

export const dynamic = 'force-dynamic'

export default async function EditarVagaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const vagaId = parseInt(id, 10)

    if (isNaN(vagaId)) {
        redirect('/admin/vagas')
    }

    const vaga = await buscarVaga(vagaId)

    if (!vaga) {
        redirect('/admin/vagas')
    }

    return <VagaFormClient initialData={vaga} vagaId={vagaId} isEdit={true} />
}

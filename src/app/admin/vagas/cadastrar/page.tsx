import VagaFormClient from '../VagaFormClient'
import { buscarVaga } from '@/actions/vagas'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CadastrarVagaPage({ searchParams }: { searchParams: Promise<{ clone?: string }> }) {
    const sp = await searchParams
    const cloneId = sp.clone ? parseInt(sp.clone, 10) : null

    let initialData = undefined;
    if (cloneId) {
        const vaga = await buscarVaga(cloneId)
        if (vaga) {
            // Remova o ID e reset o status pra ser clonada limpa
            const { id, created_at, ...resto } = vaga;
            initialData = { ...resto, titulo: `${resto.titulo} (Cópia)` }
        }
    }

    return <VagaFormClient initialData={initialData} />
}

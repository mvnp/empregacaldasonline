import { Suspense } from 'react'
import AdminVagasClient from './AdminVagasClient'

export const dynamic = 'force-dynamic'

export default function AdminVagasPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AdminVagasClient />
        </Suspense>
    )
}

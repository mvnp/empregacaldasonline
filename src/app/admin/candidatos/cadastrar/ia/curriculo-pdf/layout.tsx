import { requireAdmin } from '@/lib/server-auth'
import { redirect } from 'next/navigation'

export default async function CurriculoPDFLayout({ children }: { children: React.ReactNode }) {
    try {
        await requireAdmin()
    } catch {
        redirect('/admin/candidato/listar-curriculos')
    }
    return <>{children}</>
}

import { buscarDadosDashboard } from '@/actions/dashboard'
import AdminDashboardClient from './AdminDashboardClient'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
    const dados = await buscarDadosDashboard(1, 1)

    if (!dados) {
        redirect('/login')
    }

    return <AdminDashboardClient initialData={dados} />
}

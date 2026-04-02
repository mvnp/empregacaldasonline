import { listarVagas } from '@/actions/vagas'
import AdminVagasClient from './AdminVagasClient'
import { VagaAdmin } from '@/data/admin'

export const dynamic = 'force-dynamic'

export default async function AdminVagasPage() {
    const data = await listarVagas()

    // Map from database Vaga to VagaAdmin
    const mappedVagas: VagaAdmin[] = data.map((v: any) => {
        const dataObj = new Date(v.created_at)
        const dia = String(dataObj.getDate()).padStart(2, '0')
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
        const ano = dataObj.getFullYear()
        
        return {
            id: v.id,
            titulo: v.titulo,
            empresa: v.empresa,
            local: v.local || 'Não informado',
            modalidade: v.modalidade,
            candidaturas: (v.candidaturas || []).length,
            status: v.status as 'ativa' | 'pausada' | 'expirada',
            dataPublicacao: `${ano}-${mes}-${dia}`,
            salario: v.salario_min ? `R$ ${v.salario_min}` : 'A combinar',
            nivel: v.nivel
        }
    })

    return <AdminVagasClient vagas={mappedVagas} />
}

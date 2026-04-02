import { listarCandidatos } from '@/actions/candidatos'
import AdminCandidatosClient from './AdminCandidatosClient'
import { CandidatoAdmin } from '@/data/admin'

export const dynamic = 'force-dynamic'

function calcularTempoExperiencia(dataInicioStr: string | undefined): number {
    if (!dataInicioStr) return 0
    const dIni = new Date(dataInicioStr)
    const agora = new Date()
    return Math.max(0, agora.getFullYear() - dIni.getFullYear())
}

export default async function AdminCandidatosPage() {
    const data = await listarCandidatos()

    // Mapear p/ o CandidatoAdmin UI
    const mappedCandidatos: CandidatoAdmin[] = data.map((c: any) => {
        const habs = c.candidato_habilidades || []
        const exps = c.candidato_experiencias || []

        // Encontrar data de inicio mais antiga (mock de tempo total exp)
        let maxAnos = 0
        if (exps.length > 0) {
            exps.forEach((exp: any) => {
                const anos = calcularTempoExperiencia(exp.data_inicio)
                if (anos > maxAnos) maxAnos = anos
            })
        }
        
        let experienciaStr = maxAnos > 0 ? `${maxAnos} anos` : 'Menos de 1 ano'

        // Puxando contagem exata de candidaturas aplicadas por esse candiato
        const countCandidatas = (c.candidaturas || []).length

        return {
            id: c.id,
            nome: c.nome_completo,
            email: c.email,
            cargo: c.cargo_desejado || 'Não especificado',
            local: c.local || 'Localização não informada',
            experiencia: experienciaStr,
            habilidades: habs.map((h: any) => h.texto),
            dataCadastro: c.created_at.split('T')[0],
            status: c.status as 'ativo' | 'inativo',
            candidaturas: countCandidatas
        }
    })

    return <AdminCandidatosClient candidatos={mappedCandidatos} />
}

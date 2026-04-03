import { listarEmpresas } from '@/actions/empresas'
import AdminEmpresasClient from './AdminEmpresasClient'
import { EmpresaAdmin } from '@/data/admin'

export const dynamic = 'force-dynamic'

export default async function AdminEmpresasPage() {
    const data = await listarEmpresas()

    const mappedEmpresas: EmpresaAdmin[] = data.map((e: any) => {
        const vagasTotais = (e.vagas || []).length
        const vagasAtivas = (e.vagas || []).filter((v: any) => v.status === 'ativa').length
        
        return {
            id: e.id,
            nome: e.nome_fantasia || e.razao_social,
            setor: 'Tecnologia', // Pode ser extraído ou adicionar coluna no BD posteriormente
            local: e.local || 'Local não informado',
            plano: 'profissional', // Mantendo a lógica de estilo UI do Client
            telefone: e.telefone,
            totalFuncionarios: typeof e.qtd_funcionarios === 'number' ? e.qtd_funcionarios : 10,
            vagasAtivas: vagasAtivas,
            status: e.status, // ativa, inativa, pendente
            dataCadastro: e.created_at ? e.created_at.split('T')[0] : 'Desconhecida'
        }
    })

    return <AdminEmpresasClient empresas={mappedEmpresas} />
}

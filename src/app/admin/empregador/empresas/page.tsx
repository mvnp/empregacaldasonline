import { listarMinhasEmpresas } from '@/actions/empresas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, Plus } from 'lucide-react'
import EmpresaCard from '@/components/admin/EmpresaCard'

export const dynamic = 'force-dynamic'

export default async function MinhasEmpresasPage() {
    const empresas = await listarMinhasEmpresas()

    return (
        <div>
            <AdminPageHeader
                titulo="Minhas Empresas"
                subtitulo={`${empresas.length} empresas sob sua administração`}
                acao={
                    <button
                        title="Nova Empresa (Em breve)"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                            color: '#fff', border: 'none', borderRadius: 12,
                            padding: '0.65rem 1.1rem', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.82rem',
                            boxShadow: '0 2px 8px rgba(9,53,95,0.18)',
                            transition: 'opacity 0.15s',
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Empresa
                    </button>
                }
            />

            {empresas.length === 0 ? (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: 14, textAlign: 'center', color: '#64748b' }}>
                    <Building2 style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhuma empresa cadastrada no momento.</p>
                </div>
            ) : (
                <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {empresas.map((e: any) => {
                        const vagasTotais = e.vagas?.length || 0
                        return (
                            <EmpresaCard
                                key={e.id}
                                id={e.id}
                                nome={e.nome_fantasia || e.razao_social}
                                local={e.local}
                                status={e.status}
                                vagasTotais={vagasTotais}
                                tipoUsuario="empregador"
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

import { listarEmpresasPublicas } from '@/actions/empresas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import { Building2, MapPin, Briefcase } from 'lucide-react'
import EmpresaCard from '@/components/admin/EmpresaCard'

export const dynamic = 'force-dynamic'

export default async function EmpresasCandidatoPage() {
    const empresas = await listarEmpresasPublicas()

    return (
        <div>
            <AdminPageHeader
                titulo="Empresas"
                subtitulo={`${empresas.length} empresas disponíveis`}
            />

            {empresas.length === 0 ? (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: 14, textAlign: 'center', color: '#64748b' }}>
                    <Building2 style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhuma empresa parceira disponível no momento.</p>
                </div>
            ) : (
                <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {empresas.map((e: any) => {
                        const vagasAtivas = e.vagas?.filter((v: any) => v.status === 'ativa').length || 0

                        return (
                            <EmpresaCard
                                key={e.id}
                                id={e.id}
                                nome={e.nome_fantasia || e.razao_social}
                                local={e.local}
                                status={e.status}
                                vagasAtivas={vagasAtivas}
                                tipoUsuario="candidato"
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

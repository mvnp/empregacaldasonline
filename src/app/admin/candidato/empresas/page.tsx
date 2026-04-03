import { listarEmpresasPublicas } from '@/actions/empresas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import { Building2, MapPin, Briefcase } from 'lucide-react'

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
                        const backgroundGradient = 'linear-gradient(135deg, #09355F, #2AB9C0)' // Padrão bonito

                        return (
                            <div key={e.id} style={{
                                background: '#fff', borderRadius: 14, padding: '1.25rem',
                                border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                                transition: 'border-color 0.18s, box-shadow 0.18s', cursor: 'pointer',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 9999,
                                        fontSize: '0.68rem', fontWeight: 700,
                                        background: '#f0f4f8', color: '#64748b',
                                    }}>
                                        Parceira
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 12,
                                        background: backgroundGradient,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Building2 style={{ width: 22, height: 22, color: '#fff' }} />
                                    </div>
                                    <div style={{ minWidth: 0, paddingRight: 40 }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {e.nome_fantasia}
                                        </h3>
                                        {e.local && (
                                            <p style={{ fontSize: '0.78rem', color: '#FE8341', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                                                <MapPin style={{ width: 12, height: 12 }} /> {e.local}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{vagasAtivas}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>Vagas ativas</p>
                                    </div>
                                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>✓</p>
                                        <p style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: 2 }}>Verificada</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        <Briefcase style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Oportunidades abertas
                                    </span>
                                    <Link href={`/admin/candidato/vagas?empresa=${e.id}`} style={{
                                        background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                        padding: '0.3rem 0.7rem', cursor: 'pointer',
                                        fontSize: '0.72rem', fontWeight: 600, color: '#FE8341',
                                        textDecoration: 'none',
                                    }}>
                                        Ver vagas
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

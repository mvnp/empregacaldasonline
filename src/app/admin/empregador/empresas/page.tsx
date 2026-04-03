import { listarMinhasEmpresas } from '@/actions/empresas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, Plus } from 'lucide-react'

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
                        const backgroundGradient = 'linear-gradient(135deg, #FBBF53, #FE8341)' 

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
                                        background: e.status === 'ativa' ? '#dcfce7' : '#fef2f2',
                                        color: e.status === 'ativa' ? '#16a34a' : '#dc2626',
                                    }}>
                                        {e.status === 'ativa' ? 'Ativa' : 'Inativa'}
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
                                        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{vagasTotais}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>Vagas Criadas</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        <Briefcase style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Suas operações
                                    </span>
                                    <Link href={`/admin/empregador/vagas?empresa=${e.id}`} style={{
                                        background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                        padding: '0.3rem 0.7rem', cursor: 'pointer',
                                        fontSize: '0.72rem', fontWeight: 600, color: '#2AB9C0',
                                        textDecoration: 'none',
                                    }}>
                                        Gerenciar
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

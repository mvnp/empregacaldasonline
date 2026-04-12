import Link from 'next/link'
import { CheckCircle2, Star, Gift, DollarSign, Briefcase, Building2, Send } from 'lucide-react'
import { VagaPublica } from '@/actions/vagas'
import BannerSpace from '@/components/publicidade/BannerSpace'

interface VagaDetailDisplayProps {
    vaga: any
    empresaPerfil: any
    salario: string
    regime: string
    horario: string
    actionButton?: React.ReactNode
}

export default function VagaDetailDisplay({ vaga, empresaPerfil, salario, regime, horario, actionButton }: VagaDetailDisplayProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }} className="vaga-detail-grid">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Descrição */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Descrição da Vaga
                    </h2>
                    <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.8 }}>
                        {(vaga.descricao || '').split('\n').map((p: string, i: number) => (
                            <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
                        ))}
                    </div>
                </div>

                {/* Banner H2 / G2 - Abaixo da Descrição */}
                <BannerSpace formato="leaderboard" className="ad-detail-vaga" />

                {/* Responsabilidades */}
                {vaga.responsabilidades && vaga.responsabilidades.length > 0 && (
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 style={{ color: '#16a34a' }} /> Responsabilidades
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {vaga.responsabilidades.map((r: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: 9 }} />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Requisitos */}
                {vaga.requisitos && vaga.requisitos.length > 0 && (
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star style={{ color: '#FE8341' }} /> Requisitos
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {vaga.requisitos.map((r: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE8341', flexShrink: 0, marginTop: 9 }} />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Diferenciais */}
                {vaga.diferenciais && vaga.diferenciais.length > 0 && (
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star style={{ color: '#FBBF53' }} /> Diferenciais
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {vaga.diferenciais.map((d: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF53', flexShrink: 0, marginTop: 9 }} />
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sidebar Direita */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>

                {/* Cartão Sobre a Empresa */}
                {empresaPerfil && (
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5', textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14, margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem', fontWeight: 800, color: '#fff'
                        }}>
                            <Building2 style={{ width: 24, height: 24 }} />
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.25rem' }}>
                            {vaga.empresa === 'Empresa: Cadastre-se ou faça login' ? (
                                <span>
                                    <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>Cadastre-se</Link> ou faça{' '}
                                    <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>login</Link>
                                </span>
                            ) : (
                                empresaPerfil.nome_fantasia
                            )}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem' }}>{empresaPerfil.setor || 'Central'} · {empresaPerfil.local || vaga.local}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '0', borderTop: '1px solid #f0f4f8', paddingTop: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{empresaPerfil.vagas?.filter((v: any) => v.status === 'ativa').length || 1}</p>
                                <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Vagas Ativas</p>
                            </div>
                            {empresaPerfil.tamanho_empresa && (
                                <>
                                    <div style={{ width: 1, background: '#f0f4f8' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{empresaPerfil.tamanho_empresa || '-'}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Funcionários</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Cartão de Resumo e Ação */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #2AB9C0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2AB9C0' }}>
                                <DollarSign style={{ width: 20, height: 20 }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem' }}>Salário</p>
                                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{salario}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FE8341' }}>
                                <Briefcase style={{ width: 20, height: 20 }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem' }}>Regime</p>
                                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0 }}>{regime} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {horario}</span></p>
                            </div>
                        </div>
                    </div>

                    {actionButton || (
                        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(254,131,65,0.25)' }}>
                            Candidatar-se <Send style={{ width: 16, height: 16 }} />
                        </button>
                    )}
                </div>

                {/* Benefícios */}
                {vaga.beneficios && vaga.beneficios.length > 0 && (
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e8edf5' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Gift style={{ color: '#FBBF53', width: 20, height: 20 }} /> Benefícios Principais
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {vaga.beneficios.map((b: string, i: number) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#475569' }}>
                                    <Gift style={{ width: 14, height: 14, color: '#FBBF53' }} />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Banner H1 / G1 = Fim da Sidebar */}
                <BannerSpace formato="rectangle" className="ad-detail-vaga-sidebar" />
            </div>

            <style suppressHydrationWarning>{`
                @media (max-width: 900px) {
                    .vaga-detail-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    )
}

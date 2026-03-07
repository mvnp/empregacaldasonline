'use client'

import { use } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, MapPin, Building2, Briefcase, Calendar, Users,
    Clock, DollarSign, CheckCircle2, Star, Gift, FileText,
    ExternalLink, Eye
} from 'lucide-react'
import { getVagaDetalhe, getStatusColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function getStatusCandidaturaColor(status: string) {
    switch (status) {
        case 'aprovado': return { bg: '#e8f5e9', color: '#2e7d32', label: 'Aprovado' }
        case 'recusado': return { bg: '#ffebee', color: '#c62828', label: 'Recusado' }
        case 'entrevista': return { bg: '#e3f2fd', color: '#1565c0', label: 'Entrevista' }
        case 'em_analise': return { bg: '#fff3e0', color: '#e65100', label: 'Em Análise' }
        case 'pendente': return { bg: '#f3e8ff', color: '#7c3aed', label: 'Pendente' }
        default: return { bg: '#e8ecf5', color: '#09355F', label: status }
    }
}

const sectionStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5',
    overflow: 'hidden', marginBottom: '1.25rem',
}
const sectionHeaderStyle: React.CSSProperties = {
    padding: '1rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
}
const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0,
}

export default function VagaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const vaga = getVagaDetalhe(slug)

    if (!vaga) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Vaga não encontrada</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>A vaga solicitada não existe ou foi removida.</p>
                <Link href="/admin/vagas" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Vagas
                </Link>
            </div>
        )
    }

    const statusStyle = getStatusColor(vaga.status)

    return (
        <div>
            <AdminPageHeader
                titulo={vaga.titulo}
                subtitulo={`${vaga.empresa} · ${vaga.local}`}
                acao={
                    <Link href="/admin/vagas" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.6rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                        color: '#09355F', background: '#09355F0a', border: '1.5px solid #09355F14',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">

                {/* ── Conteúdo principal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Header card */}
                    <div style={sectionStyle}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: 'linear-gradient(135deg, #09355F14, #2AB9C014)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Briefcase style={{ width: 24, height: 24, color: '#2AB9C0' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.2rem' }}>{vaga.titulo}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#475569' }}>
                                            <Building2 style={{ width: 13, height: 13 }} /> {vaga.empresa}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#475569' }}>
                                            <MapPin style={{ width: 13, height: 13 }} /> {vaga.local}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0' }}>{vaga.modalidade}</span>
                                {vaga.nivel && <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#f3e8ff', color: '#7c3aed' }}>{vaga.nivel}</span>}
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>{vaga.status}</span>
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#09355F0a', color: '#09355F' }}>{vaga.regime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <FileText style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                            <h2 style={sectionTitleStyle}>Descrição da Vaga</h2>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {vaga.descricao.split('\n').map((p, i) => (
                                <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7, margin: i > 0 ? '0.75rem 0 0' : 0 }}>{p}</p>
                            ))}
                        </div>
                    </div>

                    {/* Responsabilidades */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <CheckCircle2 style={{ width: 18, height: 18, color: '#16a34a' }} />
                            <h2 style={sectionTitleStyle}>Responsabilidades</h2>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {vaga.responsabilidades.map((r, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                        <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a', flexShrink: 0, marginTop: 3 }} /> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Requisitos + Diferenciais */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="admin-cards-grid">
                        <div style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <Star style={{ width: 18, height: 18, color: '#FE8341' }} />
                                <h2 style={sectionTitleStyle}>Requisitos</h2>
                            </div>
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {vaga.requisitos.map((r, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: '#374151' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE8341', flexShrink: 0, marginTop: 7 }} /> {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <Star style={{ width: 18, height: 18, color: '#FBBF53' }} />
                                <h2 style={sectionTitleStyle}>Diferenciais</h2>
                            </div>
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {vaga.diferenciais.map((d, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: '#374151' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF53', flexShrink: 0, marginTop: 7 }} /> {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Candidatos */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Users style={{ width: 18, height: 18, color: '#09355F' }} />
                            <h2 style={sectionTitleStyle}>Candidatos ({vaga.candidaturas})</h2>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                <thead>
                                    <tr style={{ background: '#fafbfd' }}>
                                        {['Candidato', 'Cargo Atual', 'Data', 'Status', ''].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaga.candidatosRecentes.map((c, i) => {
                                        const st = getStatusCandidaturaColor(c.status)
                                        return (
                                            <tr key={c.id} style={{ borderBottom: i < vaga.candidatosRecentes.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                                <td style={{ padding: '0.875rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: 8,
                                                            background: 'linear-gradient(135deg, #2AB9C014, #09355F14)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.7rem', fontWeight: 800, color: '#09355F',
                                                        }}>
                                                            {c.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: '#09355F' }}>{c.nome}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.875rem 1.5rem', color: '#475569' }}>{c.cargo}</td>
                                                <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{c.data}</td>
                                                <td style={{ padding: '0.875rem 1.5rem' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                                                </td>
                                                <td style={{ padding: '0.875rem 1.5rem' }}>
                                                    <Link href={`/admin/candidatos/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none' }}>
                                                        <Eye style={{ width: 12, height: 12 }} /> Ver
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Resumo */}
                    <div style={sectionStyle}>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <InfoRow icon={DollarSign} label="Salário" value={vaga.salario || 'A combinar'} />
                            <InfoRow icon={Briefcase} label="Regime" value={vaga.regime} />
                            <InfoRow icon={Clock} label="Horário" value={vaga.horario} />
                            <InfoRow icon={MapPin} label="Modalidade" value={vaga.modalidade} />
                            <InfoRow icon={Calendar} label="Publicada em" value={vaga.dataPublicacao} />
                            <InfoRow icon={Users} label="Candidaturas" value={String(vaga.candidaturas)} />
                        </div>
                    </div>

                    {/* Benefícios */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Gift style={{ width: 16, height: 16, color: '#FBBF53' }} />
                            <h3 style={{ ...sectionTitleStyle, fontSize: '0.88rem' }}>Benefícios</h3>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {vaga.beneficios.map(b => (
                                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#374151' }}>
                                    <Gift style={{ width: 13, height: 13, color: '#FBBF53' }} /> {b}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sobre a empresa */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Building2 style={{ width: 16, height: 16, color: '#FE8341' }} />
                            <h3 style={{ ...sectionTitleStyle, fontSize: '0.88rem' }}>Sobre a Empresa</h3>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: 12, margin: '0 auto 0.75rem',
                                background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Building2 style={{ width: 22, height: 22, color: '#fff' }} />
                            </div>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', margin: '0 0 0.2rem' }}>{vaga.empresa}</h4>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem' }}>{vaga.local}</p>
                            <Link href={`/admin/empresas/1`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none',
                            }}>
                                <ExternalLink style={{ width: 12, height: 12 }} /> Ver empresa
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Icon style={{ width: 14, height: 14 }} /> {label}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09355F' }}>{value}</span>
        </div>
    )
}

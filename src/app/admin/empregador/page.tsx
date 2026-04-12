'use client'

import {
    Briefcase, Users, Eye, ArrowUpRight, Clock, Plus, BarChart3
} from 'lucide-react'
import Link from 'next/link'

import {
    EMPREGADOR_STATS, EMPREGADOR_ATIVIDADES, EMPREGADOR_VAGAS,
    GRAFICO_EMPREGADOR, getStatusColor, getTipoAtividadeIcon
} from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminStatCard from '@/components/admin/AdminStatCard'
import BannerSpace from '@/components/publicidade/BannerSpace'

const STAT_ICONS = [Briefcase, Users, Eye, BarChart3]
const STAT_COLORS = ['#2AB9C0', '#FBBF53', '#FE8341', '#09355F']

export default function EmpregadorDashboard() {
    const maxGrafico = Math.max(...GRAFICO_EMPREGADOR.map(d => d.valor))

    return (
        <div>
            <AdminPageHeader
                titulo="Bem-vindo de volta! 👋"
                subtitulo="Acompanhe o desempenho das suas vagas e candidaturas"
                acao={
                    <Link
                        href="/publicar-vaga"
                        className="btn-primary"
                        style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <Plus style={{ width: 16, height: 16 }} /> Nova Vaga
                    </Link>
                }
            />

            {/* ── Stats Cards ── */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {EMPREGADOR_STATS.map((stat, i) => (
                    <AdminStatCard key={stat.label} stat={stat} icon={STAT_ICONS[i]} color={STAT_COLORS[i]} />
                ))}
            </div>

            {/* Banner B1 - Embaixo dos Analytics */}
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
                <BannerSpace formato="leaderboard" />
            </div>

            {/* ── Grid: Gráfico + Atividades ── */}
            <div className="admin-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

                {/* Gráfico */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Candidaturas</h2>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Últimos 7 dias nas suas vagas</p>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FBBF53' }}>144</span>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 220 }}>
                        {GRAFICO_EMPREGADOR.map(({ dia, valor }) => (
                            <div key={dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#09355F' }}>{valor}</span>
                                <div style={{
                                    width: '100%', maxWidth: 45,
                                    height: `${(valor / maxGrafico) * 130}px`,
                                    borderRadius: '8px 8px 4px 4px',
                                    background: `linear-gradient(180deg, #FBBF53 0%, #FE8341 100%)`,
                                    transition: 'height 0.4s ease',
                                    minHeight: 8,
                                }} />
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{dia}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Candidaturas recentes */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Novas Candidaturas</h2>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {EMPREGADOR_ATIVIDADES.map((a, i) => {
                            const { emoji, color } = getTipoAtividadeIcon(a.tipo)
                            return (
                                <div key={a.id} style={{
                                    padding: '0.875rem 1.5rem',
                                    borderBottom: i < EMPREGADOR_ATIVIDADES.length - 1 ? '1px solid #f0f4f8' : 'none',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                }}>
                                    <span style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: `${color}14`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', flexShrink: 0,
                                    }}>
                                        {emoji}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.45, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {a.descricao}
                                        </p>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                                            <Clock style={{ width: 10, height: 10 }} /> {a.tempo}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Banner B2 - Abaixo de Candidaturas Recentes */}
                <BannerSpace formato="rectangle" />
                </div>
            </div>

            {/* ── Minhas Vagas ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Minhas Vagas</h2>
                    <Link
                        href="/publicar-vaga"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0',
                            textDecoration: 'none',
                        }}
                    >
                        <Plus style={{ width: 13, height: 13 }} /> Nova vaga
                    </Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Vaga', 'Modalidade', 'Candidaturas', 'Status', 'Ações'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {EMPREGADOR_VAGAS.map((v, i) => {
                                const statusStyle = getStatusColor(v.status)
                                return (
                                    <tr key={v.id} style={{ borderBottom: i < EMPREGADOR_VAGAS.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <span style={{ fontWeight: 700, color: '#09355F' }}>{v.titulo}</span>
                                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{v.local}</p>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 9999,
                                                fontSize: '0.7rem', fontWeight: 600,
                                                background: '#e3f2fd', color: '#1565c0',
                                            }}>
                                                {v.modalidade}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Users style={{ width: 14, height: 14, color: '#94a3b8' }} />
                                                <span style={{ fontWeight: 700, color: '#09355F' }}>{v.candidaturas}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 9999,
                                                fontSize: '0.7rem', fontWeight: 700,
                                                background: statusStyle.bg, color: statusStyle.color,
                                                textTransform: 'capitalize',
                                            }}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <button style={{
                                                background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                                padding: '0.35rem 0.75rem', cursor: 'pointer',
                                                fontSize: '0.75rem', fontWeight: 600, color: '#09355F',
                                                transition: 'border-color 0.18s',
                                            }}>
                                                Ver detalhes
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

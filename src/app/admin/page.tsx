'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import {
    Users, Briefcase, Building2, FileText, Eye,
    ArrowUpRight, Clock
} from 'lucide-react'

import {
    ADMIN_STATS, ADMIN_ATIVIDADES, ADMIN_VAGAS, ADMIN_USUARIOS,
    GRAFICO_CANDIDATURAS, getStatusColor, getTipoAtividadeIcon
} from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminStatCard from '@/components/admin/AdminStatCard'
import { verificarPermissao } from '@/actions/auth'

const STAT_ICONS = [Briefcase, Users, Building2, FileText]
const STAT_COLORS = ['#2AB9C0', '#FBBF53', '#FE8341', '#09355F']

export default function AdminDashboard() {
    // Client-side effect for redirect se não for admin
    const [verificado, setVerificado] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        verificarPermissao(['admin']).then(() => {
            setVerificado(true)
        }).catch(() => {})
    }, [])

    if (!verificado) return null

    const maxGrafico = Math.max(...GRAFICO_CANDIDATURAS.map(d => d.valor))

    return (
        <div>
            <AdminPageHeader titulo="Dashboard" subtitulo="Visão geral da plataforma — dados atualizados em tempo real" />

            {/* ── Stats Cards ── */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {ADMIN_STATS.map((stat, i) => (
                    <AdminStatCard key={stat.label} stat={stat} icon={STAT_ICONS[i]} color={STAT_COLORS[i]} />
                ))}
            </div>

            {/* ── Grid: Gráfico + Atividades ── */}
            <div className="admin-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

                {/* Gráfico de candidaturas */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Candidaturas</h2>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Últimos 7 dias</p>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2AB9C0' }}>1.006</span>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 220 }}>
                        {GRAFICO_CANDIDATURAS.map(({ dia, valor }) => (
                            <div key={dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#09355F' }}>{valor}</span>
                                <div style={{
                                    width: '100%', maxWidth: 45,
                                    height: `${(valor / maxGrafico) * 130}px`,
                                    borderRadius: '8px 8px 4px 4px',
                                    background: `linear-gradient(180deg, #2AB9C0 0%, #09355F 100%)`,
                                    transition: 'height 0.4s ease',
                                    minHeight: 8,
                                }} />
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{dia}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Atividades recentes */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Atividade Recente</h2>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {ADMIN_ATIVIDADES.map((a, i) => {
                            const { emoji, color } = getTipoAtividadeIcon(a.tipo)
                            return (
                                <div key={a.id} style={{
                                    padding: '0.875rem 1.5rem',
                                    borderBottom: i < ADMIN_ATIVIDADES.length - 1 ? '1px solid #f0f4f8' : 'none',
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
            </div>

            {/* ── Tabela: Últimas Vagas ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden', marginBottom: '1.75rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Últimas Vagas</h2>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0',
                        background: 'none', border: 'none', cursor: 'pointer',
                    }}>
                        Ver todas <ArrowUpRight style={{ width: 13, height: 13 }} />
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Vaga', 'Empresa', 'Local', 'Candidaturas', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ADMIN_VAGAS.map((v, i) => {
                                const statusStyle = getStatusColor(v.status)
                                return (
                                    <tr key={v.id} style={{ borderBottom: i < ADMIN_VAGAS.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <span style={{ fontWeight: 700, color: '#09355F' }}>{v.titulo}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem', color: '#475569' }}>{v.empresa}</td>
                                        <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{v.local}</td>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Eye style={{ width: 14, height: 14, color: '#94a3b8' }} />
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
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Últimos Usuários ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Últimos Cadastros</h2>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0',
                        background: 'none', border: 'none', cursor: 'pointer',
                    }}>
                        Ver todos <ArrowUpRight style={{ width: 13, height: 13 }} />
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Usuário', 'E-mail', 'Tipo', 'Data', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ADMIN_USUARIOS.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: i < ADMIN_USUARIOS.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: u.tipo === 'empresa' ? '#FE834114' : '#2AB9C014',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: u.tipo === 'empresa' ? '#FE8341' : '#2AB9C0',
                                                fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
                                            }}>
                                                {u.nome[0]}
                                            </div>
                                            <span style={{ fontWeight: 700, color: '#09355F' }}>{u.nome}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{u.email}</td>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 9999,
                                            fontSize: '0.7rem', fontWeight: 700,
                                            background: u.tipo === 'empresa' ? '#fff3e0' : '#e3f2fd',
                                            color: u.tipo === 'empresa' ? '#e65100' : '#1565c0',
                                            textTransform: 'capitalize',
                                        }}>
                                            {u.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{u.dataCadastro}</td>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                            fontSize: '0.72rem', fontWeight: 700,
                                            color: u.status === 'ativo' ? '#16a34a' : '#dc2626',
                                        }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.status === 'ativo' ? '#16a34a' : '#dc2626' }} />
                                            {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

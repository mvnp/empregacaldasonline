'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    Users, Briefcase, Building2, FileText,
    Eye, ArrowUpRight, ChevronLeft, ChevronRight, Cpu
} from 'lucide-react'
import { buscarDadosDashboard, type DashboardData } from '@/actions/dashboard'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminStatCard from '@/components/admin/AdminStatCard'
import { getStatusColor, getTipoAtividadeIcon, ADMIN_ATIVIDADES } from '@/data/admin'

// ── Helpers ──────────────────────────────────────────
function formatData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatNum(n: number) {
    return n.toLocaleString('pt-BR')
}

const TIPO_COLORS: Record<string, string> = {
    admin: '#7c3aed',
    empregador: '#e65100',
    candidato: '#1565c0',
}
const TIPO_BG: Record<string, string> = {
    admin: '#f3e8ff',
    empregador: '#fff3e0',
    candidato: '#e3f2fd',
}

// ── Props ─────────────────────────────────────────────
interface Props {
    initialData: DashboardData
}

const STAT_ICONS = [Briefcase, Users, Building2, FileText]
const STAT_COLORS = ['#2AB9C0', '#FBBF53', '#FE8341', '#09355F']

export default function AdminDashboardClient({ initialData }: Props) {
    const [data, setData] = useState<DashboardData>(initialData)
    const [vagaPage, setVagaPage] = useState(1)
    const [userPage, setUserPage] = useState(1)
    const [loadingVagas, setLoadingVagas] = useState(false)
    const [loadingUsers, setLoadingUsers] = useState(false)

    const PER_PAGE = 10
    const vagasTotalPages = Math.max(1, Math.ceil(data.vagasTotal / PER_PAGE))
    const usersTotalPages = Math.max(1, Math.ceil(data.usuariosTotal / PER_PAGE))

    async function mudarPaginaVagas(page: number) {
        setLoadingVagas(true)
        const res = await buscarDadosDashboard(page, userPage)
        if (res) { setData(res); setVagaPage(page) }
        setLoadingVagas(false)
    }

    async function mudarPaginaUsarios(page: number) {
        setLoadingUsers(true)
        const res = await buscarDadosDashboard(vagaPage, page)
        if (res) { setData(res); setUserPage(page) }
        setLoadingUsers(false)
    }

    const maxGrafico = Math.max(...data.grafico.map(d => d.valor), 1)

    const stats = [
        { label: 'Total de Vagas', valor: formatNum(data.stats.totalVagas), variacao: '', positivo: true },
        { label: 'Candidatos', valor: formatNum(data.stats.totalCandidatos), variacao: '', positivo: true },
        { label: 'Empresas', valor: formatNum(data.stats.totalEmpresas), variacao: '', positivo: true },
        { label: 'Candidaturas Hoje', valor: formatNum(data.stats.candidaturasHoje), variacao: '', positivo: true },
    ]

    return (
        <div>
            <AdminPageHeader titulo="Dashboard" subtitulo="Visão geral da plataforma — dados atualizados em tempo real" />

            {/* ── Stats Cards ── */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {stats.map((stat, i) => (
                    <AdminStatCard key={stat.label} stat={stat} icon={STAT_ICONS[i]} color={STAT_COLORS[i]} />
                ))}
            </div>

            {/* ── OpenAI Consumo ── */}
            {data.openaiStats && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', padding: '1.5rem', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Cpu style={{ width: 18, height: 18, color: '#10b981' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Consumo da Inteligência Artificial (OpenAI)</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10 }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: 600 }}>Input Tokens</p>
                            <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{formatNum(data.openaiStats.totalInput)}</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10 }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: 600 }}>Output Tokens</p>
                            <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{formatNum(data.openaiStats.totalOutput)}</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10 }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: 600 }}>Tokens Totais Processados</p>
                            <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{formatNum(data.openaiStats.totalTokens)}</p>
                        </div>
                        <div style={{ background: '#e0fae9', padding: '1rem', borderRadius: 10 }}>
                            <p style={{ fontSize: '0.75rem', color: '#059669', margin: '0 0 0.25rem 0', fontWeight: 600 }}>Custo Estimado (USD)</p>
                            <p style={{ fontSize: '1.1rem', color: '#047857', fontWeight: 800, margin: 0 }}>${data.openaiStats.totalCostUsd.toFixed(4)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Grid: Gráfico + Atividades ── */}
            <div className="admin-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

                {/* Gráfico de candidaturas */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Candidaturas</h2>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Últimos 7 dias</p>
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2AB9C0' }}>{formatNum(data.totalGrafico)}</span>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 220 }}>
                        {data.grafico.map(({ dia, valor }) => (
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

                {/* Atividades recentes (ainda mock — substituir depois se necessário) */}
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
                                            {a.tempo}
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
                    <div>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Últimas Vagas</h2>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{formatNum(data.vagasTotal)} vagas cadastradas</p>
                    </div>
                    <Link href="/admin/vagas" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none' }}>
                        Ver todas <ArrowUpRight style={{ width: 13, height: 13 }} />
                    </Link>
                </div>
                <div style={{ overflowX: 'auto', opacity: loadingVagas ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Vaga', 'Local', 'Candidaturas', 'Status', 'Data'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.vagas.map((v, i) => {
                                const statusStyle = getStatusColor(v.status)
                                return (
                                    <tr key={v.id} style={{ borderBottom: i < data.vagas.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <Link href={`/admin/vagas/${v.id}`} style={{ fontWeight: 700, color: '#09355F', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}>{v.titulo}</Link>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>{v.empresa}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{v.local || '—'}</td>
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
                                        <td style={{ padding: '0.875rem 1.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>{formatData(v.created_at)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Paginação Vagas */}
                {vagasTotalPages > 1 && (
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Página {vagaPage} de {vagasTotalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => mudarPaginaVagas(vagaPage - 1)} disabled={vagaPage === 1 || loadingVagas} style={paginaBtnStyle(vagaPage === 1 || loadingVagas)}>
                                <ChevronLeft style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => mudarPaginaVagas(vagaPage + 1)} disabled={vagaPage === vagasTotalPages || loadingVagas} style={paginaBtnStyle(vagaPage === vagasTotalPages || loadingVagas)}>
                                <ChevronRight style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Últimos Usuários ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Últimos Cadastros</h2>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{formatNum(data.usuariosTotal)} usuários cadastrados</p>
                    </div>
                    <Link href="/admin/usuarios" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none' }}>
                        Ver todos <ArrowUpRight style={{ width: 13, height: 13 }} />
                    </Link>
                </div>
                <div style={{ overflowX: 'auto', opacity: loadingUsers ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Usuário', 'E-mail', 'Tipo', 'Data cadastro'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.usuarios.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: i < data.usuarios.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: TIPO_BG[u.tipo] ?? '#e8ecf5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: TIPO_COLORS[u.tipo] ?? '#09355F',
                                                fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
                                            }}>
                                                {(u.nome || '?')[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 700, color: '#09355F' }}>{u.nome} {u.sobrenome || ''}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{u.email.replace('@empregacaldas.online', '@eco.com.br')}</td>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 9999,
                                            fontSize: '0.7rem', fontWeight: 700,
                                            background: TIPO_BG[u.tipo] ?? '#e8ecf5',
                                            color: TIPO_COLORS[u.tipo] ?? '#09355F',
                                            textTransform: 'capitalize',
                                        }}>
                                            {u.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>{formatData(u.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Paginação Usuários */}
                {usersTotalPages > 1 && (
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Página {userPage} de {usersTotalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => mudarPaginaUsarios(userPage - 1)} disabled={userPage === 1 || loadingUsers} style={paginaBtnStyle(userPage === 1 || loadingUsers)}>
                                <ChevronLeft style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => mudarPaginaUsarios(userPage + 1)} disabled={userPage === usersTotalPages || loadingUsers} style={paginaBtnStyle(userPage === usersTotalPages || loadingUsers)}>
                                <ChevronRight style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function paginaBtnStyle(disabled: boolean): React.CSSProperties {
    return {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8,
        border: '1.5px solid #e2e8f0',
        background: disabled ? '#f8fafc' : '#fff',
        color: disabled ? '#cbd5e1' : '#475569',
        cursor: disabled ? 'not-allowed' : 'pointer',
    }
}

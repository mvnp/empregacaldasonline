'use client'

import { useState } from 'react'
import {
    Briefcase, Users, FileText, TrendingUp, TrendingDown,
    Download, Calendar, Building2, Award, BarChart3, Target
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import {
    RELATORIO_KPIS, RELATORIO_VAGAS_MES, RELATORIO_STATUS_CANDIDATURAS,
    RELATORIO_TOP_VAGAS, RELATORIO_CANDIDATOS_CIDADE, RELATORIO_EMPRESAS_PLANO,
    RELATORIO_TOP_EMPRESAS, RELATORIO_AREAS_BUSCADAS
} from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const PERIODOS = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Último Mês' },
    { value: '90d', label: 'Trimestre' },
    { value: '365d', label: 'Último Ano' },
]

function getKpiIcon(icon: string) {
    switch (icon) {
        case 'briefcase': return Briefcase
        case 'users': return Users
        case 'filetext': return FileText
        case 'trendingup': return TrendingUp
        default: return BarChart3
    }
}

const sectionStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5',
    overflow: 'hidden',
}
const sectionHeaderStyle: React.CSSProperties = {
    padding: '1rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
}

const tooltipStyle: React.CSSProperties = {
    background: '#09355F', border: 'none', borderRadius: 10,
    padding: '0.6rem 1rem', fontSize: '0.78rem', color: '#fff',
    boxShadow: '0 8px 24px rgba(9,53,95,0.25)',
}

export default function RelatoriosPage() {
    const [periodo, setPeriodo] = useState('30d')

    const totalCandidaturas = RELATORIO_STATUS_CANDIDATURAS.reduce((a, b) => a + b.valor, 0)

    return (
        <div>
            <AdminPageHeader
                titulo="Relatórios"
                subtitulo="Análise estratégica do portal"
                acao={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.1rem', background: '#f0f2f5', borderRadius: 10,
                        }}>
                            {PERIODOS.map(p => (
                                <button key={p.value} onClick={() => setPeriodo(p.value)} style={{
                                    padding: '0.5rem 0.85rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: periodo === p.value ? '#fff' : 'transparent',
                                    color: periodo === p.value ? '#09355F' : '#94a3b8',
                                    boxShadow: periodo === p.value ? '0 2px 8px rgba(9,53,95,0.1)' : 'none',
                                }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.55rem 1rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600,
                            background: 'linear-gradient(135deg, #09355F, #0a4a80)', color: '#fff',
                            border: 'none', cursor: 'pointer',
                        }}>
                            <Download style={{ width: 14, height: 14 }} /> Exportar
                        </button>
                    </div>
                }
            />

            {/* ── KPIs ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }} className="admin-stats-grid">
                {RELATORIO_KPIS.map(kpi => {
                    const Icon = getKpiIcon(kpi.icon)
                    const variacao = ((kpi.valor - kpi.anterior) / kpi.anterior * 100).toFixed(1)
                    const positivo = kpi.valor > kpi.anterior
                    return (
                        <div key={kpi.label} style={{
                            ...sectionStyle,
                            padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: positivo ? 'linear-gradient(135deg, #2AB9C014, #09355F0a)' : '#ffebee',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Icon style={{ width: 22, height: 22, color: positivo ? '#2AB9C0' : '#c62828' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>
                                        {kpi.sufixo ? `${kpi.valor}${kpi.sufixo}` : kpi.valor.toLocaleString('pt-BR')}
                                    </span>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
                                        fontSize: '0.7rem', fontWeight: 700,
                                        color: positivo ? '#16a34a' : '#dc2626',
                                    }}>
                                        {positivo ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}
                                        {positivo ? '+' : ''}{variacao}%
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.68rem', color: '#b0b8c4', margin: '0.15rem 0 0' }}>
                                    Anterior: {kpi.sufixo ? `${kpi.anterior}${kpi.sufixo}` : kpi.anterior.toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Gráficos linha 1: Área + Donut ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', marginBottom: '1.25rem' }} className="admin-main-grid">
                {/* Vagas e Candidaturas ao longo do tempo */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <TrendingUp style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Evolução Mensal</h2>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem 1rem' }}>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={RELATORIO_VAGAS_MES}>
                                <defs>
                                    <linearGradient id="gradCand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2AB9C0" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2AB9C0" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradVagas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FE8341" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FE8341" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
                                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="candidaturas" name="Candidaturas" stroke="#2AB9C0" strokeWidth={2.5} fill="url(#gradCand)" dot={{ r: 4, fill: '#2AB9C0', strokeWidth: 2, stroke: '#fff' }} />
                                <Area type="monotone" dataKey="vagas" name="Vagas" stroke="#FE8341" strokeWidth={2.5} fill="url(#gradVagas)" dot={{ r: 4, fill: '#FE8341', strokeWidth: 2, stroke: '#fff' }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: 12 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribuição de candidaturas por status */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Target style={{ width: 18, height: 18, color: '#FE8341' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Candidaturas por Status</h2>
                    </div>
                    <div style={{ padding: '0.75rem 1.5rem 0' }}>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={RELATORIO_STATUS_CANDIDATURAS}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="valor"
                                    nameKey="status"
                                    strokeWidth={0}
                                >
                                    {RELATORIO_STATUS_CANDIDATURAS.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingBottom: '1rem' }}>
                            {RELATORIO_STATUS_CANDIDATURAS.map(s => (
                                <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                        {s.status}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#09355F' }}>{s.valor}</span>
                                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({(s.valor / totalCandidaturas * 100).toFixed(0)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Gráficos linha 2: Barras + Barras horizontal ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="admin-cards-grid">
                {/* Candidatos por cidade */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Users style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Candidatos por Cidade</h2>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem 1rem' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={RELATORIO_CANDIDATOS_CIDADE}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
                                <XAxis dataKey="cidade" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={35} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="total" name="Candidatos" fill="#2AB9C0" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Empresas por plano */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Building2 style={{ width: 18, height: 18, color: '#FBBF53' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Empresas por Plano</h2>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <ResponsiveContainer width="45%" height={200}>
                            <PieChart>
                                <Pie
                                    data={RELATORIO_EMPRESAS_PLANO}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={70}
                                    paddingAngle={4}
                                    dataKey="valor"
                                    nameKey="plano"
                                    strokeWidth={0}
                                >
                                    {RELATORIO_EMPRESAS_PLANO.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                            {RELATORIO_EMPRESAS_PLANO.map(p => (
                                <div key={p.plano}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#09355F' }}>
                                            <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                                            {p.plano}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: p.color }}>{p.valor}</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f0f4f8', borderRadius: 9999 }}>
                                        <div style={{ height: '100%', width: `${(p.valor / 40) * 100}%`, background: p.color, borderRadius: 9999, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabela linha 3: Top vagas + Top empresas + Áreas ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="admin-cards-grid">
                {/* Top vagas concorridas */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Briefcase style={{ width: 18, height: 18, color: '#FE8341' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Top 5 Vagas Mais Concorridas</h2>
                    </div>
                    <div style={{ padding: '0.5rem 0' }}>
                        {RELATORIO_TOP_VAGAS.map((v, i) => (
                            <div key={v.titulo} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1.5rem',
                                borderBottom: i < RELATORIO_TOP_VAGAS.length - 1 ? '1px solid #f0f4f8' : 'none',
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: i === 0 ? 'linear-gradient(135deg, #FBBF53, #FE8341)' : i === 1 ? '#e8edf5' : '#f5f7fa',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.72rem', fontWeight: 900, color: i === 0 ? '#fff' : '#64748b',
                                    flexShrink: 0,
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.titulo}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{v.empresa}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Users style={{ width: 12, height: 12, color: '#94a3b8' }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FE8341' }}>{v.candidaturas}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top empresas */}
                <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                        <Award style={{ width: 18, height: 18, color: '#FBBF53' }} />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Empresas Que Mais Contratam</h2>
                    </div>
                    <div style={{ padding: '0.5rem 0' }}>
                        {RELATORIO_TOP_EMPRESAS.map((e, i) => {
                            const planoColor = e.plano === 'enterprise' ? '#FE8341' : e.plano === 'profissional' ? '#2AB9C0' : '#94a3b8'
                            return (
                                <div key={e.nome} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    borderBottom: i < RELATORIO_TOP_EMPRESAS.length - 1 ? '1px solid #f0f4f8' : 'none',
                                }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: i === 0 ? 'linear-gradient(135deg, #FBBF53, #FE8341)' : i === 1 ? '#e8edf5' : '#f5f7fa',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: 900, color: i === 0 ? '#fff' : '#64748b',
                                        flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F', margin: 0 }}>{e.nome}</p>
                                        <p style={{ fontSize: '0.68rem', color: planoColor, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{e.plano}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2AB9C0', margin: 0 }}>{e.contratacoes}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0 }}>contratações</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Áreas mais buscadas ── */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <BarChart3 style={{ width: 18, height: 18, color: '#09355F' }} />
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Áreas Mais Buscadas</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="admin-cards-grid">
                        {RELATORIO_AREAS_BUSCADAS.map((a, i) => {
                            const colors = ['#2AB9C0', '#FE8341', '#FBBF53', '#7c3aed', '#09355F', '#1565c0']
                            return (
                                <div key={a.area} style={{
                                    padding: '1rem', borderRadius: 12, background: '#f8fafc',
                                    border: '1px solid #e8edf5',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F' }}>{a.area}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: colors[i] }}>{a.porcentagem}%</span>
                                    </div>
                                    <div style={{ height: 8, background: '#e8edf5', borderRadius: 9999 }}>
                                        <div style={{
                                            height: '100%', width: `${a.porcentagem}%`,
                                            background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}aa)`,
                                            borderRadius: 9999, transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

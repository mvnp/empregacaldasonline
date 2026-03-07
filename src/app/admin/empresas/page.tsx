'use client'

import { useState, useMemo } from 'react'
import {
    Search, MapPin, Building2, Users, Briefcase, ChevronDown,
    Loader2, Filter, Award, Globe
} from 'lucide-react'
import { TODAS_EMPRESAS } from '@/data/admin'

const POR_PAGINA = 18

function getPlanoStyle(plano: string) {
    switch (plano) {
        case 'enterprise': return { bg: 'linear-gradient(135deg, #FBBF53, #FE8341)', color: '#fff', label: 'Enterprise' }
        case 'profissional': return { bg: 'linear-gradient(135deg, #2AB9C0, #09355F)', color: '#fff', label: 'Profissional' }
        default: return { bg: '#f0f4f8', color: '#64748b', label: 'Gratuito' }
    }
}

export default function AdminEmpresasPage() {
    const [busca, setBusca] = useState('')
    const [filtroSetor, setFiltroSetor] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [filtroPlano, setFiltroPlano] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)

    const empresasFiltradas = useMemo(() => {
        return TODAS_EMPRESAS.filter(e => {
            if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroSetor && e.setor !== filtroSetor) return false
            if (filtroCidade && e.local !== filtroCidade) return false
            if (filtroPlano && e.plano !== filtroPlano) return false
            return true
        })
    }, [busca, filtroSetor, filtroCidade, filtroPlano])

    const visiveis = empresasFiltradas.slice(0, exibidos)
    const temMais = exibidos < empresasFiltradas.length

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const setores = [...new Set(TODAS_EMPRESAS.map(e => e.setor))]
    const cidades = [...new Set(TODAS_EMPRESAS.map(e => e.local))]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.25rem' }}>Empresas</h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{empresasFiltradas.length} empresas cadastradas</p>
            </div>

            {/* ── Filtros ── */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
                border: '1.5px solid #e8edf5', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Buscar empresa..." value={busca} onChange={e => setBusca(e.target.value)} className="input-filter" style={{ paddingLeft: '2.3rem', height: 40 }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 170px' }}>
                    <Globe style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select value={filtroSetor} onChange={e => { setFiltroSetor(e.target.value); setExibidos(POR_PAGINA) }} className="input-filter" style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Setor</option>
                        {setores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 180px' }}>
                    <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select value={filtroCidade} onChange={e => { setFiltroCidade(e.target.value); setExibidos(POR_PAGINA) }} className="input-filter" style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Cidade</option>
                        {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 160px' }}>
                    <Award style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select value={filtroPlano} onChange={e => { setFiltroPlano(e.target.value); setExibidos(POR_PAGINA) }} className="input-filter" style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Plano</option>
                        <option value="gratuito">Gratuito</option>
                        <option value="profissional">Profissional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <button onClick={() => setExibidos(POR_PAGINA)} className="btn-primary" style={{ height: 40, padding: '0 1.25rem', borderRadius: 10, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <Search style={{ width: 14, height: 14 }} /> Buscar
                </button>
            </div>

            {/* ── Grid de cards ── */}
            <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {visiveis.map(e => {
                    const planoStyle = getPlanoStyle(e.plano)
                    return (
                        <div key={e.id} style={{
                            background: '#fff', borderRadius: 14, padding: '1.25rem',
                            border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                            transition: 'border-color 0.18s, box-shadow 0.18s', cursor: 'pointer',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            {/* Plano badge */}
                            <div style={{ position: 'absolute', top: 14, right: 14 }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 9999,
                                    fontSize: '0.68rem', fontWeight: 700,
                                    background: planoStyle.bg, color: planoStyle.color,
                                }}>
                                    {planoStyle.label}
                                </span>
                            </div>

                            {/* Avatar + Nome */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                <div style={{
                                    width: 46, height: 46, borderRadius: 12,
                                    background: e.plano === 'enterprise' ? 'linear-gradient(135deg, #FBBF53, #FE8341)' : e.plano === 'profissional' ? 'linear-gradient(135deg, #09355F, #2AB9C0)' : '#e8edf5',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Building2 style={{ width: 22, height: 22, color: e.plano === 'gratuito' ? '#64748b' : '#fff' }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nome}</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#FE8341', fontWeight: 600 }}>{e.setor}</p>
                                </div>
                            </div>

                            {/* Detalhes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} /> {e.local}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <Users style={{ width: 12, height: 12, flexShrink: 0 }} /> {e.totalFuncionarios} funcionários
                                </span>
                            </div>

                            {/* Stats mini */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{e.vagasAtivas}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>Vagas ativas</p>
                                </div>
                                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{e.status === 'ativo' ? '✓' : '✗'}</p>
                                    <p style={{ fontSize: '0.65rem', color: e.status === 'ativo' ? '#16a34a' : '#dc2626', marginTop: 2 }}>{e.status === 'ativo' ? 'Ativa' : 'Inativa'}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <Briefcase style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Desde {e.dataCadastro}
                                </span>
                                <button style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.7rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#FE8341',
                                }}>
                                    Ver detalhes
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Carregar mais */}
            {temMais && (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                    <button onClick={handleCarregarMais} disabled={carregando} className="btn-primary" style={{ padding: '0.7rem 2rem', borderRadius: 10, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: carregando ? 0.7 : 1 }}>
                        {carregando ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Carregando...</> : `Carregar mais (${empresasFiltradas.length - exibidos} restantes)`}
                    </button>
                </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem' }}>
                Exibindo {visiveis.length} de {empresasFiltradas.length} empresas
            </p>
        </div>
    )
}

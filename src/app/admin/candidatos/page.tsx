'use client'

import { useState, useMemo } from 'react'
import {
    Search, MapPin, Briefcase, Mail, Clock, ChevronDown,
    Loader2, Filter, User
} from 'lucide-react'
import { TODOS_CANDIDATOS } from '@/data/admin'

const POR_PAGINA = 18

export default function AdminCandidatosPage() {
    const [busca, setBusca] = useState('')
    const [filtroCargo, setFiltroCargo] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)

    const candidatosFiltrados = useMemo(() => {
        return TODOS_CANDIDATOS.filter(c => {
            if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !c.cargo.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroCargo && c.cargo !== filtroCargo) return false
            if (filtroCidade && c.local !== filtroCidade) return false
            if (filtroStatus && c.status !== filtroStatus) return false
            return true
        })
    }, [busca, filtroCargo, filtroCidade, filtroStatus])

    const visiveis = candidatosFiltrados.slice(0, exibidos)
    const temMais = exibidos < candidatosFiltrados.length

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const cargos = [...new Set(TODOS_CANDIDATOS.map(c => c.cargo))]
    const cidades = [...new Set(TODOS_CANDIDATOS.map(c => c.local))]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.25rem' }}>Candidatos</h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{candidatosFiltrados.length} candidatos encontrados</p>
            </div>

            {/* ── Filtros ── */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
                border: '1.5px solid #e8edf5', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Buscar candidato..." value={busca} onChange={e => setBusca(e.target.value)} className="input-filter" style={{ paddingLeft: '2.3rem', height: 40 }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 180px' }}>
                    <Briefcase style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select value={filtroCargo} onChange={e => { setFiltroCargo(e.target.value); setExibidos(POR_PAGINA) }} className="input-filter" style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Cargo</option>
                        {cargos.map(c => <option key={c} value={c}>{c}</option>)}
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

                <div style={{ position: 'relative', flex: '0 1 140px' }}>
                    <Filter style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setExibidos(POR_PAGINA) }} className="input-filter" style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Status</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <button onClick={() => setExibidos(POR_PAGINA)} className="btn-primary" style={{ height: 40, padding: '0 1.25rem', borderRadius: 10, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <Search style={{ width: 14, height: 14 }} /> Buscar
                </button>
            </div>

            {/* ── Grid de cards ── */}
            <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {visiveis.map(c => (
                    <div key={c.id} style={{
                        background: '#fff', borderRadius: 14, padding: '1.25rem',
                        border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                        transition: 'border-color 0.18s, box-shadow 0.18s', cursor: 'pointer',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Status indicator */}
                        <div style={{ position: 'absolute', top: 14, right: 14 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                fontSize: '0.68rem', fontWeight: 700,
                                color: c.status === 'ativo' ? '#16a34a' : '#dc2626',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.status === 'ativo' ? '#16a34a' : '#dc2626' }} />
                                {c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>

                        {/* Avatar + Nome */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 12,
                                background: 'linear-gradient(135deg, #2AB9C0, #09355F)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                            }}>
                                {c.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</h3>
                                <p style={{ fontSize: '0.78rem', color: '#2AB9C0', fontWeight: 600 }}>{c.cargo}</p>
                            </div>
                        </div>

                        {/* Detalhes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                <Mail style={{ width: 12, height: 12, flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} /> {c.local}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                <Clock style={{ width: 12, height: 12, flexShrink: 0 }} /> {c.experiencia} de experiência
                            </span>
                        </div>

                        {/* Habilidades */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
                            {c.habilidades.map(h => (
                                <span key={h} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 600, background: '#09355F0a', color: '#09355F', border: '1px solid #09355F14' }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {/* Footer card */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                <User style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> {c.candidaturas} candidaturas
                            </span>
                            <button style={{
                                background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                padding: '0.3rem 0.7rem', cursor: 'pointer',
                                fontSize: '0.72rem', fontWeight: 600, color: '#2AB9C0',
                            }}>
                                Ver perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Carregar mais */}
            {temMais && (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                    <button onClick={handleCarregarMais} disabled={carregando} className="btn-primary" style={{ padding: '0.7rem 2rem', borderRadius: 10, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: carregando ? 0.7 : 1 }}>
                        {carregando ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Carregando...</> : `Carregar mais (${candidatosFiltrados.length - exibidos} restantes)`}
                    </button>
                </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem' }}>
                Exibindo {visiveis.length} de {candidatosFiltrados.length} candidatos
            </p>
        </div>
    )
}

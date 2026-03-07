'use client'

import { useState, useMemo } from 'react'
import {
    Search, MapPin, Building2, Briefcase, Eye, Calendar,
    Users, Filter, ChevronDown, Loader2
} from 'lucide-react'
import { TODAS_VAGAS, getStatusColor } from '@/data/admin'

const POR_PAGINA = 18

export default function AdminVagasPage() {
    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [filtroModalidade, setFiltroModalidade] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)

    // Filtros aplicados
    const vagasFiltradas = useMemo(() => {
        return TODAS_VAGAS.filter(v => {
            if (busca && !v.titulo.toLowerCase().includes(busca.toLowerCase()) && !v.empresa.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroStatus && v.status !== filtroStatus) return false
            if (filtroModalidade && v.modalidade !== filtroModalidade) return false
            if (filtroCidade && v.local !== filtroCidade) return false
            return true
        })
    }, [busca, filtroStatus, filtroModalidade, filtroCidade])

    const vagasVisiveis = vagasFiltradas.slice(0, exibidos)
    const temMais = exibidos < vagasFiltradas.length

    function handleBuscar() {
        setExibidos(POR_PAGINA)
    }

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const cidades = [...new Set(TODAS_VAGAS.map(v => v.local))]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.25rem' }}>Vagas</h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {vagasFiltradas.length} vagas encontradas
                </p>
            </div>

            {/* ── Filtros ── */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
                border: '1.5px solid #e8edf5', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Buscar vaga ou empresa..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="input-filter"
                        style={{ paddingLeft: '2.3rem', height: 40 }}
                    />
                </div>

                <div style={{ position: 'relative', flex: '0 1 155px' }}>
                    <Filter style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select
                        value={filtroStatus}
                        onChange={e => { setFiltroStatus(e.target.value); setExibidos(POR_PAGINA) }}
                        className="input-filter"
                        style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">Status</option>
                        <option value="ativa">Ativa</option>
                        <option value="pausada">Pausada</option>
                        <option value="expirada">Expirada</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 155px' }}>
                    <Briefcase style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select
                        value={filtroModalidade}
                        onChange={e => { setFiltroModalidade(e.target.value); setExibidos(POR_PAGINA) }}
                        className="input-filter"
                        style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">Modalidade</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Presencial">Presencial</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', flex: '0 1 180px' }}>
                    <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                    <select
                        value={filtroCidade}
                        onChange={e => { setFiltroCidade(e.target.value); setExibidos(POR_PAGINA) }}
                        className="input-filter"
                        style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">Cidade</option>
                        {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                </div>

                <button onClick={handleBuscar} className="btn-primary" style={{ height: 40, padding: '0 1.25rem', borderRadius: 10, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <Search style={{ width: 14, height: 14 }} /> Buscar
                </button>
            </div>

            {/* ── Lista de vagas ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vagasVisiveis.map(v => {
                    const statusStyle = getStatusColor(v.status)
                    return (
                        <div key={v.id} style={{
                            background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
                            border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                            transition: 'border-color 0.18s', cursor: 'pointer',
                        }}>
                            {/* Ícone */}
                            <div style={{
                                width: 44, height: 44, borderRadius: 11,
                                background: 'linear-gradient(135deg, #09355F14, #2AB9C014)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Briefcase style={{ width: 20, height: 20, color: '#2AB9C0' }} />
                            </div>

                            {/* Info principal */}
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', marginBottom: '0.2rem' }}>{v.titulo}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                        <Building2 style={{ width: 12, height: 12 }} /> {v.empresa}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                        <MapPin style={{ width: 12, height: 12 }} /> {v.local}
                                    </span>
                                </div>
                            </div>

                            {/* Badges */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0' }}>
                                    {v.modalidade}
                                </span>
                                {v.nivel && (
                                    <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#f3e8ff', color: '#7c3aed' }}>
                                        {v.nivel}
                                    </span>
                                )}
                                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>
                                    {v.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <Users style={{ width: 13, height: 13 }} /> <strong style={{ color: '#09355F' }}>{v.candidaturas}</strong>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    <Calendar style={{ width: 12, height: 12 }} /> {v.dataPublicacao}
                                </span>
                                <button style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.65rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#2AB9C0',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                }}>
                                    <Eye style={{ width: 12, height: 12 }} /> Ver
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Botão carregar mais */}
            {temMais && (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                    <button
                        onClick={handleCarregarMais}
                        disabled={carregando}
                        className="btn-primary"
                        style={{ padding: '0.7rem 2rem', borderRadius: 10, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: carregando ? 0.7 : 1 }}
                    >
                        {carregando ? (
                            <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Carregando...</>
                        ) : (
                            `Carregar mais (${vagasFiltradas.length - exibidos} restantes)`
                        )}
                    </button>
                </div>
            )}

            {/* Info de exibição */}
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem' }}>
                Exibindo {vagasVisiveis.length} de {vagasFiltradas.length} vagas
            </p>
        </div>
    )
}

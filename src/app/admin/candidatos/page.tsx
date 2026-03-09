'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    MapPin, Briefcase, Mail, Clock, Filter, User, Plus
} from 'lucide-react'
import { TODOS_CANDIDATOS } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'

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

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const cargosOpcoes = [...new Set(TODOS_CANDIDATOS.map(c => c.cargo))].map(c => ({ value: c, label: c }))
    const cidadesOpcoes = [...new Set(TODOS_CANDIDATOS.map(c => c.local))].map(c => ({ value: c, label: c }))

    return (
        <div>
            <AdminPageHeader
                titulo="Candidatos"
                subtitulo={`${candidatosFiltrados.length} candidatos encontrados`}
                acao={
                    <Link href="/admin/candidatos/cadastrar" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.6rem 1.25rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                        color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                        transition: 'all 0.18s',
                    }}>
                        <Plus style={{ width: 16, height: 16 }} /> Cadastrar Candidato
                    </Link>
                }
            />

            <AdminFilterBar onBuscar={() => setExibidos(POR_PAGINA)}>
                <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar candidato..." />
                <FilterSelect icon={Briefcase} value={filtroCargo} onChange={v => { setFiltroCargo(v); setExibidos(POR_PAGINA) }} placeholder="Cargo" flex="0 1 180px" opcoes={cargosOpcoes} />
                <FilterSelect icon={MapPin} value={filtroCidade} onChange={v => { setFiltroCidade(v); setExibidos(POR_PAGINA) }} placeholder="Cidade" flex="0 1 180px" opcoes={cidadesOpcoes} />
                <FilterSelect icon={Filter} value={filtroStatus} onChange={v => { setFiltroStatus(v); setExibidos(POR_PAGINA) }} placeholder="Status" flex="0 1 140px" opcoes={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]} />
            </AdminFilterBar>

            {/* ── Grid de cards ── */}
            <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {visiveis.map(c => (
                    <div key={c.id} style={{
                        background: '#fff', borderRadius: 14, padding: '1.25rem',
                        border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                        transition: 'border-color 0.18s, box-shadow 0.18s', cursor: 'pointer',
                        position: 'relative', overflow: 'hidden',
                    }}>
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

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
                            {c.habilidades.map(h => (
                                <span key={h} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 600, background: '#09355F0a', color: '#09355F', border: '1px solid #09355F14' }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                <User style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> {c.candidaturas} candidaturas
                            </span>
                            <Link href={`/admin/candidatos/${c.id}`} style={{
                                background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                padding: '0.3rem 0.7rem', cursor: 'pointer',
                                fontSize: '0.72rem', fontWeight: 600, color: '#2AB9C0',
                                textDecoration: 'none',
                            }}>
                                Ver perfil
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <LoadMoreButton
                totalFiltrado={candidatosFiltrados.length}
                exibidos={exibidos}
                carregando={carregando}
                onCarregarMais={handleCarregarMais}
                entidade="candidatos"
            />
        </div>
    )
}

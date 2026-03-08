'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Eye, Calendar,
    Users, Filter, Plus
} from 'lucide-react'
import { TODAS_VAGAS, getStatusColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'

const POR_PAGINA = 18

export default function AdminVagasPage() {
    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [filtroModalidade, setFiltroModalidade] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)

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

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const cidadesOpcoes = [...new Set(TODAS_VAGAS.map(v => v.local))].map(c => ({ value: c, label: c }))

    return (
        <div>
            <AdminPageHeader
                titulo="Vagas"
                subtitulo={`${vagasFiltradas.length} vagas encontradas`}
                acao={
                    <Link href="/admin/vagas/cadastrar" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.6rem 1.25rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                        color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                        transition: 'all 0.18s',
                    }}>
                        <Plus style={{ width: 16, height: 16 }} /> Cadastrar Vaga
                    </Link>
                }
            />

            <AdminFilterBar onBuscar={() => setExibidos(POR_PAGINA)}>
                <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar vaga ou empresa..." />
                <FilterSelect
                    icon={Filter} value={filtroStatus}
                    onChange={v => { setFiltroStatus(v); setExibidos(POR_PAGINA) }}
                    placeholder="Status"
                    opcoes={[{ value: 'ativa', label: 'Ativa' }, { value: 'pausada', label: 'Pausada' }, { value: 'expirada', label: 'Expirada' }]}
                />
                <FilterSelect
                    icon={Briefcase} value={filtroModalidade}
                    onChange={v => { setFiltroModalidade(v); setExibidos(POR_PAGINA) }}
                    placeholder="Modalidade"
                    opcoes={[{ value: 'Remoto', label: 'Remoto' }, { value: 'Híbrido', label: 'Híbrido' }, { value: 'Presencial', label: 'Presencial' }]}
                />
                <FilterSelect
                    icon={MapPin} value={filtroCidade}
                    onChange={v => { setFiltroCidade(v); setExibidos(POR_PAGINA) }}
                    placeholder="Cidade" flex="0 1 180px"
                    opcoes={cidadesOpcoes}
                />
            </AdminFilterBar>

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
                            <div style={{
                                width: 44, height: 44, borderRadius: 11,
                                background: 'linear-gradient(135deg, #09355F14, #2AB9C014)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Briefcase style={{ width: 20, height: 20, color: '#2AB9C0' }} />
                            </div>

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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <Users style={{ width: 13, height: 13 }} /> <strong style={{ color: '#09355F' }}>{v.candidaturas}</strong>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    <Calendar style={{ width: 12, height: 12 }} /> {v.dataPublicacao}
                                </span>
                                <Link href={`/admin/vagas/${v.id}`} style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.65rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#2AB9C0',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                    textDecoration: 'none',
                                }}>
                                    <Eye style={{ width: 12, height: 12 }} /> Ver
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            <LoadMoreButton
                totalFiltrado={vagasFiltradas.length}
                exibidos={exibidos}
                carregando={carregando}
                onCarregarMais={handleCarregarMais}
                entidade="vagas"
            />
        </div>
    )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    MapPin, Building2, Users, Briefcase, Award, Globe
} from 'lucide-react'
import { TODAS_EMPRESAS } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'

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

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const setoresOpcoes = [...new Set(TODAS_EMPRESAS.map(e => e.setor))].map(s => ({ value: s, label: s }))
    const cidadesOpcoes = [...new Set(TODAS_EMPRESAS.map(e => e.local))].map(c => ({ value: c, label: c }))

    return (
        <div>
            <AdminPageHeader titulo="Empresas" subtitulo={`${empresasFiltradas.length} empresas cadastradas`} />

            <AdminFilterBar onBuscar={() => setExibidos(POR_PAGINA)}>
                <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar empresa..." />
                <FilterSelect icon={Globe} value={filtroSetor} onChange={v => { setFiltroSetor(v); setExibidos(POR_PAGINA) }} placeholder="Setor" flex="0 1 170px" opcoes={setoresOpcoes} />
                <FilterSelect icon={MapPin} value={filtroCidade} onChange={v => { setFiltroCidade(v); setExibidos(POR_PAGINA) }} placeholder="Cidade" flex="0 1 180px" opcoes={cidadesOpcoes} />
                <FilterSelect icon={Award} value={filtroPlano} onChange={v => { setFiltroPlano(v); setExibidos(POR_PAGINA) }} placeholder="Plano" flex="0 1 160px" opcoes={[{ value: 'gratuito', label: 'Gratuito' }, { value: 'profissional', label: 'Profissional' }, { value: 'enterprise', label: 'Enterprise' }]} />
            </AdminFilterBar>

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
                            <div style={{ position: 'absolute', top: 14, right: 14 }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 9999,
                                    fontSize: '0.68rem', fontWeight: 700,
                                    background: planoStyle.bg, color: planoStyle.color,
                                }}>
                                    {planoStyle.label}
                                </span>
                            </div>

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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} /> {e.local}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    <Users style={{ width: 12, height: 12, flexShrink: 0 }} /> {e.totalFuncionarios} funcionários
                                </span>
                            </div>

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

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <Briefcase style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Desde {e.dataCadastro}
                                </span>
                                <Link href={`/admin/empresas/${e.id}`} style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.7rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#FE8341',
                                    textDecoration: 'none',
                                }}>
                                    Ver detalhes
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            <LoadMoreButton
                totalFiltrado={empresasFiltradas.length}
                exibidos={exibidos}
                carregando={carregando}
                onCarregarMais={handleCarregarMais}
                entidade="empresas"
            />
        </div>
    )
}

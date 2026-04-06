'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Eye, Calendar,
    Users, Filter, Plus, Trash2
} from 'lucide-react'
import { VagaAdmin, getStatusColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import { removerVaga } from '@/actions/vagas'

const POR_PAGINA = 18

interface AdminVagasClientProps {
    vagas: VagaAdmin[]
}

export default function AdminVagasClient({ vagas }: AdminVagasClientProps) {
    const [listaVagas, setListaVagas] = useState(vagas)
    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [filtroModalidade, setFiltroModalidade] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)

    const vagasFiltradas = useMemo(() => {
        return listaVagas.filter(v => {
            if (busca && !v.titulo.toLowerCase().includes(busca.toLowerCase()) && !v.empresa.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroStatus && v.status !== filtroStatus) return false
            if (filtroModalidade && v.modalidade.toLowerCase() !== filtroModalidade.toLowerCase()) return false
            if (filtroCidade && v.local !== filtroCidade) return false
            return true
        })
    }, [listaVagas, busca, filtroStatus, filtroModalidade, filtroCidade])

    const vagasVisiveis = vagasFiltradas.slice(0, exibidos)

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    async function handleRemover(id: number) {
        if (!window.confirm('Tem certeza que deseja apagar esta vaga e TODAS as suas tabelas relacionadas em cascata? Esta ação não tem volta.')) return
        
        // Optimistic update
        setListaVagas(prev => prev.filter(v => v.id !== id))
        
        const res = await removerVaga(id)
        if (!res.success) {
            alert('Erro ao apagar vaga: ' + res.error)
            // Revert on error could be implemented but simple reload works too
            window.location.reload()
        }
    }

    const cidadesOpcoes = [...new Set(listaVagas.map(v => v.local).filter(Boolean))].map(c => ({ value: c, label: c }))

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
                    opcoes={[{ value: 'Remoto', label: 'Remoto' }, { value: 'Híbrido', label: 'Híbrido' }, { value: 'Presencial', label: 'Presencial' }, { value: 'remoto', label: 'remoto (db)' }, { value: 'hibrido', label: 'hibrido (db)' }, { value: 'presencial', label: 'presencial (db)' }]}
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
                                    {v.local && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                            <MapPin style={{ width: 12, height: 12 }} /> {v.local}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0', textTransform: 'capitalize' }}>
                                    {v.modalidade}
                                </span>
                                {v.nivel && (
                                    <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#f3e8ff', color: '#7c3aed', textTransform: 'capitalize' }}>
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

                                <Link href={`/admin/vagas/editar/${v.id}`} style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.65rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#FE8341',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                    textDecoration: 'none',
                                }}>
                                    <Briefcase style={{ width: 12, height: 12 }} /> Editar
                                </Link>

                                <button onClick={async () => {
                                    if (v.temUsuario) return;
                                    if (!window.confirm('Tem certeza que deseja criar uma conta de acesso para a empresa dessa vaga? (Se já existir, o sistema barrará).')) return;
                                    const { criarContaEmpresaVaga } = await import('@/actions/vagas');
                                    const res = await criarContaEmpresaVaga(v.id);
                                    if (res.success) {
                                        alert('Usuário da empresa criado com sucesso! Email de acesso: ' + res.email + ' / Senha: Mudar@123');
                                        window.location.reload();
                                    } else {
                                        alert(res.error || 'Erro ao sincronizar.');
                                    }
                                }} 
                                disabled={v.temUsuario}
                                style={{
                                    background: v.temUsuario ? '#f1f5f9' : 'none', 
                                    border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.65rem', 
                                    cursor: v.temUsuario ? 'not-allowed' : 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, 
                                    color: v.temUsuario ? '#94a3b8' : '#6a1b9a',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                }}>
                                    <Users style={{ width: 12, height: 12 }} /> 
                                    {v.temUsuario ? 'Tem Conta' : 'Criar Usuário'}
                                </button>

                                <Link href={`/admin/vagas/cadastrar?clone=${v.id}`} style={{
                                    background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                                    padding: '0.3rem 0.65rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#09355F',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                    textDecoration: 'none',
                                }}>
                                    <Plus style={{ width: 12, height: 12 }} /> Clonar
                                </Link>

                                <button onClick={() => handleRemover(v.id)} style={{
                                    background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8,
                                    padding: '0.35rem 0.65rem', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, color: '#dc2626',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                }}>
                                    <Trash2 style={{ width: 12, height: 12 }} /> Excluir
                                </button>
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

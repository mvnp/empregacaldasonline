'use client'

import { useState, useMemo } from 'react'
import {
    MapPin, Building2, Globe, Award, Upload, Users, Briefcase,
    ToggleLeft, ToggleRight, Loader2, Search, ChevronLeft, ChevronRight
} from 'lucide-react'
import { EmpresaAdmin } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import EmpresaCard from '@/components/admin/EmpresaCard'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import ImportarEstabelecimentosModal from '@/components/admin/ImportarEstabelecimentosModal'
import { listarEmpresasDeCandidatos } from '@/actions/empresas'

const POR_PAGINA = 18

type EmpresaCandidato = {
    nome: string
    totalCargos: number
    totalCandidatos: number
    cargosExemplo: string[]
}

export default function AdminEmpresasClient({ empresas }: { empresas: EmpresaAdmin[] }) {
    // ── View principal ──
    const [busca, setBusca] = useState('')
    const [filtroSetor, setFiltroSetor] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [filtroPlano, setFiltroPlano] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)
    const [modalImportarAberto, setModalImportarAberto] = useState(false)

    // ── View candidatos ──
    const [viewCandidatos, setViewCandidatos] = useState(false)
    const [empresasCandidatos, setEmpresasCandidatos] = useState<EmpresaCandidato[]>([])
    const [carregandoCandidatos, setCarregandoCandidatos] = useState(false)
    const [buscaCandidatos, setBuscaCandidatos] = useState('')
    const [paginaCandidatos, setPaginaCandidatos] = useState(1)

    async function handleToggleView() {
        const novaView = !viewCandidatos
        setViewCandidatos(novaView)

        if (novaView && empresasCandidatos.length === 0) {
            setCarregandoCandidatos(true)
            const data = await listarEmpresasDeCandidatos() as EmpresaCandidato[]
            setEmpresasCandidatos(data)
            setCarregandoCandidatos(false)
        }
        setPaginaCandidatos(1)
        setBuscaCandidatos('')
    }

    // Filtro + paginação das empresas de candidatos
    const candidatosFiltrados = useMemo(() => {
        if (!buscaCandidatos.trim()) return empresasCandidatos
        const q = buscaCandidatos.toLowerCase()
        return empresasCandidatos.filter(e => e.nome.toLowerCase().includes(q))
    }, [empresasCandidatos, buscaCandidatos])

    const totalPagesCandidatos = Math.max(1, Math.ceil(candidatosFiltrados.length / POR_PAGINA))
    const candidatosVisiveis = candidatosFiltrados.slice(
        (paginaCandidatos - 1) * POR_PAGINA,
        paginaCandidatos * POR_PAGINA
    )

    // Filtros da view principal
    const empresasFiltradas = useMemo(() => {
        return empresas.filter(e => {
            if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroSetor && e.setor !== filtroSetor) return false
            if (filtroCidade && e.local !== filtroCidade) return false
            if (filtroPlano && e.plano !== filtroPlano) return false
            return true
        })
    }, [empresas, busca, filtroSetor, filtroCidade, filtroPlano])

    const visiveis = empresasFiltradas.slice(0, exibidos)

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const setoresOpcoes = [...new Set(empresas.map(e => e.setor).filter(Boolean))].map(s => ({ value: s as string, label: s as string }))
    const cidadesOpcoes = [...new Set(empresas.map(e => e.local).filter(Boolean))].map(c => ({ value: c as string, label: c as string }))

    // ── Botão toggle ──
    const BotaoToggle = (
        <button
            id="btn-toggle-empresas-candidatos"
            onClick={handleToggleView}
            title={viewCandidatos ? 'Ver empresas cadastradas' : 'Ver empresas dos currículos de candidatos'}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: viewCandidatos
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : '#f1f5f9',
                color: viewCandidatos ? '#fff' : '#475569',
                border: viewCandidatos ? 'none' : '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '0.65rem 1.1rem', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.82rem',
                boxShadow: viewCandidatos ? '0 2px 10px rgba(124,58,237,0.25)' : 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
            {viewCandidatos
                ? <ToggleRight style={{ width: 16, height: 16 }} />
                : <ToggleLeft style={{ width: 16, height: 16 }} />
            }
            {viewCandidatos ? 'Currículos' : 'Currículos'}
        </button>
    )

    return (
        <div>
            <AdminPageHeader
                titulo={viewCandidatos ? 'Empresas dos Currículos' : 'Empresas'}
                subtitulo={
                    viewCandidatos
                        ? carregandoCandidatos
                            ? 'Carregando...'
                            : `${candidatosFiltrados.length} empresas mencionadas em currículos`
                        : `${empresasFiltradas.length} empresas cadastradas`
                }
                acao={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {BotaoToggle}
                        {!viewCandidatos && (
                            <button
                                id="btn-importar-estabelecimentos"
                                onClick={() => setModalImportarAberto(true)}
                                title="Importar estabelecimentos via CSV"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                    color: '#fff', border: 'none', borderRadius: 12,
                                    padding: '0.65rem 1.1rem', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.82rem',
                                    boxShadow: '0 2px 8px rgba(9,53,95,0.18)',
                                    transition: 'opacity 0.15s',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                <Upload style={{ width: 16, height: 16 }} />
                                Importar CSV
                            </button>
                        )}
                    </div>
                }
            />

            {/* ══════════ VIEW: Empresas dos Currículos ══════════ */}
            {viewCandidatos ? (
                <div>
                    {/* Barra de busca */}
                    <div style={{
                        background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
                        border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                        marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{
                                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none'
                            }} />
                            <input
                                type="text"
                                value={buscaCandidatos}
                                onChange={e => { setBuscaCandidatos(e.target.value); setPaginaCandidatos(1) }}
                                placeholder="Buscar empresa dos currículos..."
                                style={{
                                    width: '100%', paddingLeft: 36, paddingRight: 12,
                                    paddingTop: '0.55rem', paddingBottom: '0.55rem',
                                    borderRadius: 10, border: '1.5px solid #e2e8f0',
                                    fontSize: '0.82rem', color: '#334155', outline: 'none',
                                    background: '#f8fafc', boxSizing: 'border-box',
                                    transition: 'border-color 0.18s',
                                }}
                                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            Fonte: <strong style={{ color: '#7c3aed' }}>candidato_experiencias</strong>
                        </span>
                    </div>

                    {/* Loading */}
                    {carregandoCandidatos && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: '#7c3aed' }}>
                            <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Carregando empresas dos currículos...</span>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* Lista - estilo /admin/vagas */}
                    {!carregandoCandidatos && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {candidatosVisiveis.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        Nenhuma empresa encontrada com esse filtro.
                                    </div>
                                )}
                                {candidatosVisiveis.map((e, idx) => (
                                    <div key={idx} style={{
                                        background: '#fff', borderRadius: 14, padding: '1.1rem 1.5rem',
                                        border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                                        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                                        transition: 'border-color 0.18s',
                                    }}>
                                        {/* Ícone */}
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                                            background: 'linear-gradient(135deg, #7c3aed14, #a855f714)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Building2 style={{ width: 20, height: 20, color: '#7c3aed' }} />
                                        </div>

                                        {/* Nome + cargos exemplo */}
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', marginBottom: '0.2rem' }}>
                                                {e.nome}
                                            </h3>
                                            {e.cargosExemplo.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <Briefcase style={{ width: 11, height: 11, color: '#94a3b8', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        {e.cargosExemplo.join(' · ')}
                                                        {e.totalCargos > 3 && ` +${e.totalCargos - 3}`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b' }}>
                                                    <Users style={{ width: 13, height: 13 }} />
                                                    <strong style={{ color: '#7c3aed', fontSize: '0.9rem' }}>{e.totalCandidatos}</strong>
                                                </div>
                                                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>candidatos</span>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b' }}>
                                                    <Briefcase style={{ width: 13, height: 13 }} />
                                                    <strong style={{ color: '#09355F', fontSize: '0.9rem' }}>{e.totalCargos}</strong>
                                                </div>
                                                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>cargos únicos</span>
                                            </div>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 9999,
                                                fontSize: '0.7rem', fontWeight: 600,
                                                background: '#f3e8ff', color: '#7c3aed',
                                            }}>
                                                Currículo
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginação */}
                            {totalPagesCandidatos > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setPaginaCandidatos(p => Math.max(1, p - 1))}
                                        disabled={paginaCandidatos <= 1}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '0.45rem 0.9rem', borderRadius: 9, border: '1.5px solid #e2e8f0',
                                            background: '#fff', color: '#09355F', fontWeight: 600, fontSize: '0.8rem',
                                            cursor: paginaCandidatos <= 1 ? 'not-allowed' : 'pointer',
                                            opacity: paginaCandidatos <= 1 ? 0.4 : 1,
                                        }}
                                    >
                                        <ChevronLeft style={{ width: 14, height: 14 }} /> Anterior
                                    </button>
                                    <span style={{ fontSize: '0.82rem', color: '#64748b', padding: '0 0.5rem' }}>
                                        Página <strong style={{ color: '#09355F' }}>{paginaCandidatos}</strong> de <strong style={{ color: '#09355F' }}>{totalPagesCandidatos}</strong>
                                    </span>
                                    <button
                                        onClick={() => setPaginaCandidatos(p => Math.min(totalPagesCandidatos, p + 1))}
                                        disabled={paginaCandidatos >= totalPagesCandidatos}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '0.45rem 0.9rem', borderRadius: 9, border: '1.5px solid #e2e8f0',
                                            background: '#fff', color: '#09355F', fontWeight: 600, fontSize: '0.8rem',
                                            cursor: paginaCandidatos >= totalPagesCandidatos ? 'not-allowed' : 'pointer',
                                            opacity: paginaCandidatos >= totalPagesCandidatos ? 0.4 : 1,
                                        }}
                                    >
                                        Próxima <ChevronRight style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* ══════════ VIEW: Empresas Cadastradas (original) ══════════ */
                <>
                    <AdminFilterBar onBuscar={() => setExibidos(POR_PAGINA)}>
                        <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar empresa..." />
                        <FilterSelect icon={Globe} value={filtroSetor} onChange={v => { setFiltroSetor(v); setExibidos(POR_PAGINA) }} placeholder="Setor" flex="0 1 170px" opcoes={setoresOpcoes} />
                        <FilterSelect icon={MapPin} value={filtroCidade} onChange={v => { setFiltroCidade(v); setExibidos(POR_PAGINA) }} placeholder="Cidade" flex="0 1 180px" opcoes={cidadesOpcoes} />
                        <FilterSelect icon={Award} value={filtroPlano} onChange={v => { setFiltroPlano(v); setExibidos(POR_PAGINA) }} placeholder="Plano" flex="0 1 160px" opcoes={[{ value: 'gratuito', label: 'Gratuito' }, { value: 'profissional', label: 'Profissional' }, { value: 'enterprise', label: 'Enterprise' }]} />
                    </AdminFilterBar>

                    <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {visiveis.map(e => (
                            <EmpresaCard
                                key={e.id}
                                id={e.id}
                                nome={e.nome}
                                local={e.local}
                                status={e.status}
                                vagasTotais={e.totalFuncionarios}
                                vagasAtivas={e.vagasAtivas}
                                tipoUsuario="admin"
                            />
                        ))}
                    </div>

                    <LoadMoreButton
                        totalFiltrado={empresasFiltradas.length}
                        exibidos={exibidos}
                        carregando={carregando}
                        onCarregarMais={handleCarregarMais}
                        entidade="empresas"
                    />
                </>
            )}

            {/* Modal de importação CSV */}
            {modalImportarAberto && (
                <ImportarEstabelecimentosModal onClose={() => setModalImportarAberto(false)} />
            )}
        </div>
    )
}

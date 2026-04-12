'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FilterPanel from '@/components/FilterPanel'
import Footer from '@/components/Footer'
import VagaCardDB from '@/components/VagaCardDB'
import BannerSpace from '@/components/publicidade/BannerSpace'

import { listarVagasPublicas, VagaPublica, ListagemVagasResult } from '@/actions/vagas'
import { FILTROS_INICIAL, FiltrosState } from '@/data/vagas'

const PER_PAGE = 5

// ── Mapa de normalização (UI → banco) ────────────────────────
const MODALIDADE_MAP: Record<string, string> = {
    'Remoto': 'remoto',
    'Híbrido': 'hibrido',
    'Presencial': 'presencial',
}
const NIVEL_MAP: Record<string, string> = {
    'Estágio': 'estagio',
    'Júnior': 'junior',
    'Pleno': 'pleno',
    'Sênior': 'senior',
}
const CONTRATO_MAP: Record<string, string> = {
    'CLT': 'clt',
    'PJ': 'pj',
    'Estágio': 'estagio',
    'Freelance': 'freelancer',
}

// ─────────────────────────────────────────────────────────────
// Paginação
// ─────────────────────────────────────────────────────────────
function Paginacao({
    page,
    totalPages,
    onPage,
    isPending,
}: {
    page: number
    totalPages: number
    onPage: (p: number) => void
    isPending: boolean
}) {
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (page > 3) pages.push('...')
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i)
        }
        if (page < totalPages - 2) pages.push('...')
        pages.push(totalPages)
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', paddingTop: '2rem' }}>
            <button
                className="page-btn"
                onClick={() => onPage(page - 1)}
                disabled={page <= 1 || isPending}
                aria-label="Página anterior"
                style={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
                <ChevronLeft style={{ width: 15, height: 15 }} />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 0.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>…</span>
                ) : (
                    <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => onPage(p as number)}
                        disabled={isPending}
                        aria-label={`Página ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="page-btn"
                onClick={() => onPage(page + 1)}
                disabled={page >= totalPages || isPending}
                aria-label="Próxima página"
                style={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
                <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// HomeClient
// ─────────────────────────────────────────────────────────────
interface Props {
    inicial: ListagemVagasResult
}

export default function HomeClient({ inicial }: Props) {
    const [resultado, setResultado] = useState<ListagemVagasResult>(inicial)

    // Estado da Hero e filtros
    const [busca, setBusca] = useState('')
    const [cidade, setCidade] = useState('')
    const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAL)

    const [drawerAberto, setDrawerAberto] = useState(false)
    const [isPending, startTransition] = useTransition()

    const vagasFiltradas = resultado.vagas
    const temFiltroAtivo = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIAL) || busca.trim() !== ''

    // ── Fetch central ──────────────────────────────────────────
    const buscarVagas = useCallback((pagina: number, filtrosBusca: FiltrosState, textoBusca: string) => {
        startTransition(async () => {
            const res = await listarVagasPublicas({
                page: pagina,
                perPage: PER_PAGE,
                busca: textoBusca || undefined,
                modalidade: filtrosBusca.modalidade !== 'Todas' ? MODALIDADE_MAP[filtrosBusca.modalidade] : undefined,
                nivel: filtrosBusca.nivel !== 'Todos' ? NIVEL_MAP[filtrosBusca.nivel] : undefined,
                tipo_contrato: filtrosBusca.contrato !== 'Todos' ? CONTRATO_MAP[filtrosBusca.contrato] : undefined,
                apenasDestaque: filtrosBusca.apenasDestaque || undefined,
            })
            setResultado(res)
        })
    }, [])

    // ── Handlers ───────────────────────────────────────────────
    const handleFiltroChange = (parcial: Partial<FiltrosState>) => {
        const novosFiltros = { ...filtros, ...parcial }
        setFiltros(novosFiltros)
        buscarVagas(1, novosFiltros, busca)
    }

    const handleLimparFiltros = () => {
        setFiltros(FILTROS_INICIAL)
        setBusca('')
        setCidade('')
        buscarVagas(1, FILTROS_INICIAL, '')
    }

    const handleBuscarTextoInline = (texto: string) => {
        setBusca(texto)
        buscarVagas(1, filtros, texto)
    }
    
    const handleBuscarHero = () => {
        buscarVagas(1, filtros, busca)
        document.getElementById('vagas')?.scrollIntoView({ behavior: 'smooth' })
    }

    const handlePage = (p: number) => {
        buscarVagas(p, filtros, busca)
        document.getElementById('vagas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const filterPanelProps = {
        filtros,
        vagasCount: resultado.total,
        temFiltroAtivo,
        onChange: handleFiltroChange,
        onLimpar: handleLimparFiltros,
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Navbar variant="transparent" />

            <HeroSection
                busca={busca}
                cidade={cidade}
                onBuscaChange={setBusca}
                onCidadeChange={setCidade}
                onBuscar={handleBuscarHero}
            />

            <div style={{ maxWidth: 1280, margin: '2rem auto 0', padding: '0 2rem' }}>
                <BannerSpace formato="leaderboard" className="ad-leaderboard-hero" />
            </div>

            <section id="vagas" style={{ padding: '2rem 2rem 4rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#09355F' }}>
                                Vagas Disponíveis
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2AB9C0', marginLeft: '0.5rem' }}>
                                    ({resultado.total})
                                </span>
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Atualizadas diariamente — encontre a oportunidade certa
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} />
                                <input
                                    id="busca-vagas-inline"
                                    type="text"
                                    value={busca}
                                    onChange={e => handleBuscarTextoInline(e.target.value)}
                                    placeholder="Buscar por cargo ou empresa..."
                                    style={{
                                        paddingLeft: 32, paddingRight: 12, paddingTop: '0.5rem', paddingBottom: '0.5rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: 10,
                                        fontSize: '0.85rem', color: '#09355F',
                                        outline: 'none', width: 240,
                                        background: '#fff',
                                    }}
                                    aria-label="Buscar vagas"
                                />
                            </div>

                            <button
                                id="btn-abrir-filtros"
                                onClick={() => setDrawerAberto(true)}
                                className="btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                aria-label="Abrir filtros"
                            >
                                <Filter style={{ width: 15, height: 15 }} />
                                Filtros
                                {temFiltroAtivo && (
                                    <span style={{ width: 18, height: 18, background: '#09355F', color: '#FBBF53', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        !
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="home-vagas-grid">
                        <div>
                            {isPending ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Array.from({ length: PER_PAGE }).map((_, i) => (
                                        <div key={i} style={{
                                            height: 140, borderRadius: 16,
                                            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.4s infinite',
                                        }} />
                                    ))}
                                    <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                                        <Loader2 style={{ width: 20, height: 20, color: '#2AB9C0', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                                    </div>
                                </div>
                            ) : vagasFiltradas.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                    <Search style={{ width: 56, height: 56, color: '#e2e8f0', margin: '0 auto 1rem' }} />
                                    <h3 style={{ color: '#09355F', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma vaga encontrada</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        Tente ajustar os filtros ou a busca
                                    </p>
                                    <button id="btn-limpar-filtros-vazio" className="btn-primary" onClick={handleLimparFiltros} style={{ padding: '0.625rem 1.5rem', borderRadius: 10 }}>
                                        Limpar filtros
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {vagasFiltradas.map((vaga, i) => (
                                        <React.Fragment key={vaga.id}>
                                            <VagaCardDB vaga={vaga} />
                                            {i === 2 && <BannerSpace formato="native" className="ad-native-inline" />}
                                        </React.Fragment>
                                    ))}

                                    {resultado.totalPages > 1 && (
                                        <Paginacao
                                            page={resultado.page}
                                            totalPages={resultado.totalPages}
                                            onPage={handlePage}
                                            isPending={isPending}
                                        />
                                    )}

                                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', paddingTop: '0.5rem' }}>
                                        Exibindo {((resultado.page - 1) * PER_PAGE) + 1}–{Math.min(resultado.page * PER_PAGE, resultado.total)} de {resultado.total} vagas
                                    </p>
                                </div>
                            )}
                        </div>

                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <FilterPanel {...filterPanelProps} />
                            <BannerSpace formato="rectangle" className="ad-sidebar-rect" />
                        </aside>
                    </div>
                </div>

                {drawerAberto && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                        <div
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setDrawerAberto(false)}
                        />
                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, background: '#fff', overflowY: 'auto', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1.5px solid #e8edf5', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                <strong style={{ color: '#09355F' }}>Filtrar Vagas</strong>
                                <button id="btn-fechar-drawer" onClick={() => setDrawerAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} aria-label="Fechar filtros">
                                    <X style={{ width: 20, height: 20, color: '#475569' }} />
                                </button>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <FilterPanel {...filterPanelProps} />
                            </div>
                            <div style={{ padding: '1rem', borderTop: '1.5px solid #e8edf5', position: 'sticky', bottom: 0, background: '#fff' }}>
                                <button id="btn-confirmar-filtros" className="btn-primary" onClick={() => setDrawerAberto(false)} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, fontSize: '0.95rem' }}>
                                    Ver {resultado.total} vagas
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <div style={{ maxWidth: 1280, margin: '0 auto 4rem', padding: '0 2rem' }}>
                <BannerSpace formato="billboard" className="ad-billboard-footer" />
            </div>

            <Footer />
        </div>
    )
}

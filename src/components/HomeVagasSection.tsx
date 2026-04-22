'use client'

import { useState, useTransition, useCallback } from 'react'
import { Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import FilterPanel from '@/components/FilterPanel'
import VagaCardDB from '@/components/VagaCardDB'

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
    // Gera array de páginas visíveis (max 5 botões)
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
            {/* Anterior */}
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

            {/* Próxima */}
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
// HomeVagasSection
// ─────────────────────────────────────────────────────────────
interface Props {
    inicial: ListagemVagasResult
    busca?: string
    cidade?: string
}

export default function HomeVagasSection({ inicial, busca: buscaInicial = '', cidade: cidadeInicial = '' }: Props) {
    // Estado de resultado
    const [resultado, setResultado] = useState<ListagemVagasResult>(inicial)

    // Estado de filtros
    const [busca, setBusca] = useState(buscaInicial)
    const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAL)

    // UI
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
        buscarVagas(1, FILTROS_INICIAL, '')
    }

    const handleBuscarTexto = (texto: string) => {
        setBusca(texto)
        buscarVagas(1, filtros, texto)
    }

    const handlePage = (p: number) => {
        buscarVagas(p, filtros, busca)
        document.getElementById('vagas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Props para FilterPanel
    const filterPanelProps = {
        filtros,
        vagasCount: resultado.total,
        temFiltroAtivo,
        onChange: handleFiltroChange,
        onLimpar: handleLimparFiltros,
    }

    return (
        <section id="vagas" style={{ padding: '4rem 2rem' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* Cabeçalho da seção */}
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

                    {/* Busca rápida inline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} />
                            <input
                                id="busca-vagas-inline"
                                type="text"
                                value={busca}
                                onChange={e => handleBuscarTexto(e.target.value)}
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

                        {/* Botão filtros mobile */}
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

                        {/* Botão Cadastrar currículo (WhatsApp) */}
                        <a
                            id="btn-cadastrar-curriculo"
                            href="/cadastro/candidato"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.5rem 1rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                borderRadius: 10,
                                background: '#25D366',
                                color: '#fff',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
                                transition: 'background 0.18s, box-shadow 0.18s, transform 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.background = '#1ebe5d'
                                    ; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 14px rgba(37,211,102,0.5)'
                                    ; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.background = '#25D366'
                                    ; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(37,211,102,0.35)'
                                    ; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                            }}
                            aria-label="Cadastrar meu currículo"
                        >
                            {/* Ícone WhatsApp SVG */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ width: 16, height: 16, flexShrink: 0 }}
                                aria-hidden="true"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Cadastrar CURRÍCULO
                        </a>
                    </div>
                </div>

                {/* Layout: vagas + filtros sidebar */}
                <div className="home-vagas-grid">

                    {/* Lista de vagas */}
                    <div>
                        {isPending ? (
                            // Skeleton loading
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
                            // Estado vazio
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
                                {vagasFiltradas.map(vaga => (
                                    <VagaCardDB key={vaga.id} vaga={vaga} />
                                ))}

                                {/* Paginação */}
                                {resultado.totalPages > 1 && (
                                    <Paginacao
                                        page={resultado.page}
                                        totalPages={resultado.totalPages}
                                        onPage={handlePage}
                                        isPending={isPending}
                                    />
                                )}

                                {/* Info de paginação */}
                                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', paddingTop: '0.5rem' }}>
                                    Exibindo {((resultado.page - 1) * PER_PAGE) + 1}–{Math.min(resultado.page * PER_PAGE, resultado.total)} de {resultado.total} vagas
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Filtros — sidebar desktop */}
                    <aside>
                        <FilterPanel {...filterPanelProps} />
                    </aside>

                </div>
            </div>

            {/* ── Drawer de filtros (mobile) ── */}
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
    )
}

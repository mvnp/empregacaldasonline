'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Eye, Calendar,
    Users, Filter, Plus, Trash2, Search, Loader2, ChevronLeft, ChevronRight, UploadCloud
} from 'lucide-react'
import { VagaAdmin, getStatusColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSelect from '@/components/admin/FilterSelect'
import { removerVaga, listarVagasAdmin, buscarCidadesVagas } from '@/actions/vagas'

const POR_PAGINA = 18

// Mapeia registro cru do banco para VagaAdmin
function mapVaga(v: any): VagaAdmin {
    const dataObj = new Date(v.created_at)
    const dia = String(dataObj.getDate()).padStart(2, '0')
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
    const ano = dataObj.getFullYear()
    return {
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        local: v.local || 'Não informado',
        modalidade: v.modalidade,
        candidaturas: (v.candidaturas || []).length,
        status: v.status as 'ativa' | 'pausada' | 'expirada' | 'rascunho',
        dataPublicacao: `${ano}-${mes}-${dia}`,
        salario: v.salario_min ? `R$ ${v.salario_min}` : 'A combinar',
        nivel: v.nivel,
        temUsuario: !!v.empresas?.user?.tipo && v.empresas.user.tipo === 'empregador'
    }
}

export default function AdminVagasClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [vagas, setVagas] = useState<VagaAdmin[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    // Estados iniciais vindos da URL para persistência
    const [busca, setBusca] = useState(searchParams.get('busca') || '')
    const [filtroStatus, setFiltroStatus] = useState(searchParams.get('status') || '')
    const [filtroModalidade, setFiltroModalidade] = useState(searchParams.get('modalidade') || '')
    const [filtroCidade, setFiltroCidade] = useState(searchParams.get('cidade') || '')
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)

    const [carregando, setCarregando] = useState(true)
    const [cidadesOpcoes, setCidadesOpcoes] = useState<{ value: string; label: string }[]>([])

    // Referências para controle de busca e debounce
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSearchParamsRef = useRef<string | null>(null)

    const buscarVagas = useCallback(async (params: {
        busca: string
        status: string
        modalidade: string
        cidade: string
        page: number
    }) => {
        console.log('[AdminVagasClient] Iniciando buscarVagas:', params)
        setCarregando(true)
        try {
            const res = await listarVagasAdmin({
                busca: params.busca || undefined,
                status: params.status || undefined,
                modalidade: params.modalidade || undefined,
                cidade: params.cidade || undefined,
                page: params.page,
                perPage: POR_PAGINA,
            })
            console.log('[AdminVagasClient] Resultados recebidos:', res.vagas.length)
            setVagas(res.vagas.map(mapVaga))
            setTotal(res.total)
            setTotalPages(res.totalPages)
            setCurrentPage(params.page)
        } catch (err) {
            console.error('[AdminVagasClient] Erro ao buscar vagas:', err)
        } finally {
            setCarregando(false)
            console.log('[AdminVagasClient] Carregando finalizado.')
        }
    }, [])

    // Carrega cidades uma vez de forma otimizada via Server Action
    useEffect(() => {
        buscarCidadesVagas().then(cidades => {
            setCidadesOpcoes(cidades.map(c => ({ value: c, label: c })))
        })
    }, [])

    // Dispara busca com debounce quando filtros mudam e sincroniza com a URL
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams()
            if (busca) params.set('busca', busca)
            if (filtroStatus) params.set('status', filtroStatus)
            if (filtroModalidade) params.set('modalidade', filtroModalidade)
            if (filtroCidade) params.set('cidade', filtroCidade)
            if (currentPage > 1) params.set('page', String(currentPage))

            const query = params.toString()
            const url = query ? `${pathname}?${query}` : pathname
            
            // Salvar no sessionStorage para persistência entre navegações
            sessionStorage.setItem('admin_vagas_filters', JSON.stringify({
                busca, status: filtroStatus, modalidade: filtroModalidade, cidade: filtroCidade, page: currentPage
            }))

            // Evita busca duplicada se os parâmetros forem idênticos ao último fetch
            if (lastSearchParamsRef.current === query) {
                setCarregando(false)
                return
            }

            // Só faz o replace se a query atual for diferente da desejada (persistência)
            const currentSearch = window.location.search.replace('?', '')
            if (currentSearch !== query) {
                router.replace(url, { scroll: false })
            }

            lastSearchParamsRef.current = query
            buscarVagas({ 
                busca, 
                status: filtroStatus, 
                modalidade: filtroModalidade, 
                cidade: filtroCidade, 
                page: currentPage 
            })
        }, 400)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [busca, filtroStatus, filtroModalidade, filtroCidade, currentPage, buscarVagas, pathname, router])

    // Carrega filtros do sessionStorage no mount se a URL estiver vazia
    useEffect(() => {
        const saved = sessionStorage.getItem('admin_vagas_filters')
        if (saved && !searchParams.toString()) {
            try {
                const f = JSON.parse(saved)
                if (f.busca) setBusca(f.busca)
                if (f.status) setFiltroStatus(f.status)
                if (f.modalidade) setFiltroModalidade(f.modalidade)
                if (f.cidade) setFiltroCidade(f.cidade)
                if (f.page) setCurrentPage(f.page)
            } catch (e) {}
        }
    }, [])

    function handleLimparFiltros() {
        setBusca('')
        setFiltroStatus('')
        setFiltroModalidade('')
        setFiltroCidade('')
        setCurrentPage(1)
        sessionStorage.removeItem('admin_vagas_filters')
        router.replace(pathname, { scroll: false })
    }

    // Atualiza a lista quando a janela ganha foco (útil pois Editar abre em nova aba)
    useEffect(() => {
        const handleFocus = () => {
            // Só atualiza se não estiver carregando e já houver parâmetros definidos
            if (!carregando) {
                buscarVagas({ busca, status: filtroStatus, modalidade: filtroModalidade, cidade: filtroCidade, page: currentPage })
            }
        }
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [carregando, busca, filtroStatus, filtroModalidade, filtroCidade, currentPage, buscarVagas])

    function handlePageChange(newPage: number) {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleRemover(id: number) {
        if (!window.confirm('Tem certeza que deseja apagar esta vaga e TODAS as suas tabelas relacionadas em cascata? Esta ação não tem volta.')) return
        setVagas(prev => prev.filter(v => v.id !== id))
        setTotal(prev => prev - 1)
        const res = await removerVaga(id)
        if (!res.success) {
            alert('Erro ao apagar vaga: ' + res.error)
            window.location.reload()
        }
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Vagas"
                subtitulo={carregando ? 'Buscando...' : `${total} vagas encontradas`}
                acao={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href="/admin/vagas/em-massa" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.25rem', borderRadius: 10,
                            background: 'linear-gradient(135deg, #FE8341, #f97316)',
                            color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                            textDecoration: 'none', boxShadow: '0 4px 12px rgba(254,131,65,0.3)',
                            transition: 'all 0.18s',
                        }}>
                            <UploadCloud style={{ width: 16, height: 16 }} /> Vagas em Massa
                        </Link>
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
                    </div>
                }
            />

            <AdminFilterBar 
                onBuscar={() => {}} 
                onLimpar={handleLimparFiltros}
                temFiltroAtivo={!!(busca || filtroStatus || filtroModalidade || filtroCidade)}
            >
                {/* Campo de busca customizado com ícone de loading */}
                <div style={{ position: 'relative', flex: '1 1 260px' }}>
                    <Search style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none'
                    }} />
                    <input
                        type="text"
                        value={busca}
                        onChange={e => { setBusca(e.target.value); setCurrentPage(1); }}
                        placeholder="Buscar vaga ou empresa..."
                        style={{
                            width: '100%', paddingLeft: 36, paddingRight: carregando && busca ? 36 : 12,
                            paddingTop: '0.55rem', paddingBottom: '0.55rem',
                            borderRadius: 10, border: '1.5px solid #e2e8f0',
                            fontSize: '0.82rem', color: '#334155', outline: 'none',
                            background: '#fff', boxSizing: 'border-box',
                            transition: 'border-color 0.18s',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#2AB9C0')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    {carregando && busca && (
                        <Loader2 style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            width: 14, height: 14, color: '#2AB9C0', animation: 'spin 1s linear infinite'
                        }} />
                    )}
                </div>

                <FilterSelect
                    icon={Filter} value={filtroStatus}
                    onChange={v => { setFiltroStatus(v); setCurrentPage(1); }}
                    placeholder="Status"
                    opcoes={[
                        { value: 'ativa', label: 'Ativa' },
                        { value: 'pausada', label: 'Pausada' },
                        { value: 'expirada', label: 'Expirada' },
                        { value: 'rascunho', label: 'Rascunho' },
                    ]}
                />
                <FilterSelect
                    icon={Briefcase} value={filtroModalidade}
                    onChange={v => { setFiltroModalidade(v); setCurrentPage(1); }}
                    placeholder="Modalidade"
                    opcoes={[
                        { value: 'Remoto', label: 'Remoto' }, { value: 'Híbrido', label: 'Híbrido' },
                        { value: 'Presencial', label: 'Presencial' }, { value: 'remoto', label: 'remoto (db)' },
                        { value: 'hibrido', label: 'híbrido (db)' }, { value: 'presencial', label: 'presencial (db)' }
                    ]}
                />
                <FilterSelect
                    icon={MapPin} value={filtroCidade}
                    onChange={v => { setFiltroCidade(v); setCurrentPage(1); }}
                    placeholder="Cidade" flex="0 1 180px"
                    opcoes={cidadesOpcoes}
                />
            </AdminFilterBar>

            <style>{`@keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }`}</style>

            {/* ── Lista de vagas ── */}
            <div style={{ position: 'relative' }}>
                {carregando && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 10, borderRadius: 14, minHeight: 120,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Loader2 style={{ width: 28, height: 28, color: '#2AB9C0', animation: 'spin2 1s linear infinite' }} />
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Buscando vagas...</span>
                        </div>
                    </div>
                )}
                <style>{`@keyframes spin2 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: carregando ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    {vagas.length === 0 && !carregando && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Nenhuma vaga encontrada com os filtros selecionados.
                        </div>
                    )}
                    {vagas.map(v => {
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
            </div>

            {/* ── Paginação ── */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || carregando}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '0.45rem 0.9rem', borderRadius: 9, border: '1.5px solid #e2e8f0',
                            background: '#fff', color: '#09355F', fontWeight: 600, fontSize: '0.8rem',
                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage <= 1 ? 0.4 : 1,
                        }}
                    >
                        <ChevronLeft style={{ width: 14, height: 14 }} /> Anterior
                    </button>

                    <span style={{ fontSize: '0.82rem', color: '#64748b', padding: '0 0.5rem' }}>
                        Página <strong style={{ color: '#09355F' }}>{currentPage}</strong> de <strong style={{ color: '#09355F' }}>{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || carregando}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '0.45rem 0.9rem', borderRadius: 9, border: '1.5px solid #e2e8f0',
                            background: '#fff', color: '#09355F', fontWeight: 600, fontSize: '0.8rem',
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage >= totalPages ? 0.4 : 1,
                        }}
                    >
                        Próxima <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            )}
        </div>
    )
}

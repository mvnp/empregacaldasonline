'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapPin, Phone, Mail, Building2, Search, AlertCircle, Star } from 'lucide-react'
import type { Estabelecimento } from './page'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import FilterSelect from '@/components/admin/FilterSelect'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import { buscarEstabelecimentosPaginado, toggleEstabelecimentoFavorito } from '@/actions/estabelecimentos'

const POR_PAGINA = 25

interface Props {
    initialData: Estabelecimento[]
    initialCount: number
    initialFavoritos: number[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cnaes: any[]
    erro: boolean
}

function formatTelefone(ddd: string | null, tel: string | null): string {
    const d = ddd?.trim()
    const t = tel?.trim()
    if (!d && !t) return 'Não informado'
    if (!t) return 'Não informado'
    return `(${d || '--'}) ${t}`
}

function formatEndereco(est: Estabelecimento): { linha1: string; linha2: string; linha3: string } {
    const tipoLog = est.tipo_logradouro?.trim() ?? ''
    const logradouro = est.logradouro?.trim() ?? ''
    const numero = est.numero?.trim() ?? ''
    const complemento = est.complemento?.trim() ?? ''
    const bairro = est.bairro?.trim() ?? ''
    const municipio = est.municipio?.trim() || 'Caldas Novas'
    const uf = est.uf?.trim() || 'GO'
    const cep = est.cep?.trim() ?? ''

    const parteRua = [tipoLog, logradouro].filter(Boolean).join(' ')
    const linha1 = cep
        ? `${cep} · ${parteRua}${numero ? `, ${numero}` : ''}`
        : `${parteRua}${numero ? `, ${numero}` : ''}`

    const linha2 = complemento || ''
    const linha3 = [bairro, `${municipio} - ${uf}`].filter(Boolean).join(' · ')

    return { linha1, linha2, linha3 }
}

export default function ListaEstabelecimentosClient({ initialData, initialCount, initialFavoritos, cnaes, erro }: Props) {
    const [buscaInput, setBuscaInput] = useState('')
    const [buscaAtiva, setBuscaAtiva] = useState('')

    const [filtroCnae, setFiltroCnae] = useState('')
    const [filtroCnaeAtivo, setFiltroCnaeAtivo] = useState('')

    const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>(initialData)
    const [totalCount, setTotalCount] = useState(initialCount)
    const [favoritos, setFavoritos] = useState<number[]>(initialFavoritos)

    const [carregando, setCarregando] = useState(false)
    const [buscando, setBuscando] = useState(false)

    // Apenas prepara as dependências com base na lista de CNAEs vindas do Server.
    const cnaesOpcoes = useMemo(() => {
        return cnaes.map(c => ({
            value: c.codigo.toString(),
            label: `${c.codigo} - ${c.descricao}`
        }))
    }, [cnaes])

    // Removendo debounce automático e mudando para disparar manualmente
    // Somente chamaremos essa ação ao clicar no Botão 'Buscar' do AdminFilterBar

    async function realizarBusca() {
        setBuscando(true)
        setBuscaAtiva(buscaInput)
        setFiltroCnaeAtivo(filtroCnae)
        try {
            const res = await buscarEstabelecimentosPaginado(buscaInput, 0, POR_PAGINA, filtroCnae)
            if (!res.erro) {
                setEstabelecimentos(res.data as Estabelecimento[])
                setTotalCount(res.count)
                if (res.favoritosIds) setFavoritos(res.favoritosIds)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setBuscando(false)
        }
    }

    async function handleLimparBusca() {
        setBuscando(true)
        setBuscaInput('')
        setBuscaAtiva('')
        setFiltroCnae('')
        setFiltroCnaeAtivo('')
        try {
            const res = await buscarEstabelecimentosPaginado('', 0, POR_PAGINA, '')
            if (!res.erro) {
                setEstabelecimentos(res.data as Estabelecimento[])
                setTotalCount(res.count)
                if (res.favoritosIds) setFavoritos(res.favoritosIds)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setBuscando(false)
        }
    }

    async function handleCarregarMais() {
        if (carregando) return
        setCarregando(true)
        try {
            const res = await buscarEstabelecimentosPaginado(buscaAtiva, estabelecimentos.length, POR_PAGINA, filtroCnaeAtivo)
            if (!res.erro) {
                setEstabelecimentos(prev => [...prev, ...(res.data as Estabelecimento[])])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setCarregando(false)
        }
    }

    async function handleFavoritoToggle(id: number) {
        const isFavAtual = favoritos.includes(id)

        // Optimistic UI update
        if (isFavAtual) {
            setFavoritos(prev => prev.filter(fid => fid !== id))
        } else {
            setFavoritos(prev => [...prev, id])
        }

        const res = await toggleEstabelecimentoFavorito(id, !isFavAtual)
        if (res.erro) {
            console.error('Falha ao favoritar', res.erro)
            // Revert state if error
            if (isFavAtual) {
                setFavoritos(prev => [...prev, id])
            } else {
                setFavoritos(prev => prev.filter(fid => fid !== id))
            }
        }
    }

    const visiveis = estabelecimentos

    if (erro) {
        return (
            <div>
                <AdminPageHeader titulo="Lista de Empresas" subtitulo="Estabelecimentos da tabela _estabelecimentos" />
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '4rem 2rem', gap: '1rem', textAlign: 'center',
                }}>
                    <AlertCircle style={{ width: 40, height: 40, color: '#FE8341' }} />
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        Não foi possível carregar os dados. Verifique se a tabela <code>_estabelecimentos</code> existe e tem dados.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Lista de Empresas"
                subtitulo={`${totalCount.toLocaleString('pt-BR')} estabelecimentos encontrados`}
            />

            <AdminFilterBar
                onBuscar={realizarBusca}
                onLimpar={handleLimparBusca}
                temFiltroAtivo={buscaAtiva !== '' || filtroCnaeAtivo !== ''}
            >
                <FilterSearchInput value={buscaInput} onChange={setBuscaInput} placeholder="Buscar por Nome ou Bairro..." />
                <FilterSelect icon={Building2} value={filtroCnae} onChange={setFiltroCnae} placeholder="Todos os CNAEs" flex="0 1 350px" opcoes={cnaesOpcoes} />
            </AdminFilterBar>

            {/* Grid de cards */}
            {buscando ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Buscando estabelecimentos...
                </div>
            ) : visiveis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Nenhum estabelecimento encontrado{buscaInput ? ` para "${buscaInput}"` : ''}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '1rem',
                    alignItems: 'stretch',
                }}>
                    {visiveis.map(est => {
                        const nome = est.nome_fantasia?.trim() || 'Empresa sem nome'
                        const semNome = !est.nome_fantasia?.trim()

                        const cnaeObj = cnaes.find(c => String(c.codigo) === String(est.cnae_fiscal_principal))
                        const cnaeDescricao = cnaeObj ? cnaeObj.descricao : (est.cnae_fiscal_principal || 'CNAE Não informado')
                        const cnpjBasico = est.cnpj_basico || 'CNPJ não informado'

                        const end = formatEndereco(est)
                        const email = est.correio_eletronico?.trim() || 'Não informado'
                        const tel1 = formatTelefone(est.ddd_1, est.telefone_1)
                        const tel2 = formatTelefone(est.ddd_2, est.telefone_2)

                        return (
                            <div
                                key={est.id}
                                style={{
                                    background: '#fff',
                                    borderRadius: 14,
                                    border: '1.5px solid #e8edf5',
                                    boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'border-color 0.18s, box-shadow 0.18s',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#2AB9C0'
                                        ; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(9,53,95,0.10)'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#e8edf5'
                                        ; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(9,53,95,0.04)'
                                }}
                            >
                                {/* Cabeçalho do card — Empresa */}
                                <div style={{
                                    padding: '1rem 1.1rem 0.85rem',
                                    borderBottom: '1px solid #f0f4f8',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                        background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Building2 style={{ width: 18, height: 18, color: '#fff' }} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <h3 style={{
                                                fontSize: '1rem', fontWeight: 800,
                                                color: semNome ? '#94a3b8' : '#09355F',
                                                fontStyle: semNome ? 'italic' : 'normal',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                margin: '0 0 0.25rem',
                                                flex: 1
                                            }}
                                                title={nome}
                                            >
                                                {nome}
                                            </h3>
                                            <button
                                                onClick={() => handleFavoritoToggle(est.id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '0.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: favoritos.includes(est.id) ? '#eab308' : '#cbd5e1',
                                                    transition: 'color 0.2s, transform 0.2s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                                                title={favoritos.includes(est.id) ? "Remover dos favoritos" : "Favoritar empresa"}
                                            >
                                                <Star style={{ width: 18, height: 18 }} fill={favoritos.includes(est.id) ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        <p style={{
                                            fontSize: '0.8rem', color: '#FE8341', fontWeight: 600,
                                            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}
                                            title={`${cnaeDescricao} - ${cnpjBasico}`}
                                        >
                                            <span style={{ color: '#09355f' }}>{cnpjBasico}</span> • {cnaeDescricao}
                                        </p>
                                    </div>
                                </div>

                                {/* Endereço */}
                                <div style={{
                                    padding: '0.85rem 1.1rem',
                                    borderBottom: '1px solid #f0f4f8',
                                    flex: 1,
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                                        marginBottom: '0.2rem',
                                    }}>
                                        <MapPin style={{ width: 12, height: 12, color: '#2AB9C0', flexShrink: 0, marginTop: 2 }} />
                                        <div style={{ minWidth: 0, paddingTop: 2 }}>
                                            <p style={{
                                                fontSize: '0.85rem', color: '#475569', margin: '0 0 0.15rem',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}
                                                title={end.linha1}
                                            >
                                                {end.linha1 || 'Logradouro não informado'}
                                            </p>
                                            {end.linha2 && (
                                                <p style={{
                                                    fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.15rem',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}
                                                    title={end.linha2}
                                                >
                                                    {end.linha2}
                                                </p>
                                            )}
                                            <p style={{
                                                fontSize: '0.82rem', color: '#64748b', margin: 0,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}
                                                title={end.linha3}
                                            >
                                                {end.linha3}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contatos */}
                                <div style={{ padding: '0.85rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <ContatoItem
                                        icon={<Phone style={{ width: 11, height: 11, flexShrink: 0 }} />}
                                        label="Tel. 1"
                                        valor={tel1}
                                        naoInformado={tel1 === 'Não informado'}
                                    />
                                    <ContatoItem
                                        icon={<Phone style={{ width: 11, height: 11, flexShrink: 0 }} />}
                                        label="Tel. 2"
                                        valor={tel2}
                                        naoInformado={tel2 === 'Não informado'}
                                    />
                                    <ContatoItem
                                        icon={<Mail style={{ width: 11, height: 11, flexShrink: 0 }} />}
                                        label="E-mail"
                                        valor={email}
                                        naoInformado={email === 'Não informado'}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
                <LoadMoreButton
                    totalFiltrado={totalCount}
                    exibidos={estabelecimentos.length}
                    carregando={carregando}
                    onCarregarMais={handleCarregarMais}
                    entidade="estabelecimentos"
                />
            </div>
        </div>
    )
}

/* ── Sub-componente linha de contato ── */
function ContatoItem({
    icon, label, valor, naoInformado,
}: {
    icon: React.ReactNode
    label: string
    valor: string
    naoInformado: boolean
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: naoInformado ? '#cbd5e1' : '#2AB9C0' }}>{icon}</span>
            <span style={{
                fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8',
                minWidth: 42, flexShrink: 0,
            }}>{label}:</span>
            <span style={{
                fontSize: '0.82rem',
                color: naoInformado ? '#cbd5e1' : '#475569',
                fontStyle: naoInformado ? 'italic' : 'normal',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
                title={valor}
            >
                {valor}
            </span>
        </div>
    )
}

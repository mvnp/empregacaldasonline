'use client'

import { useState, useEffect } from 'react'
import { X, Tag, Loader2, Sparkles, CheckCircle, Code, Copy, Check } from 'lucide-react'
import {
    listarVagaCategorias,
    buscarCategoriasDoCandidato,
    salvarCategoriasCandidato,
    buscarCandidatoParaCategorizacao,
} from '@/actions/candidatos'
import { classificarCandidatoComIA } from '@/actions/openai'

export type CandidatoFormSnapshot = {
    nome_completo?: string
    cargo_desejado?: string
    resumo?: string
    experiencias?: { cargo: string; empresa: string; descricao?: string }[]
    formacoes?: { curso: string; instituicao: string; grau?: string }[]
    habilidades?: string[]
    idiomas?: { idioma: string; nivel?: string }[]
}

interface Props {
    candidatoId?: number
    formSnapshot?: CandidatoFormSnapshot
    initialSelecionadas?: number[]
    onClose: () => void
    onSaved?: (selecionadas: number[]) => void
}

export default function CategorizarModal({ candidatoId, formSnapshot, initialSelecionadas, onClose, onSaved }: Props) {
    const [categorias, setCategorias] = useState<{ id: number; descricao: string; slug: string }[]>([])
    const [selecionadas, setSelecionadas] = useState<number[]>([])
    const [loadingCategorias, setLoadingCategorias] = useState(true)
    const [loadingIA, setLoadingIA] = useState(false)
    const [loadingSalvar, setLoadingSalvar] = useState(false)
    const [iaRecomendou, setIaRecomendou] = useState<number[]>([])
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    // JSON viewer state
    const [jsonPayload, setJsonPayload] = useState<Record<string, any> | null>(null)
    const [loadingJson, setLoadingJson] = useState(false)
    const [jsonCopied, setJsonCopied] = useState(false)

    useEffect(() => {
        async function init() {
            setLoadingCategorias(true)
            const cats = await listarVagaCategorias()
            setCategorias(cats)

            if (candidatoId) {
                const salvas = await buscarCategoriasDoCandidato(candidatoId)
                setSelecionadas(salvas)
            } else if (initialSelecionadas && initialSelecionadas.length > 0) {
                setSelecionadas(initialSelecionadas)
            }
            setLoadingCategorias(false)
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidatoId])

    async function buildDadosCandidato(): Promise<Record<string, any> | null> {
        if (candidatoId) {
            return await buscarCandidatoParaCategorizacao(candidatoId)
        } else if (formSnapshot) {
            return {
                nome_completo: formSnapshot.nome_completo,
                cargo_desejado: formSnapshot.cargo_desejado,
                resumo: formSnapshot.resumo,
                candidato_experiencias: formSnapshot.experiencias?.filter(e => e.cargo || e.empresa) || [],
                candidato_formacoes: formSnapshot.formacoes?.filter(f => f.curso || f.instituicao) || [],
                candidato_habilidades: (formSnapshot.habilidades || []).filter(Boolean).map(h => ({ texto: h })),
                candidato_idiomas: formSnapshot.idiomas?.filter(i => i.idioma) || [],
            }
        }
        return null
    }

    function toggleCategoria(id: number) {
        setSelecionadas(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            if (prev.length >= 2) return prev
            return [...prev, id]
        })
    }

    async function handleIA() {
        setErro('')
        setLoadingIA(true)
        setIaRecomendou([])
        try {
            const dadosCandidato = await buildDadosCandidato()
            if (!dadosCandidato) {
                setErro('Nenhuma fonte de dados disponível para a IA analisar.')
                setLoadingIA(false)
                return
            }
            const res = await classificarCandidatoComIA({ candidato: dadosCandidato, categorias })
            if (!res.success || !res.categoriaIds) {
                setErro(res.error || 'Erro ao consultar a IA.')
            } else {
                setIaRecomendou(res.categoriaIds)
                setSelecionadas(res.categoriaIds)
            }
        } catch (e: any) {
            setErro(e.message || 'Erro inesperado.')
        } finally {
            setLoadingIA(false)
        }
    }

    async function handleVerJson() {
        setLoadingJson(true)
        setErro('')
        try {
            const dados = await buildDadosCandidato()
            if (!dados) {
                setErro('Sem dados para exibir. Preencha o formulário primeiro.')
                return
            }
            setJsonPayload({ candidato: dados, categorias })
        } catch (e: any) {
            setErro(e.message || 'Erro ao carregar dados.')
        } finally {
            setLoadingJson(false)
        }
    }

    async function handleSalvar() {
        if (!candidatoId) {
            onSaved?.(selecionadas)
            onClose()
            return
        }
        setLoadingSalvar(true)
        setErro('')
        const res = await salvarCategoriasCandidato(candidatoId, selecionadas)
        setLoadingSalvar(false)
        if (res.success) {
            setSucesso(true)
            setTimeout(() => { onSaved?.(selecionadas); onClose() }, 1200)
        } else {
            setErro(res.error || 'Erro ao salvar categorias.')
        }
    }

    const keyframes = `
        @keyframes fadeSlideUp { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform:none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    `

    return (
        <>
            <style>{keyframes}</style>

            {/* ── Modal Principal ── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 300,
                background: 'rgba(9,53,95,0.55)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
                    boxShadow: '0 24px 60px rgba(9,53,95,0.22)', overflow: 'hidden',
                    animation: 'fadeSlideUp 0.22s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Tag style={{ width: 18, height: 18, color: '#fff' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#09355F' }}>Categorizar Candidato</h3>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Selecione até 2 categorias para este perfil</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 4 }}>
                            <X size={22} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1.5rem' }}>

                        {/* Linha de ações */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            {/* Sugerir com IA */}
                            <button
                                onClick={handleIA}
                                disabled={loadingIA || loadingCategorias}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.7rem 1rem', borderRadius: 12,
                                    background: loadingIA ? '#e0e7ef' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    color: loadingIA ? '#94a3b8' : '#fff',
                                    border: 'none', cursor: loadingIA ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '0.85rem',
                                    boxShadow: loadingIA ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {loadingIA
                                    ? <><div style={{ width: 15, height: 15, border: '2px solid #cbd5e1', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Consultando...</>
                                    : <><Sparkles style={{ width: 15, height: 15 }} /> Sugerir com IA</>
                                }
                            </button>

                            {/* VER JSON */}
                            <button
                                onClick={handleVerJson}
                                disabled={loadingCategorias || loadingJson}
                                title="Ver JSON que será enviado à IA"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                    padding: '0.7rem 0.9rem', borderRadius: 12,
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1.5px solid #e2e8f0',
                                    cursor: (loadingCategorias || loadingJson) ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '0.78rem',
                                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                                }}
                            >
                                {loadingJson
                                    ? <div style={{ width: 13, height: 13, border: '2px solid #cbd5e1', borderTopColor: '#475569', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    : <Code style={{ width: 14, height: 14 }} />
                                }
                                VER JSON
                            </button>
                        </div>

                        {/* Erro */}
                        {erro && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
                                padding: '0.65rem 1rem', marginBottom: '1rem',
                                fontSize: '0.82rem', color: '#dc2626',
                            }}>{erro}</div>
                        )}

                        {/* Categorias */}
                        {loadingCategorias ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                                <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '0.82rem' }}>Carregando categorias...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 340, overflowY: 'auto' }}>
                                {categorias.map(cat => {
                                    const isSelected = selecionadas.includes(cat.id)
                                    const isIA = iaRecomendou.includes(cat.id)
                                    const isDisabled = !isSelected && selecionadas.length >= 2
                                    return (
                                        <label
                                            key={cat.id}
                                            htmlFor={`cat-${cat.id}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 1rem', borderRadius: 12, cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                border: `1.5px solid ${isSelected ? '#2AB9C0' : '#e8edf5'}`,
                                                background: isSelected ? '#f0fdff' : '#fafbfd',
                                                opacity: isDisabled ? 0.5 : 1,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <input
                                                id={`cat-${cat.id}`}
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => toggleCategoria(cat.id)}
                                                style={{ width: 18, height: 18, accentColor: '#2AB9C0', cursor: isDisabled ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                                            />
                                            <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#09355F' : '#374151' }}>
                                                {cat.descricao}
                                            </span>
                                            {isIA && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                                                    background: '#f5f3ff', color: '#7c3aed', border: '1px solid #e0d7ff', flexShrink: 0,
                                                }}>
                                                    ✨ IA
                                                </span>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        )}

                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
                            {selecionadas.length}/2 categorias selecionadas
                        </p>

                        {/* Ações */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button onClick={onClose} style={{
                                flex: 1, padding: '0.7rem', borderRadius: 12,
                                background: '#f1f5f9', border: 'none', color: '#64748b',
                                fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                            }}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvar}
                                disabled={loadingSalvar || sucesso || selecionadas.length === 0}
                                style={{
                                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '0.7rem', borderRadius: 12, border: 'none',
                                    background: sucesso ? '#16a34a' : (selecionadas.length === 0 || loadingSalvar) ? '#94a3b8' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                                    color: '#fff', fontWeight: 800, cursor: selecionadas.length === 0 || loadingSalvar ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem', boxShadow: selecionadas.length > 0 && !loadingSalvar ? '0 4px 12px rgba(9,53,95,0.25)' : 'none',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {sucesso
                                    ? <><CheckCircle size={16} /> Salvo!</>
                                    : loadingSalvar
                                        ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Salvando...</>
                                        : `Salvar ${selecionadas.length > 0 ? `(${selecionadas.length})` : ''}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal JSON (overlay por cima) ── */}
            {jsonPayload && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 400,
                    background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
                    animation: 'fadeIn 0.18s ease',
                }}>
                    <div style={{
                        background: '#0f172a', borderRadius: 20, width: '100%', maxWidth: 680,
                        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.5)', overflow: 'hidden',
                        animation: 'fadeSlideUp 0.2s ease',
                    }}>
                        {/* Header JSON */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b',
                            background: '#1e293b', flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Code style={{ width: 16, height: 16, color: '#fff' }} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', fontFamily: 'monospace' }}>
                                        payload → classificarCandidatoComIA()
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b' }}>
                                        JSON enviado à OpenAI para sugestão de categorias
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {/* Copiar */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2))
                                        setJsonCopied(true)
                                        setTimeout(() => setJsonCopied(false), 2000)
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                        background: jsonCopied ? '#16a34a20' : '#ffffff0f',
                                        border: `1px solid ${jsonCopied ? '#16a34a60' : '#334155'}`,
                                        color: jsonCopied ? '#4ade80' : '#94a3b8',
                                        padding: '5px 10px', borderRadius: 8,
                                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {jsonCopied
                                        ? <><Check style={{ width: 12, height: 12 }} /> Copiado!</>
                                        : <><Copy style={{ width: 12, height: 12 }} /> Copiar</>
                                    }
                                </button>
                                {/* Fechar */}
                                <button
                                    onClick={() => setJsonPayload(null)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 32, height: 32, borderRadius: 8,
                                        background: '#ffffff0f', border: '1px solid #334155',
                                        color: '#94a3b8', cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                    title="Fechar"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Corpo JSON scrollável */}
                        <pre style={{
                            margin: 0, padding: '1.25rem',
                            fontSize: '0.72rem', color: '#e2e8f0',
                            fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                            overflowY: 'auto', overflowX: 'auto',
                            lineHeight: 1.65, flex: 1,
                        }}>
                            {JSON.stringify(jsonPayload, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </>
    )
}

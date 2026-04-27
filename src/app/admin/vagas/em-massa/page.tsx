'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
    UploadCloud, ArrowLeft, ImageIcon, CheckCircle2, XCircle, X,
    Loader2, AlertCircle, ExternalLink, RefreshCw, FileImage, Database
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { extrairDadosVagaDeImagem } from '@/actions/openai'
import { cadastrarVagaRascunho, listarVagasParaEmMassa, type VagaEmMassaItem } from '@/actions/vagas'
import { salvarImagemVaga, vincularImagemVaga } from '@/actions/vaga_imagens'

// ── Tipos ──────────────────────────────────────────────────────────────────

type StatusItem = 'aguardando' | 'enviando' | 'processando' | 'salvando' | 'concluido' | 'erro'

interface ImagemItem {
    id: string
    file: File
    preview: string
    status: StatusItem
    progresso: number // 0-100
    vagaId?: number
    erro?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function lerArquivoComoBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            resolve(result) // data:image/...;base64,...
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

function StatusBadge({ status }: { status: StatusItem }) {
    const map: Record<StatusItem, { label: string; bg: string; color: string }> = {
        aguardando: { label: 'Aguardando', bg: '#f1f5f9', color: '#64748b' },
        enviando: { label: 'Enviando...', bg: '#eff6ff', color: '#1d4ed8' },
        processando: { label: 'Processando IA', bg: '#fef3c7', color: '#b45309' },
        salvando: { label: 'Salvando...', bg: '#f0fdf4', color: '#15803d' },
        concluido: { label: 'Concluído ✓', bg: '#dcfce7', color: '#15803d' },
        erro: { label: 'Erro', bg: '#fee2e2', color: '#b91c1c' },
    }
    const s = map[status]
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem',
            fontWeight: 700, background: s.bg, color: s.color,
            whiteSpace: 'nowrap',
        }}>
            {s.label}
        </span>
    )
}

function ProgressBar({ value, status }: { value: number; status: StatusItem }) {
    const colorMap: Record<StatusItem, string> = {
        aguardando: '#e2e8f0',
        enviando: '#3b82f6',
        processando: '#f59e0b',
        salvando: '#10b981',
        concluido: '#22c55e',
        erro: '#ef4444',
    }
    const color = colorMap[status]
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
                width: '100%', height: 10, borderRadius: 9999,
                background: '#f1f5f9', overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', width: `${value}%`,
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    borderRadius: 9999,
                    transition: 'width 0.4s ease',
                }} />
            </div>
            <div style={{
                position: 'absolute', right: 0, top: -18,
                fontSize: '0.7rem', fontWeight: 700, color: color,
            }}>
                {value}%
            </div>
        </div>
    )
}

// ── Componente principal ───────────────────────────────────────────────────

export default function VagasEmMassaPage() {
    const [itens, setItens] = useState<ImagemItem[]>([])
    const [processando, setProcessando] = useState(false)
    const [concluidos, setConcluidos] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropRef = useRef<HTMLDivElement>(null)

    // ── Estado do DB lazy loading ──────────────────────────────────────────
    const [dbVagas, setDbVagas] = useState<VagaEmMassaItem[]>([])
    const [dbPage, setDbPage] = useState(1)
    const [dbTotal, setDbTotal] = useState(0)
    const [dbTemMais, setDbTemMais] = useState(false)
    const [dbCarregando, setDbCarregando] = useState(false)
    const [previewDbUrl, setPreviewDbUrl] = useState<string | null>(null)

    const carregarDbVagas = useCallback(async (pagina: number, append = false) => {
        setDbCarregando(true)
        const res = await listarVagasParaEmMassa(pagina, 30)
        setDbVagas(prev => append ? [...prev, ...res.vagas] : res.vagas)
        setDbTotal(res.total)
        setDbTemMais(res.temMais)
        setDbPage(pagina)
        setDbCarregando(false)
    }, [])

    useEffect(() => { carregarDbVagas(1) }, [])

    // Recarrega a lista do DB quando um item é concluído
    useEffect(() => {
        if (concluidos > 0) carregarDbVagas(1)
    }, [concluidos, carregarDbVagas])

    // ── Adicionar imagens ──────────────────────────────────────────────────

    function adicionarArquivos(files: FileList | File[]) {
        const novos: ImagemItem[] = []
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue
            novos.push({
                id: uid(),
                file,
                preview: URL.createObjectURL(file),
                status: 'aguardando',
                progresso: 0,
            })
        }
        setItens(prev => [...prev, ...novos])
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) adicionarArquivos(e.target.files)
        e.target.value = ''
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        if (e.dataTransfer.files) adicionarArquivos(e.dataTransfer.files)
    }

    function removerItem(id: string) {
        setItens(prev => prev.filter(i => i.id !== id))
    }

    // ── Atualizar item individualmente ─────────────────────────────────────

    const atualizarItem = useCallback((id: string, patch: Partial<ImagemItem>) => {
        setItens(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
    }, [])

    // ── Processar uma imagem ───────────────────────────────────────────────

    async function processarImagem(item: ImagemItem) {
        // Passo 1: Leitura e envio (0→40)
        atualizarItem(item.id, { status: 'enviando', progresso: 5 })

        let base64: string
        try {
            base64 = await lerArquivoComoBase64(item.file)
        } catch {
            atualizarItem(item.id, { status: 'erro', progresso: 0, erro: 'Falha ao ler o arquivo de imagem.' })
            return
        }

        atualizarItem(item.id, { progresso: 35 })

        // Passo 2: Chamada à IA (40→70)
        atualizarItem(item.id, { status: 'processando', progresso: 45 })

        const resultIA = await extrairDadosVagaDeImagem(base64)

        atualizarItem(item.id, { progresso: 70 })

        if (!resultIA.success) {
            atualizarItem(item.id, {
                status: 'erro',
                progresso: 70,
                erro: resultIA.error || 'Erro ao processar imagem na IA.',
            })
            return
        }

        // Passo 3: Salvar no banco (70→100)
        atualizarItem(item.id, { status: 'salvando', progresso: 80 })

        const dadosIA = resultIA.data as any

        const resultSalvar = await cadastrarVagaRascunho({
            titulo: dadosIA?.titulo,
            empresa: dadosIA?.empresa,
            descricao: dadosIA?.descricao,
            local: dadosIA?.local,
            modalidade: dadosIA?.modalidade,
            nivel: dadosIA?.nivel,
            tipo_contrato: dadosIA?.tipo_contrato,
            salario_min: dadosIA?.salario_min,
            salario_max: dadosIA?.salario_max,
            mostrar_salario: dadosIA?.mostrar_salario,
            salario_a_combinar: dadosIA?.salario_a_combinar ?? true,
            email_contato: dadosIA?.email_contato,
            telefone_contato: dadosIA?.telefone_contato,
            whatsapp_contato: dadosIA?.whatsapp_contato,
            link_externo: dadosIA?.link_externo,
            responsabilidades: Array.isArray(dadosIA?.responsabilidades) ? dadosIA.responsabilidades : [],
            requisitos: Array.isArray(dadosIA?.requisitos) ? dadosIA.requisitos : [],
            diferenciais: Array.isArray(dadosIA?.diferenciais) ? dadosIA.diferenciais : [],
            beneficios: Array.isArray(dadosIA?.beneficios) ? dadosIA.beneficios : [],
            tipo_pagamento: dadosIA?.tipo_pagamento,
        })

        if (!resultSalvar.success) {
            atualizarItem(item.id, {
                status: 'erro',
                progresso: 80,
                erro: resultSalvar.error || 'Erro ao salvar vaga no banco.',
            })
            return
        }

        // ── Passo 4: Salvar imagem no bucket e vincular (80→100)
        atualizarItem(item.id, { progresso: 90 })
        const resultUpload = await salvarImagemVaga(base64, item.file.name, resultSalvar.vagaId)

        if (!resultUpload.success) {
            console.error('Falha ao salvar imagem no bucket:', resultUpload.error)
            // Não falha a vaga, pois já foi salva, mas podemos registrar o erro ou logar
        }

        atualizarItem(item.id, {
            status: 'concluido',
            progresso: 100,
            vagaId: resultSalvar.vagaId,
        })
        setConcluidos(c => c + 1)
    }

    // ── Processar todas as pendentes/erro ──────────────────────────────────

    async function processarTodas(apenasErros = false) {
        if (processando) return
        const fila = itens.filter(i =>
            apenasErros ? i.status === 'erro' : i.status === 'aguardando' || i.status === 'erro'
        )
        if (fila.length === 0) return
        setProcessando(true)
        for (const item of fila) {
            await processarImagem(item)
        }
        setProcessando(false)
    }

    async function reprocessarItem(item: ImagemItem) {
        if (processando) return
        atualizarItem(item.id, { status: 'aguardando', progresso: 0, erro: undefined, vagaId: undefined })
        setProcessando(true)
        await processarImagem({ ...item, status: 'aguardando', progresso: 0, erro: undefined, vagaId: undefined })
        setProcessando(false)
    }

    // ── Estatísticas ───────────────────────────────────────────────────────

    const total = itens.length
    const totalErros = itens.filter(i => i.status === 'erro').length
    const totalAguardando = itens.filter(i => i.status === 'aguardando').length
    const totalProcessandoAtivo = itens.filter(i => ['enviando', 'processando', 'salvando'].includes(i.status)).length

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div>
            <style>{`
                @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:0.5} }
                @keyframes spin-smooth { to { transform: rotate(360deg) } }
                .upload-zone:hover { border-color: #FE8341 !important; background: #fff8f5 !important; }
                .btn-primary { transition: all 0.18s; }
                .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .item-row:hover { background: #fafcff !important; }
            `}</style>

            <AdminPageHeader
                titulo="Vagas em Massa"
                subtitulo="Carregue imagens de anúncios de vagas e a IA extrai e salva automaticamente em rascunho"
                acao={
                    <Link href="/admin/vagas" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.6rem 1.25rem', borderRadius: 10,
                        background: '#fff', border: '1.5px solid #e2e8f0',
                        color: '#09355F', fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none', transition: 'all 0.18s',
                    }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>
                }
            />

            {/* ── Stats bar ── */}
            {total > 0 && (
                <div style={{
                    display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap',
                }}>
                    {[
                        { label: 'Total', value: total, color: '#09355F', bg: '#eff6ff' },
                        { label: 'Concluídos', value: concluidos, color: '#15803d', bg: '#dcfce7' },
                        { label: 'Aguardando', value: totalAguardando, color: '#64748b', bg: '#f1f5f9' },
                        { label: 'Erros', value: totalErros, color: '#b91c1c', bg: '#fee2e2' },
                    ].map(s => (
                        <div key={s.label} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.45rem 1rem', borderRadius: 10,
                            background: s.bg, color: s.color, fontWeight: 700,
                            fontSize: '0.82rem', border: `1.5px solid ${s.color}22`,
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>{s.value}</span>
                            <span style={{ fontWeight: 500, opacity: 0.8 }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Upload Zone ── */}
            <div
                ref={dropRef}
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2.5px dashed #e2e8f0',
                    borderRadius: 16,
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    background: '#fff',
                    transition: 'all 0.18s',
                }}
            >
                <UploadCloud style={{ width: 40, height: 40, color: '#FE8341', margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 700, color: '#09355F', fontSize: '1rem', marginBottom: '0.3rem' }}>
                    Arraste as imagens aqui ou clique para selecionar
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Suporte a JPG, PNG, WebP · Múltiplas imagens de uma vez
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                />
            </div>

            {/* ── Action buttons ── */}
            {total > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn-primary"
                        onClick={() => processarTodas(false)}
                        disabled={processando || totalAguardando === 0}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.65rem 1.4rem', borderRadius: 10,
                            background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                            color: '#fff', fontSize: '0.84rem', fontWeight: 700, border: 'none',
                            cursor: processando || totalAguardando === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                        }}
                    >
                        {processando
                            ? <Loader2 style={{ width: 16, height: 16, animation: 'spin-smooth 1s linear infinite' }} />
                            : <UploadCloud style={{ width: 16, height: 16 }} />
                        }
                        {processando ? `Processando...` : `Iniciar Processamento (${totalAguardando})`}
                    </button>

                    {totalErros > 0 && !processando && (
                        <button
                            className="btn-primary"
                            onClick={() => processarTodas(true)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.65rem 1.4rem', borderRadius: 10,
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                color: '#fff', fontSize: '0.84rem', fontWeight: 700, border: 'none',
                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(185,28,28,0.2)',
                            }}
                        >
                            <RefreshCw style={{ width: 16, height: 16 }} />
                            Retentar Erros ({totalErros})
                        </button>
                    )}

                    <button
                        className="btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.65rem 1.4rem', borderRadius: 10,
                            background: '#fff', border: '1.5px solid #e2e8f0',
                            color: '#09355F', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        <FileImage style={{ width: 16, height: 16 }} />
                        Adicionar Mais Imagens
                    </button>
                </div>
            )}

            {/* ── Tabela de itens ── */}
            {total > 0 && (
                <div style={{
                    background: '#fff', borderRadius: 16,
                    border: '1.5px solid #e8edf5',
                    boxShadow: '0 2px 12px rgba(9,53,95,0.05)',
                    overflow: 'hidden',
                }}>
                    {/* Cabeçalho */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '64px 1fr 1fr 180px 80px',
                        gap: '1rem',
                        padding: '0.75rem 1.25rem',
                        background: '#f8fafc',
                        borderBottom: '1.5px solid #e8edf5',
                        fontSize: '0.72rem', fontWeight: 700,
                        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        <div>Imagem</div>
                        <div>Arquivo</div>
                        <div style={{ paddingLeft: 12 }}>Progresso</div>
                        <div>Status</div>
                        <div>Ação</div>
                    </div>

                    {/* Itens */}
                    {itens.map((item) => (
                        <div
                            key={item.id}
                            className="item-row"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '64px 1fr 1fr 180px 80px',
                                gap: '1rem',
                                padding: '0.9rem 1.25rem',
                                borderBottom: '1.5px solid #f1f5f9',
                                alignItems: 'center',
                                background: '#fff',
                                transition: 'background 0.15s',
                            }}
                        >
                            {/* Thumbnail */}
                            <div style={{
                                width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
                                background: '#f1f5f9', flexShrink: 0,
                                border: '1.5px solid #e2e8f0',
                                position: 'relative',
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.preview}
                                    alt={item.file.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {item.status === 'concluido' && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(21,128,61,0.7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CheckCircle2 style={{ width: 24, height: 24, color: '#fff' }} />
                                    </div>
                                )}
                                {item.status === 'erro' && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(185,28,28,0.7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <XCircle style={{ width: 24, height: 24, color: '#fff' }} />
                                    </div>
                                )}
                                {['enviando', 'processando', 'salvando'].includes(item.status) && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(9,53,95,0.55)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Loader2 style={{
                                            width: 22, height: 22, color: '#fff',
                                            animation: 'spin-smooth 1s linear infinite',
                                        }} />
                                    </div>
                                )}
                            </div>

                            {/* Nome do arquivo */}
                            <div>
                                <p style={{
                                    fontSize: '0.82rem', fontWeight: 600, color: '#09355F',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    maxWidth: 200,
                                }}>
                                    {item.file.name}
                                </p>
                                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                                    {(item.file.size / 1024).toFixed(0)} KB
                                </p>
                                {item.erro && (
                                    <p style={{
                                        fontSize: '0.7rem', color: '#b91c1c', marginTop: 4,
                                        display: 'flex', alignItems: 'flex-start', gap: 4,
                                    }}>
                                        <AlertCircle style={{ width: 11, height: 11, flexShrink: 0, marginTop: 1 }} />
                                        {item.erro}
                                    </p>
                                )}
                            </div>

                            {/* Barra de progresso */}
                            <div style={{ paddingLeft: 12, paddingRight: 12 }}>
                                <ProgressBar value={item.progresso} status={item.status} />
                            </div>

                            {/* Status badge */}
                            <div>
                                <StatusBadge status={item.status} />
                            </div>

                            {/* Ações */}
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {item.status === 'concluido' && item.vagaId && (
                                    <Link
                                        href={`/admin/vagas/editar/${item.vagaId}`}
                                        title="Editar vaga"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 30, height: 30, borderRadius: 8,
                                            background: '#eff6ff', border: '1.5px solid #bfdbfe',
                                            color: '#1d4ed8', textDecoration: 'none',
                                        }}
                                    >
                                        <ExternalLink style={{ width: 13, height: 13 }} />
                                    </Link>
                                )}
                                {item.status === 'erro' && (
                                    <button
                                        onClick={() => reprocessarItem(item)}
                                        disabled={processando}
                                        title="Tentar novamente"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                                            background: '#fff7ed', border: '1.5px solid #fed7aa',
                                            color: '#ea580c',
                                        }}
                                    >
                                        <RefreshCw style={{ width: 13, height: 13 }} />
                                    </button>
                                )}
                                {item.status === 'aguardando' && (
                                    <button
                                        onClick={() => removerItem(item.id)}
                                        title="Remover"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                                            background: '#fef2f2', border: '1.5px solid #fecaca',
                                            color: '#dc2626',
                                        }}
                                    >
                                        <XCircle style={{ width: 13, height: 13 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty state ── */}
            {total === 0 && (
                <div style={{
                    textAlign: 'center', padding: '3rem 1rem',
                    background: '#fff', borderRadius: 16,
                    border: '1.5px solid #e8edf5',
                }}>
                    <ImageIcon style={{ width: 48, height: 48, color: '#e2e8f0', margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 700, color: '#09355F', marginBottom: '0.4rem' }}>
                        Nenhuma imagem carregada
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        Use a área acima para carregar imagens de anúncios de vagas.
                        A IA irá extrair os dados automaticamente e salvar como rascunho.
                    </p>
                </div>
            )}

            {/* ── Instrução final ── */}
            {concluidos > 0 && (
                <div style={{
                    marginTop: '1.25rem', padding: '1rem 1.25rem',
                    background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
                    borderRadius: 12, border: '1.5px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: '#15803d', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontWeight: 700, color: '#09355F', fontSize: '0.88rem' }}>
                            {concluidos} vaga{concluidos !== 1 ? 's' : ''} salva{concluidos !== 1 ? 's' : ''} em rascunho!
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            Revise e publique abaixo ou em <Link href="/admin/vagas" style={{ color: '#1d4ed8', fontWeight: 600 }}>Vagas</Link>.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Seção DB: vagas do banco (lazy load) ── */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database style={{ width: 16, height: 16, color: '#09355F' }} />
                        <span style={{ fontWeight: 800, color: '#09355F', fontSize: '0.95rem' }}>
                            Vagas no Sistema
                        </span>
                        <span style={{
                            background: '#e8edf5', color: '#09355F', fontWeight: 700,
                            fontSize: '0.72rem', padding: '2px 8px', borderRadius: 9999,
                        }}>{dbTotal}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Ordenado: rascunho → publicadas · mais recentes primeiro
                    </span>
                </div>

                <div style={{
                    background: '#fff', borderRadius: 16,
                    border: '1.5px solid #e8edf5',
                    boxShadow: '0 2px 12px rgba(9,53,95,0.05)',
                    overflow: 'hidden',
                }}>
                    {/* Cabeçalho */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 140px 110px 110px 60px',
                        gap: '1rem', padding: '0.6rem 1.25rem',
                        background: '#f8fafc', borderBottom: '1.5px solid #e8edf5',
                        fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        <div>Vaga / Empresa</div>
                        <div>Modalidade</div>
                        <div>Nível</div>
                        <div>Status</div>
                        <div>Ação</div>
                    </div>

                    {dbCarregando && dbVagas.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            <Loader2 style={{ width: 20, height: 20, animation: 'spin-smooth 1s linear infinite', margin: '0 auto 0.5rem' }} />
                            Carregando vagas...
                        </div>
                    )}

                    {dbVagas.map((v, idx) => {
                        const statusColors: Record<string, { bg: string; color: string }> = {
                            ativa: { bg: '#dcfce7', color: '#15803d' },
                            rascunho: { bg: '#f1f5f9', color: '#64748b' },
                            pausada: { bg: '#fff3e0', color: '#e65100' },
                            expirada: { bg: '#ffebee', color: '#c62828' },
                        }
                        const sc = statusColors[v.status] || statusColors.rascunho
                        return (
                            <div key={v.id} className="item-row" style={{
                                display: 'grid', gridTemplateColumns: '1fr 140px 110px 110px 60px',
                                gap: '1rem', padding: '0.75rem 1.25rem',
                                borderBottom: idx < dbVagas.length - 1 ? '1px solid #f1f5f9' : 'none',
                                alignItems: 'center', background: '#fff', transition: 'background 0.15s',
                            }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    {/* Thumbnail se existir imagem */}
                                    {v.vaga_imagens && v.vaga_imagens.length > 0 ? (
                                        <div 
                                            onClick={() => setPreviewDbUrl(v.vaga_imagens![0].url_publica)}
                                            style={{ 
                                                width: 42, height: 42, borderRadius: 8, overflow: 'hidden', 
                                                flexShrink: 0, cursor: 'pointer', border: '1px solid #e2e8f0' 
                                            }}
                                        >
                                            <img 
                                                src={v.vaga_imagens[0].url_publica} 
                                                alt="Vaga" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            width: 42, height: 42, borderRadius: 8, background: '#f8fafc',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#cbd5e1', border: '1px solid #f1f5f9'
                                        }}>
                                            <FileImage style={{ width: 18, height: 18 }} />
                                        </div>
                                    )}
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09355F',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                                            {v.titulo}
                                        </p>
                                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>{v.empresa}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'capitalize' }}>
                                    {v.modalidade || '—'}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'capitalize' }}>
                                    {v.nivel || '—'}
                                </div>
                                <div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 9999,
                                        fontSize: '0.7rem', fontWeight: 700,
                                        background: sc.bg, color: sc.color,
                                    }}>{v.status}</span>
                                </div>
                                <div>
                                    <Link href={`/admin/vagas/editar/${v.id}`}
                                        title="Editar"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 30, height: 30, borderRadius: 8,
                                            background: '#eff6ff', border: '1.5px solid #bfdbfe',
                                            color: '#1d4ed8', textDecoration: 'none',
                                        }}
                                    >
                                        <ExternalLink style={{ width: 13, height: 13 }} />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}

                    {dbVagas.length === 0 && !dbCarregando && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Nenhuma vaga cadastrada ainda.
                        </div>
                    )}
                </div>

                {/* Botão carregar mais */}
                {dbTemMais && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            onClick={() => carregarDbVagas(dbPage + 1, true)}
                            disabled={dbCarregando}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.75rem', borderRadius: 10,
                                background: dbCarregando ? '#f1f5f9' : '#fff',
                                border: '1.5px solid #e2e8f0', color: '#09355F',
                                fontSize: '0.84rem', fontWeight: 700, cursor: dbCarregando ? 'not-allowed' : 'pointer',
                                transition: 'all 0.18s',
                            }}
                        >
                            {dbCarregando
                                ? <Loader2 style={{ width: 15, height: 15, animation: 'spin-smooth 1s linear infinite' }} />
                                : <Database style={{ width: 15, height: 15 }} />
                            }
                            {dbCarregando ? 'Carregando...' : `Carregar mais 30 vagas`}
                        </button>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                            Exibindo {dbVagas.length} de {dbTotal}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Preview da Imagem do DB */}
            {previewDbUrl && (
                <div 
                    onClick={() => setPreviewDbUrl(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(9, 53, 95, 0.9)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '2rem', cursor: 'zoom-out',
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img 
                            src={previewDbUrl} 
                            alt="Preview" 
                            style={{ 
                                maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                border: '4px solid #fff'
                            }} 
                        />
                        <button 
                            onClick={() => setPreviewDbUrl(null)}
                            style={{
                                position: 'absolute', top: -40, right: 0,
                                background: 'transparent', border: 'none', color: '#fff',
                                fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <X style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Fechar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

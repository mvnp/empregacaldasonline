'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react'

interface ImportarEstabelecimentosModalProps {
    onClose: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ResultadoImportacao {
    sucesso: boolean
    totalLinhas?: number
    totalInseridos?: number
    totalErros?: number
    erros?: string[]
    erro?: string
}

export default function ImportarEstabelecimentosModal({ onClose }: ImportarEstabelecimentosModalProps) {
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [limparAntes, setLimparAntes] = useState(false)
    const [status, setStatus] = useState<Status>('idle')
    const [resultado, setResultado] = useState<ResultadoImportacao | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (file: File | null) => {
        if (!file) return
        if (!file.name.endsWith('.csv')) {
            alert('Selecione um arquivo .csv')
            return
        }
        setArquivo(file)
        setResultado(null)
        setStatus('idle')
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        handleFileChange(file ?? null)
    }, [])

    const handleImportar = async () => {
        if (!arquivo) return
        setStatus('loading')
        setResultado(null)

        try {
            const formData = new FormData()
            formData.append('arquivo', arquivo)
            formData.append('limparAntes', String(limparAntes))

            const response = await fetch('/api/estabelecimentos/importar', {
                method: 'POST',
                body: formData,
            })

            const res: ResultadoImportacao = await response.json()
            setResultado(res)
            setStatus(res.sucesso ? 'success' : 'error')
        } catch (err: unknown) {
            setResultado({ sucesso: false, erro: err instanceof Error ? err.message : 'Erro desconhecido.' })
            setStatus('error')
        }
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                style={{ border: '1.5px solid #e8edf5' }}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #09355F 0%, #2AB9C0 100%)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Upload style={{ width: 18, height: 18, color: '#fff' }} />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                                Importar Estabelecimentos
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0 }}>
                                Arquivo CSV · Tabela _estabelecimentos
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                            cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        aria-label="Fechar modal"
                    >
                        <X style={{ width: 18, height: 18, color: '#fff' }} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Drop zone */}
                    <div
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragOver ? '#2AB9C0' : arquivo ? '#09355F' : '#d1dbe8'}`,
                            borderRadius: 14,
                            padding: '1.75rem 1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: dragOver ? '#f0fffe' : arquivo ? '#f5f8ff' : '#f8fafc',
                            transition: 'all 0.2s',
                            marginBottom: '1rem',
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />
                        {arquivo ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <FileText style={{ width: 22, height: 22, color: '#09355F' }} />
                                <span style={{ fontWeight: 600, color: '#09355F', fontSize: '0.9rem' }}>{arquivo.name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                        ) : (
                            <>
                                <Upload style={{ width: 28, height: 28, color: '#94a3b8', marginBottom: '0.5rem' }} />
                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                                    Arraste e solte o arquivo CSV aqui
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    ou clique para selecionar
                                </p>
                            </>
                        )}
                    </div>

                    {/* Opção limpar antes */}
                    <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', marginBottom: '1.25rem',
                        background: '#fef9ec', borderRadius: 10, padding: '0.75rem 1rem',
                        border: '1px solid #fde68a',
                    }}>
                        <input
                            type="checkbox"
                            checked={limparAntes}
                            onChange={(e) => setLimparAntes(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: '#FE8341', cursor: 'pointer' }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                            Limpar tabela antes de importar
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#b45309', marginLeft: 'auto' }}>
                            ⚠ Apaga registros existentes
                        </span>
                    </label>

                    {/* Info do formato esperado */}
                    <div style={{
                        background: '#f0f9ff', borderRadius: 10, padding: '0.75rem 1rem',
                        border: '1px solid #bae6fd', marginBottom: '1.25rem'
                    }}>
                        <p style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, margin: '0 0 0.25rem' }}>
                            📋 Formato esperado
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#0284c7', margin: 0, lineHeight: 1.5 }}>
                            Header com 30 colunas: cnpj_basico, cnpj_ordem, cnpj_dv, identificador_matriz_filial,
                            nome_fantasia, situacao_cadastral, ... (data-1773152782240.csv)
                        </p>
                    </div>

                    {/* Resultado */}
                    {resultado && (
                        <div style={{
                            borderRadius: 12, padding: '1rem',
                            background: resultado.sucesso ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${resultado.sucesso ? '#bbf7d0' : '#fecaca'}`,
                            marginBottom: '1.25rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: resultado.erros ? '0.5rem' : 0 }}>
                                {resultado.sucesso
                                    ? <CheckCircle style={{ width: 18, height: 18, color: '#16a34a', flexShrink: 0 }} />
                                    : <AlertCircle style={{ width: 18, height: 18, color: '#dc2626', flexShrink: 0 }} />
                                }
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: resultado.sucesso ? '#15803d' : '#dc2626' }}>
                                    {resultado.sucesso
                                        ? `✓ Importados ${resultado.totalInseridos?.toLocaleString('pt-BR')} registros${resultado.totalErros ? ` (${resultado.totalErros} com erro)` : ''}`
                                        : `Erro: ${resultado.erro}`
                                    }
                                </span>
                            </div>
                            {resultado.sucesso && resultado.totalLinhas && (
                                <p style={{ fontSize: '0.75rem', color: '#16a34a', margin: 0 }}>
                                    Total de linhas processadas: {resultado.totalLinhas.toLocaleString('pt-BR')}
                                </p>
                            )}
                            {resultado.erros && resultado.erros.length > 0 && (
                                <ul style={{ margin: '0.5rem 0 0', padding: '0 0 0 1rem', fontSize: '0.7rem', color: '#b91c1c' }}>
                                    {resultado.erros.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Ações */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: 12,
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                color: '#64748b', fontWeight: 600, fontSize: '0.85rem',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImportar}
                            disabled={!arquivo || status === 'loading'}
                            style={{
                                flex: 2, padding: '0.75rem', borderRadius: 12,
                                border: 'none',
                                background: !arquivo || status === 'loading'
                                    ? '#e2e8f0'
                                    : 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                color: !arquivo || status === 'loading' ? '#94a3b8' : '#fff',
                                fontWeight: 700, fontSize: '0.85rem',
                                cursor: !arquivo || status === 'loading' ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.15s',
                            }}
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload style={{ width: 16, height: 16 }} />
                                    Importar CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

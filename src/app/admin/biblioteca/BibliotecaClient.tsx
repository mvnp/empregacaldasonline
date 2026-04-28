'use client'

import { useState, useEffect, useRef } from 'react'
import { 
    Upload, Search, Copy, Check, Trash2, 
    Image as ImageIcon, FileText, Loader2, Plus, 
    Link as LinkIcon, ExternalLink, X
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { listarMedia, uploadMedia, removerMedia } from '@/actions/media'

interface MediaFile {
    id: number
    storage_path: string
    url_publica: string
    nome_original: string
    mime_type: string
    size_bytes: number
    created_at: string
}

export default function BibliotecaClient() {
    const [arquivos, setArquivos] = useState<MediaFile[]>([])
    const [carregando, setCarregando] = useState(true)
    const [subindo, setSubindo] = useState(false)
    const [busca, setBusca] = useState('')
    const [copiadoId, setCopiadoId] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ─── Carregar Mídia ─────────────────────────────────────────────
    useEffect(() => {
        carregar()
    }, [])

    async function carregar() {
        setCarregando(true)
        const res = await listarMedia()
        if (res.success) setArquivos(res.data)
        setCarregando(false)
    }

    // ─── Upload ──────────────────────────────────────────────────
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setSubindo(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            const res = await uploadMedia(base64, file.name, file.type)
            if (res.success) {
                await carregar()
            } else {
                alert('Erro no upload: ' + res.error)
            }
            setSubindo(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
        reader.readAsDataURL(file)
    }

    // ─── Ações ──────────────────────────────────────────────────
    async function copiarLink(url: string, id: number) {
        try {
            await navigator.clipboard.writeText(url)
            setCopiadoId(id)
            setTimeout(() => setCopiadoId(null), 2000)
        } catch (err) {
            alert('Erro ao copiar link')
        }
    }

    async function deletar(id: number) {
        if (!confirm('Tem certeza que deseja excluir permanentemente este arquivo?')) return
        const res = await removerMedia(id)
        if (res.success) {
            setArquivos(prev => prev.filter(a => a.id !== id))
        } else {
            alert('Erro ao deletar: ' + res.error)
        }
    }

    // ─── Filtro ─────────────────────────────────────────────────
    const filtrados = arquivos.filter(a => 
        a.nome_original.toLowerCase().includes(busca.toLowerCase())
    )

    // Helper formatar tamanho
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div>
            <AdminPageHeader 
                titulo="Biblioteca de Mídia" 
                subtitulo="Gerencie suas imagens e arquivos para uso em vagas e publicidades."
                acao={
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={subindo}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem', borderRadius: 10,
                            background: 'linear-gradient(135deg, #09355F, #0d4a82)',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                            border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(9,53,95,0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {subindo ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : <Upload style={{ width: 18, height: 18 }} />}
                        {subindo ? 'Enviando...' : 'Fazer Upload'}
                    </button>
                }
            />

            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
            />

            {/* Toolbar */}
            <div style={{ 
                background: '#fff', borderRadius: 12, padding: '0.75rem 1rem', 
                border: '1.5px solid #e8edf5', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar arquivos por nome..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        style={{ 
                            width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', 
                            border: '1px solid #e2e8f0', borderRadius: 8, 
                            fontSize: '0.875rem', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                    {filtrados.length} arquivos
                </div>
            </div>

            {carregando ? (
                <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                    <Loader2 className="animate-spin" style={{ width: 40, height: 40, color: '#09355F' }} />
                    <p>Carregando biblioteca...</p>
                </div>
            ) : filtrados.length === 0 ? (
                <div style={{ 
                    padding: '6rem 2rem', textAlign: 'center', background: '#fff', 
                    borderRadius: 16, border: '1.5px dashed #e2e8f0' 
                }}>
                    <ImageIcon style={{ width: 48, height: 48, color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#09355F', marginBottom: '0.5rem' }}>Nenhum arquivo encontrado</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Faça upload da sua primeira imagem clicando no botão acima.</p>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '1.25rem' 
                }}>
                    {filtrados.map((item) => (
                        <div 
                            key={item.id} 
                            style={{ 
                                background: '#fff', borderRadius: 14, 
                                border: '1.5px solid #e8edf5', overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}
                            className="media-card"
                        >
                            {/* Preview Area */}
                            <div style={{ 
                                height: 160, background: '#f8fafc', position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', borderBottom: '1px solid #eef2f6'
                            }}>
                                {item.mime_type.startsWith('image/') ? (
                                    <img 
                                        src={item.url_publica} 
                                        alt={item.nome_original}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <FileText style={{ width: 48, height: 48, color: '#cbd5e1' }} />
                                )}
                                
                                {/* Overlay Actions */}
                                <div className="card-actions" style={{
                                    position: 'absolute', inset: 0, background: 'rgba(9,53,95,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    opacity: 0, transition: 'opacity 0.2s'
                                }}>
                                    <a 
                                        href={item.url_publica} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title="Visualizar original"
                                        style={{ 
                                            width: 36, height: 36, borderRadius: 8, background: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#09355F', textDecoration: 'none'
                                        }}
                                    >
                                        <ExternalLink style={{ width: 18, height: 18 }} />
                                    </a>
                                    <button 
                                        onClick={() => deletar(item.id)}
                                        title="Excluir arquivo"
                                        style={{ 
                                            width: 36, height: 36, borderRadius: 8, background: '#fee2e2',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#ef4444', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 style={{ width: 18, height: 18 }} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div style={{ padding: '0.85rem' }}>
                                <h4 style={{ 
                                    fontSize: '0.8rem', fontWeight: 600, color: '#09355F',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    marginBottom: '0.25rem'
                                }} title={item.nome_original}>
                                    {item.nome_original}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {formatSize(item.size_bytes)}
                                    </span>
                                    <button 
                                        onClick={() => copiarLink(item.url_publica, item.id)}
                                        style={{
                                            padding: '0.35rem 0.6rem', borderRadius: 6,
                                            background: copiadoId === item.id ? '#ecfdf5' : '#f8fafc',
                                            border: '1px solid',
                                            borderColor: copiadoId === item.id ? '#10b981' : '#e2e8f0',
                                            color: copiadoId === item.id ? '#059669' : '#64748b',
                                            fontSize: '0.7rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {copiadoId === item.id ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                                        {copiadoId === item.id ? 'Copiado!' : 'Copiar Link'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User, Shield, Briefcase, Mail, Trash2, Key, Filter, CheckCircle, Slash, MessageCircle, FileText, Upload, X, AlertCircle, Loader2, ExternalLink, FileScan, Edit2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import FilterSelect from '@/components/admin/FilterSelect'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import { atualizarStatusUsuario, atualizarTipoUsuario, excluirUsuario, atualizarSenhaUsuario } from '@/actions/admin_users'
import { buscarDocumentoPDFDoUsuario, uploadCurriculoPDFExistente } from '@/actions/candidatos'
import { iniciarImpersonacao } from '@/actions/auth'
import type { User as UserType } from '@/types/user'

const POR_PAGINA = 18

export default function AdminUsuariosClient({ usuarios }: { usuarios: UserType[] }) {
    const [lista, setLista] = useState(usuarios)
    const [busca, setBusca] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const savedBusca = localStorage.getItem('usuarios_busca')
        const savedTipo = localStorage.getItem('usuarios_filtroTipo')
        const savedStatus = localStorage.getItem('usuarios_filtroStatus')
        if (savedBusca) setBusca(savedBusca)
        if (savedTipo) setFiltroTipo(savedTipo)
        if (savedStatus) setFiltroStatus(savedStatus)
    }, [])

    useEffect(() => {
        if (!isMounted) return
        if (busca) localStorage.setItem('usuarios_busca', busca)
        else localStorage.removeItem('usuarios_busca')
        
        if (filtroTipo) localStorage.setItem('usuarios_filtroTipo', filtroTipo)
        else localStorage.removeItem('usuarios_filtroTipo')
        
        if (filtroStatus) localStorage.setItem('usuarios_filtroStatus', filtroStatus)
        else localStorage.removeItem('usuarios_filtroStatus')
    }, [busca, filtroTipo, filtroStatus, isMounted])

    const [modalSenha, setModalSenha] = useState<number | null>(null)
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmaSenha, setConfirmaSenha] = useState('')
    const [senhaLoading, setSenhaLoading] = useState(false)

    // PDF states
    const [pdfCache, setPdfCache] = useState<Record<number, { url: string } | null | 'loading'>>({})
    const [modalPdfUpload, setModalPdfUpload] = useState<{ userId: number, nome: string } | null>(null)
    const [pdfUploadFile, setPdfUploadFile] = useState<File | null>(null)
    const [pdfUploadLoading, setPdfUploadLoading] = useState(false)
    const [pdfUploadErro, setPdfUploadErro] = useState('')
    const pdfInputRef = useRef<HTMLInputElement | null>(null)

    const filtrados = useMemo(() => {
        return lista.filter(u => {
            const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
            if (busca && !matchBusca) return false
            if (filtroTipo && u.tipo !== filtroTipo) return false
            if (filtroStatus && u.status !== filtroStatus) return false
            return true
        })
    }, [lista, busca, filtroTipo, filtroStatus])

    const visiveis = filtrados.slice(0, exibidos)

    async function handleToggleStatus(user: UserType) {
        const novoStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo'
        setLista(prev => prev.map(u => u.id === user.id ? { ...u, status: novoStatus } : u))
        const res = await atualizarStatusUsuario(user.id, novoStatus)
        if (!res.success) {
            alert('Erro: ' + res.error)
            setLista(prev => prev.map(u => u.id === user.id ? { ...u, status: user.status } : u))
        }
    }

    async function handleExcluir(id: number) {
        if (!window.confirm('Excluir este usuário permanentemente? Isso removerá o acesso dele e apaga na auth.')) return
        setLista(prev => prev.filter(u => u.id !== id))
        const res = await excluirUsuario(id)
        if (!res.success) {
            alert('Erro: ' + res.error)
            window.location.reload()
        }
    }
    
    async function handleSwitchAccount(id: number, tipo: string) {
        const res = await iniciarImpersonacao(id)
        if (res.success) {
            if (tipo === 'candidato') window.location.href = '/admin/candidato'
            else if (tipo === 'empregador') window.location.href = '/admin/empregador'
            else window.location.href = '/admin'
        } else {
            alert('Erro: ' + res.error)
        }
    }

    async function handleMudarPermissao(id: number, novoTipo: 'admin' | 'empregador' | 'candidato') {
        const c = window.confirm(`Deseja alterar a permissão deste usuário para ${novoTipo.toUpperCase()}?`)
        if(!c) return;
        
        const old = lista.find(u => u.id === id)?.tipo
        setLista(prev => prev.map(u => u.id === id ? { ...u, tipo: novoTipo } : u))
        
        const res = await atualizarTipoUsuario(id, novoTipo)
        if (!res.success && old) {
            alert('Erro: ' + res.error)
            setLista(prev => prev.map(u => u.id === id ? { ...u, tipo: old } : u))
        }
    }

    async function handleSalvarSenha(e: React.FormEvent) {
        e.preventDefault()
        if (novaSenha !== confirmaSenha) {
            alert('Senhas não conferem!')
            return
        }
        if (novaSenha.length < 6) {
            alert('Senha muito curta.')
            return
        }
        if (!modalSenha) return
        
        setSenhaLoading(true)
        const res = await atualizarSenhaUsuario(modalSenha, novaSenha)
        setSenhaLoading(false)
        if (res.success) {
            alert('Senha atualizada com sucesso.')
            setModalSenha(null)
            setNovaSenha('')
            setConfirmaSenha('')
        } else {
            alert('Erro ao atualizar senha: ' + res.error)
        }
    }

    async function handlePdfBotao(userId: number, nome: string) {
        // Verificar cache
        if (pdfCache[userId] === 'loading') return
        
        if (pdfCache[userId] === undefined) {
            setPdfCache(prev => ({ ...prev, [userId]: 'loading' }))
            const result = await buscarDocumentoPDFDoUsuario(userId)
            setPdfCache(prev => ({ ...prev, [userId]: result ? { url: result.url } : null }))
            
            if (result) {
                window.open(result.url, '_blank')
            } else {
                setModalPdfUpload({ userId, nome })
            }
        } else if (pdfCache[userId] === null) {
            setModalPdfUpload({ userId, nome })
        } else if (pdfCache[userId] && (pdfCache[userId] as any).url) {
            window.open((pdfCache[userId] as any).url, '_blank')
        }
    }

    async function handleUploadPdf() {
        if (!pdfUploadFile || !modalPdfUpload) return
        setPdfUploadErro('')
        setPdfUploadLoading(true)

        try {
            const reader = new FileReader()
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1]
                const res = await uploadCurriculoPDFExistente(modalPdfUpload.userId, base64, pdfUploadFile.name)
                setPdfUploadLoading(false)
                if (res.success) {
                    setPdfCache(prev => ({ ...prev, [modalPdfUpload.userId]: { url: (res as any).url || '' } }))
                    setModalPdfUpload(null)
                    setPdfUploadFile(null)
                    alert('Currículo PDF enviado com sucesso!')
                } else {
                    setPdfUploadErro((res as any).error || 'Erro ao enviar PDF.')
                }
            }
            reader.onerror = () => {
                setPdfUploadLoading(false)
                setPdfUploadErro('Erro ao ler o arquivo.')
            }
            reader.readAsDataURL(pdfUploadFile)
        } catch (e: any) {
            setPdfUploadLoading(false)
            setPdfUploadErro(e.message || 'Erro inesperado.')
        }
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Gestão de Usuários"
                subtitulo={`${filtrados.length} usuários cadastrados`}
                acao={
                    <Link
                        href="/admin/candidatos/cadastrar/ia/curriculo-pdf"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem', borderRadius: 10,
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        }}
                    >
                        <FileScan size={16} />
                        Preencher CV com IA
                    </Link>
                }
            />

            <AdminFilterBar 
                onBuscar={() => setExibidos(POR_PAGINA)}
                temFiltroAtivo={!!(busca || filtroTipo || filtroStatus)}
                onLimpar={() => {
                    setBusca('')
                    setFiltroTipo('')
                    setFiltroStatus('')
                    setExibidos(POR_PAGINA)
                }}
            >
                <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail..." />
                <FilterSelect
                    icon={Shield} value={filtroTipo}
                    onChange={v => { setFiltroTipo(v); setExibidos(POR_PAGINA) }}
                    placeholder="Permissão"
                    opcoes={[
                        { value: 'admin', label: 'Admin' },
                        { value: 'empregador', label: 'Empregador' },
                        { value: 'candidato', label: 'Candidato' }
                    ]}
                />
                <FilterSelect
                    icon={Filter} value={filtroStatus}
                    onChange={v => { setFiltroStatus(v); setExibidos(POR_PAGINA) }}
                    placeholder="Status"
                    opcoes={[
                        { value: 'ativo', label: 'Ativo' },
                        { value: 'bloqueado', label: 'Bloqueado' }
                    ]}
                />
            </AdminFilterBar>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {visiveis.map(u => (
                    <div key={u.id} style={{
                        background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem',
                        border: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: u.tipo === 'admin' ? '#fef2f2' : (u.tipo === 'empregador' ? '#e0f2fe' : '#f0fdf4'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: u.tipo === 'admin' ? '#ef4444' : (u.tipo === 'empregador' ? '#0ea5e9' : '#22c55e')
                        }}>
                            {u.tipo === 'admin' ? <Shield size={20} /> : (u.tipo === 'empregador' ? <Briefcase size={20} /> : <User size={20} />)}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09355F', margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span>
                                {u.tipo === 'empregador' && (u as any).empresas && (u as any).empresas.length > 0 
                                    ? (u as any).empresas[0].nome_fantasia || (u as any).empresas[0].razao_social || `${u.nome} ${u.sobrenome}`
                                    : `${u.nome} ${u.sobrenome}`
                                }
                                </span>
                                {u.tipo === 'empregador' && (u as any).empresas && (u as any).empresas.length > 0 && <span style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 400}}>(Empresa Vinculada)</span>}

                                {(u.tipo === 'candidato' || u.tipo === 'empregador') && ((): any => {
                                    const cand = (u as any)._candidato;
                                    const emp = (u as any).empresas?.[0];
                                    
                                    const whatsapp = cand?.whatsapp || emp?.whatsapp;
                                    const telefone = cand?.telefone || emp?.telefone || u.telefone;
                                    
                                    const numFinal = whatsapp || telefone;
                                    const clearNum = numFinal ? numFinal.replace(/\D/g, '') : '';
                                    
                                    if(!clearNum) return null;

                                    const temWhatsApp = !!whatsapp;

                                    return (
                                        <a href={`https://wa.me/55${clearNum}`} target="_blank" rel="noopener noreferrer" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '2px 8px', borderRadius: 8, 
                                            background: temWhatsApp ? '#dcfce7' : '#fef3c7', 
                                            color: temWhatsApp ? '#16a34a' : '#d97706',
                                            fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', 
                                            border: `1px solid ${temWhatsApp ? '#bbf7d0' : '#fde68a'}`
                                        }}>
                                            <MessageCircle size={12} /> Chat
                                        </a>
                                    )
                                })()}

                                {u.tipo === 'candidato' && (() => {
                                    const isLoading = pdfCache[u.id] === 'loading'
                                    const temPdf = pdfCache[u.id] !== null && pdfCache[u.id] !== undefined && pdfCache[u.id] !== 'loading'
                                    const cand = (u as any)._candidato
                                    const shareToken = cand?.share_token
                                    const temPdfNoBanco = cand?.candidato_documentos?.some((d: any) => 
                                        d.tipo?.toLowerCase() === 'pdf' && 
                                        (d.titulo === 'Currículo (PDF)' || d.titulo === 'Curriculo (PDF)')
                                    )
                                    return (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => handlePdfBotao(u.id, `${u.nome} ${u.sobrenome}`)}
                                                title={temPdf || temPdfNoBanco ? 'Baixar currículo PDF' : 'Upload de currículo PDF'}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '2px 8px', borderRadius: 8,
                                                    background: temPdfNoBanco ? '#dc2626' : (temPdf ? '#eff6ff' : '#f8fafc'),
                                                    color: temPdfNoBanco ? '#fff' : (temPdf ? '#2563eb' : '#94a3b8'),
                                                    fontSize: '0.7rem', fontWeight: 700, 
                                                    border: `1px solid ${temPdfNoBanco ? '#b91c1c' : (temPdf ? '#bfdbfe' : '#e2e8f0')}`,
                                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : (temPdf || temPdfNoBanco ? <FileText size={12} /> : <Upload size={12} />)}
                                                PDF
                                            </button>
                                            
                                            <a
                                                href={shareToken ? `/publico/candidato/ver-curriculo/${shareToken}` : '#'}
                                                target={shareToken ? "_blank" : "_self"}
                                                rel={shareToken ? "noopener noreferrer" : undefined}
                                                title={shareToken ? "Visualizar CV Público" : "O candidato não possui Currículo Web visível"}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '2px 8px', borderRadius: 8,
                                                    background: shareToken ? '#f8fafc' : '#f1f5f9',
                                                    color: shareToken ? '#64748b' : '#cbd5e1',
                                                    fontSize: '0.7rem', fontWeight: 700, 
                                                    border: `1px solid ${shareToken ? '#e2e8f0' : '#f1f5f9'}`,
                                                    textDecoration: 'none',
                                                    cursor: shareToken ? 'pointer' : 'not-allowed',
                                                    pointerEvents: shareToken ? 'auto' : 'none'
                                                }}
                                                onClick={e => { if(!shareToken) e.preventDefault() }}
                                            >
                                                <ExternalLink size={12} /> CV
                                            </a>
                                        </div>
                                    )
                                })()}
                            </h3>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                                <Mail size={14} /> {u.email}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select 
                                value={u.tipo} 
                                onChange={e => handleMudarPermissao(u.id, e.target.value as any)}
                                style={{
                                    padding: '0.3rem 0.6rem', borderRadius: 8, border: '1px solid #e8edf5',
                                    fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: '#f8fafc',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="admin">Admin</option>
                                <option value="empregador">Empregador</option>
                                <option value="candidato">Candidato</option>
                            </select>

                            <button onClick={() => handleToggleStatus(u)} style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.35rem 0.6rem', borderRadius: 8, border: 'none',
                                background: u.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                                color: u.status === 'ativo' ? '#16a34a' : '#ef4444',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                            }}>
                                {u.status === 'ativo' ? <><CheckCircle size={14} /> Ativo</> : <><Slash size={14} /> Bloqueado</>}
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            {u.tipo === 'candidato' && (u as any)._candidato?.id && (
                                <Link href={`/admin/candidatos/cadastrar/ia/curriculo-pdf/edit/${(u as any)._candidato.id}`} style={{
                                    background: '#fefce8', border: '1.5px solid #fef08a', borderRadius: 8,
                                    padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                    color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none'
                                }}>
                                    <Edit2 size={14} /> Edit
                                </Link>
                            )}
                            <button onClick={() => setModalSenha(u.id)} style={{
                                background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: 8,
                                padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}>
                                <Key size={14} /> Senha
                            </button>
                            
                            <button onClick={() => handleSwitchAccount(u.id, u.tipo)} style={{
                                background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
                                padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none'
                            }}>
                                <User size={14} /> Switch Account
                            </button>
                            
                            <button onClick={() => handleExcluir(u.id)} style={{
                                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                                padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}>
                                <Trash2 size={14} /> Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <LoadMoreButton
                totalFiltrado={filtrados.length}
                exibidos={exibidos}
                carregando={false}
                onCarregarMais={() => setExibidos(e => e + POR_PAGINA)}
                entidade="usuários"
            />

            {/* Modal Senha */}
            {modalSenha && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 1rem', color: '#09355F' }}>Alterar Senha do Usuário</h3>
                        <form onSubmit={handleSalvarSenha}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nova Senha</label>
                                <input 
                                    type="password" required minLength={6} 
                                    value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Confirmar Senha</label>
                                <input 
                                    type="password" required minLength={6} 
                                    value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setModalSenha(null)} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={senhaLoading} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: '#09355F', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    {senhaLoading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload PDF */}
            {modalPdfUpload && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '0', width: '100%', maxWidth: 480, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                            <h3 style={{ margin: 0, color: '#09355F', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Upload size={18} style={{ color: '#2563eb' }} />
                                Upload de Currículo PDF
                            </h3>
                            <button onClick={() => { setModalPdfUpload(null); setPdfUploadFile(null); setPdfUploadErro('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={22} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                Envie o PDF do currículo para <strong>{modalPdfUpload.nome}</strong>
                            </p>
                            {pdfUploadErro && (
                                <div style={{ padding: '0.6rem 0.85rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.82rem', marginBottom: '0.75rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <AlertCircle size={13} />{pdfUploadErro}
                                </div>
                            )}
                            <div
                                onClick={() => pdfInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${pdfUploadFile ? '#22c55e' : '#cbd5e1'}`,
                                    borderRadius: 12, padding: '1.75rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                                    background: pdfUploadFile ? '#f0fdf4' : '#f8fafc',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    ref={pdfInputRef}
                                    type="file" accept="application/pdf" style={{ display: 'none' }}
                                    onChange={e => { const f = e.target.files?.[0]; if (f) { if (f.type !== 'application/pdf') { setPdfUploadErro('Apenas PDFs.'); return } setPdfUploadErro(''); setPdfUploadFile(f) } }}
                                />
                                {pdfUploadFile ? (
                                    <>
                                        <FileText size={28} style={{ color: '#16a34a' }} />
                                        <p style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.875rem', textAlign: 'center' }}>{pdfUploadFile.name}</p>
                                        <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Clique para trocar</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={28} style={{ color: '#94a3b8' }} />
                                        <p style={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>Clique para selecionar o PDF</p>
                                        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Máximo 10 MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e8edf5', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" onClick={() => { setModalPdfUpload(null); setPdfUploadFile(null); setPdfUploadErro('') }} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Cancelar</button>
                            <button
                                type="button"
                                disabled={!pdfUploadFile || pdfUploadLoading}
                                onClick={handleUploadPdf}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: 8, background: (!pdfUploadFile || pdfUploadLoading) ? '#94a3b8' : '#09355F', color: '#fff', border: 'none', cursor: (!pdfUploadFile || pdfUploadLoading) ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                {pdfUploadLoading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</> : <><Upload size={13} /> Enviar PDF</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS para spinner */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

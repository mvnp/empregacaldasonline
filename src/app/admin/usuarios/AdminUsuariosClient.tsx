'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { User, Shield, Briefcase, Mail, Trash2, Key, Filter, CheckCircle, Slash, MessageCircle, RefreshCw } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import FilterSelect from '@/components/admin/FilterSelect'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import { atualizarStatusUsuario, atualizarTipoUsuario, excluirUsuario, atualizarSenhaUsuario, sincronizarCandidatosOrfaos } from '@/actions/admin_users'
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

    const [sincLoading, setSincLoading] = useState(false)
    async function handleSincronizar() {
        if (!window.confirm('Isso vai criar perfis na tabela candidatos para todos os usuários que ainda não têm. Continuar?')) return
        setSincLoading(true)
        const res = await sincronizarCandidatosOrfaos()
        setSincLoading(false)
        if (res.success) {
            if (res.criados === 0) alert((res as any).mensagem || 'Nenhum orfão encontrado!')
            else alert(`✅ ${res.criados} perfil(is) criado(s) na tabela candidatos com sucesso!`)
            window.location.reload()
        } else {
            alert('Erro: ' + res.error)
        }
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Gestão de Usuários"
                subtitulo={`${filtrados.length} usuários cadastrados`}
                acao={
                    <button
                        onClick={handleSincronizar}
                        disabled={sincLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 1rem', borderRadius: 10,
                            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                            color: '#16a34a', fontSize: '0.8rem', fontWeight: 700,
                            cursor: sincLoading ? 'not-allowed' : 'pointer', opacity: sincLoading ? 0.7 : 1
                        }}
                        title="Criar perfis na tabela candidatos para usuários que ainda não têm"
                    >
                        <RefreshCw size={14} style={{ animation: sincLoading ? 'spin 1s linear infinite' : 'none' }} />
                        {sincLoading ? 'Sincronizando...' : 'Sincronizar Candidatos'}
                    </button>
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

                                {u.tipo === 'candidato' && ((): any => {
                                    const cand = (u as any)._candidato;
                                    const rawVal = cand?.whatsapp || cand?.telefone;
                                    const clearNum = rawVal ? rawVal.replace(/\D/g, '') : '';
                                    if(clearNum) {
                                        return (
                                            <a href={`https://wa.me/55${clearNum}`} target="_blank" rel="noopener noreferrer" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                padding: '2px 8px', borderRadius: 8, background: '#dcfce7', color: '#16a34a',
                                                fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', border: '1px solid #bbf7d0'
                                            }}>
                                                <MessageCircle size={12} /> Chat
                                            </a>
                                        )
                                    }
                                    return null;
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
        </div>
    )
}

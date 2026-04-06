'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, User, Building2, Briefcase } from 'lucide-react'
import { atualizarDadosUsuario, getPerfilCompleto } from '@/actions/admin_users'
import type { User as UserType } from '@/types/user'

export default function AdminEditarUserClient({ user }: { user: UserType }) {
    const [loading, setLoading] = useState(false)
    const [perfil, setPerfil] = useState<any>(null)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')

    // Form Geral (Tabela Users)
    const [form, setForm] = useState({
        nome: user.nome || '',
        sobrenome: user.sobrenome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        razao_social: user.razao_social || '',
        cnpj: user.cnpj || '',
        setor: user.setor || '',
        tamanho_empresa: user.tamanho_empresa || '',
        responsavel_rh: user.responsavel_rh || ''
    })

    useEffect(() => {
        getPerfilCompleto(user.id).then(res => setPerfil(res))
    }, [user.id])

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setErro('')
        setSucesso('')

        const res = await atualizarDadosUsuario(user.id, form)
        
        setLoading(false)
        if (res.success) {
            setSucesso('Usuário atualizado com sucesso!')
            setTimeout(() => setSucesso(''), 3000)
        } else {
            setErro(res.error || 'Erro ao atualizar.')
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10,
        border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#09355F',
        background: '#f8fafc', outline: 'none', transition: 'border-color 0.18s',
    }
    const labelStyle: React.CSSProperties = {
        fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem', display: 'block',
    }
    const sectionTitle: React.CSSProperties = {
        fontSize: '1rem', fontWeight: 800, color: '#09355F', marginBottom: '1rem',
        paddingBottom: '0.5rem', borderBottom: '2px solid #e8edf5',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
    }
    const cardStyle: React.CSSProperties = {
        background: '#fff', borderRadius: 16, padding: '1.5rem',
        border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(9,53,95,0.04)',
        marginBottom: '1.25rem',
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Link href="/admin/usuarios" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                    color: '#64748b', textDecoration: 'none',
                }}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', margin: 0 }}>Editar Usuário</h1>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Gerencie os dados deste {user.tipo}</p>
                </div>
            </div>

            {erro && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '0.85rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#dc2626', fontWeight: 500 }}>{erro}</div>}
            {sucesso && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '0.85rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>{sucesso}</div>}

            <form onSubmit={handleSalvar}>
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><User style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Dados Base (Tabela Users)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Nome</label>
                            <input style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Sobrenome</label>
                            <input style={inputStyle} value={form.sobrenome} onChange={e => setForm(f => ({ ...f, sobrenome: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>E-mail</label>
                            <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone</label>
                            <input style={inputStyle} value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                        </div>
                    </div>
                </div>

                {user.tipo === 'empregador' && (
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Building2 style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Dados de Empregador</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Razão Social</label>
                                <input style={inputStyle} value={form.razao_social} onChange={e => setForm(f => ({ ...f, razao_social: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>CNPJ</label>
                                <input style={inputStyle} value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Responsável RH</label>
                                <input style={inputStyle} value={form.responsavel_rh} onChange={e => setForm(f => ({ ...f, responsavel_rh: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Tamanho da Empresa (Funcionários)</label>
                                <input style={inputStyle} value={form.tamanho_empresa} onChange={e => setForm(f => ({ ...f, tamanho_empresa: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                )}
                
                {user.tipo === 'candidato' && perfil?.candidato_perfil && (
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Informações Adicionais do Candidato</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                            Para editar detalhes como currículo, experiências e documentação específica do candidato, 
                            acesse a listagem oficial de Candidatos ou utilize o portal dele. Este módulo base controla
                            apenas a raiz da autenticação e dados de contato fundamentais.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/admin/candidatos" style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#475569', textDecoration: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>Ver listagem de Candidatos</Link>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" disabled={loading} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.75rem', borderRadius: 10,
                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                        color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                    }}>
                        {loading ? 'Salvando...' : <><Save size={16} /> Salvar Alterações Gerais</>}
                    </button>
                </div>
            </form>
        </div>
    )
}

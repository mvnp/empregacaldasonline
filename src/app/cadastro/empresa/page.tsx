'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'

const SETORES = ['Tecnologia', 'Saúde', 'Educação', 'Varejo', 'Indústria', 'Financeiro', 'Logística', 'Construção', 'Agronegócio', 'Outro']
const TAMANHOS = ['1–10 funcionários', '11–50 funcionários', '51–200 funcionários', '201–500 funcionários', '500+ funcionários']

export default function CadastroEmpresaPage() {
    const [form, setForm] = useState({
        razaoSocial: '', cnpj: '', email: '', telefone: '',
        setor: '', tamanho: '', responsavel: '',
        senha: '', confirmarSenha: '',
    })
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
    const [aceito, setAceito] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    function set(campo: string, valor: string) {
        setForm(f => ({ ...f, [campo]: valor }))
    }

    // Máscara CNPJ simples
    function handleCNPJ(v: string) {
        const nums = v.replace(/\D/g, '').slice(0, 14)
        let masked = nums
        if (nums.length > 12) masked = `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`
        else if (nums.length > 8) masked = `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`
        else if (nums.length > 5) masked = `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`
        else if (nums.length > 2) masked = `${nums.slice(0, 2)}.${nums.slice(2)}`
        set('cnpj', masked)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')
        if (!form.razaoSocial || !form.email || !form.senha) { setErro('Preencha todos os campos obrigatórios.'); return }
        if (form.senha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return }
        if (form.senha !== form.confirmarSenha) { setErro('As senhas não coincidem.'); return }
        if (!aceito) { setErro('Você precisa aceitar os Termos de Uso.'); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 1500))
        setLoading(false)
        setSucesso(true)
    }

    if (sucesso) {
        return (
            <div className="auth-layout">
                <div className="auth-panel-left"><AuthPanel variant="empresa" /></div>
                <div className="auth-right">
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                        <div style={{ width: 68, height: 68, background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <CheckCircle2 style={{ width: 34, height: 34, color: '#FE8341' }} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', marginBottom: '0.5rem' }}>Empresa cadastrada!</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                            Bem-vindo, <strong style={{ color: '#09355F' }}>{form.razaoSocial}</strong>! Sua conta foi criada. Agora publique suas primeiras vagas e comece a contratar.
                        </p>
                        <Link href="/publicar-vaga" className="auth-submit" style={{ textDecoration: 'none', display: 'inline-flex', background: 'linear-gradient(135deg, #FE8341, #e06b2a)' }}>
                            Publicar primeira vaga →
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-layout">

            {/* ── Esquerda ── */}
            <div className="auth-panel-left">
                <AuthPanel variant="empresa" />
            </div>

            {/* ── Direita ── */}
            <div className="auth-right" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
                <div className="auth-card" style={{ maxWidth: 520, margin: '0 auto' }}>

                    {/* Voltar */}
                    <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(254,131,65,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 style={{ width: 22, height: 22, color: '#FE8341' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#09355F', lineHeight: 1.2 }}>Cadastro de empresa</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Comece a contratar gratuitamente</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Razão social */}
                        <div>
                            <label className="auth-label" htmlFor="razao">Razão Social *</label>
                            <input id="razao" type="text" className="auth-input" placeholder="Empresa Ltda." value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} />
                        </div>

                        {/* CNPJ + Telefone */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="cnpj">CNPJ</label>
                                <input id="cnpj" type="text" className="auth-input" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => handleCNPJ(e.target.value)} />
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="tel-emp">Telefone</label>
                                <input id="tel-emp" type="tel" className="auth-input" placeholder="(11) 3333-4444" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
                            </div>
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="auth-label" htmlFor="email-emp">E-mail corporativo *</label>
                            <input id="email-emp" type="email" className="auth-input" placeholder="rh@empresa.com.br" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>

                        {/* Setor + Tamanho */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="setor">Setor de atuação</label>
                                <select id="setor" className="auth-input" value={form.setor} onChange={e => set('setor', e.target.value)} style={{ cursor: 'pointer' }}>
                                    <option value="">Selecione...</option>
                                    {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="tamanho">Tamanho da empresa</label>
                                <select id="tamanho" className="auth-input" value={form.tamanho} onChange={e => set('tamanho', e.target.value)} style={{ cursor: 'pointer' }}>
                                    <option value="">Selecione...</option>
                                    {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Responsável */}
                        <div>
                            <label className="auth-label" htmlFor="responsavel">Responsável pelo RH / Recrutamento</label>
                            <input id="responsavel" type="text" className="auth-input" placeholder="Nome do responsável" value={form.responsavel} onChange={e => set('responsavel', e.target.value)} />
                        </div>

                        {/* Divisor */}
                        <div className="auth-divider" style={{ margin: '0.25rem 0' }}>acesso à plataforma</div>

                        {/* Senha + Confirmar (mesma linha) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="senha-emp">Senha * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(mín. 8)</span></label>
                                <div className="auth-input-wrapper">
                                    <input id="senha-emp" type={mostrarSenha ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={form.senha} onChange={e => set('senha', e.target.value)} />
                                    <button type="button" className="auth-input-toggle" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label="Mostrar senha">
                                        {mostrarSenha ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="confirmar-emp">Confirmar senha *</label>
                                <div className="auth-input-wrapper">
                                    <input id="confirmar-emp" type={mostrarConfirmar ? 'text' : 'password'} className={`auth-input${form.confirmarSenha && form.senha !== form.confirmarSenha ? ' error' : ''}`} placeholder="••••••••" value={form.confirmarSenha} onChange={e => set('confirmarSenha', e.target.value)} />
                                    <button type="button" className="auth-input-toggle" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} aria-label="Mostrar confirmação">
                                        {mostrarConfirmar ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                                    </button>
                                </div>
                                {form.confirmarSenha && form.senha !== form.confirmarSenha && (
                                    <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.3rem' }}>As senhas não coincidem</p>
                                )}
                            </div>
                        </div>

                        {/* Termos */}
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.83rem', color: '#475569', lineHeight: 1.5 }}>
                            <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} style={{ marginTop: 2, flexShrink: 0, accentColor: '#FE8341' }} />
                            <span>
                                Aceito os <Link href="/termos" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Termos de Uso</Link> e a{' '}
                                <Link href="/privacidade" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Política de Privacidade</Link>
                            </span>
                        </label>

                        {/* Erro */}
                        {erro && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.83rem', color: '#dc2626' }}>
                                {erro}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #FE8341, #e06b2a)' }}>
                            {loading
                                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : 'Criar conta da empresa →'
                            }
                        </button>

                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', marginTop: '1.25rem' }}>
                        Já tem conta?{' '}
                        <Link href="/login" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Fazer login</Link>
                    </p>

                </div>
            </div>
        </div>
    )
}

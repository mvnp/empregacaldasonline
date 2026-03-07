'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'

// ── Google logo ────────────────────────────────────────────
function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
        </svg>
    )
}

const AREAS = ['Tecnologia', 'Marketing', 'Vendas', 'Saúde', 'Educação', 'Engenharia', 'Administração', 'Jurídico', 'Design', 'Outra']

export default function CadastroCandidatoPage() {
    const [form, setForm] = useState({
        nome: '', sobrenome: '', email: '', telefone: '',
        area: '', senha: '', confirmarSenha: '',
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')

        if (!form.nome || !form.email || !form.senha) { setErro('Preencha todos os campos obrigatórios.'); return }
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
                <div className="auth-panel-left"><AuthPanel variant="candidato" /></div>
                <div className="auth-right">
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                        <div style={{ width: 68, height: 68, background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <CheckCircle2 style={{ width: 34, height: 34, color: '#10b981' }} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', marginBottom: '0.5rem' }}>Conta criada!</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                            Bem-vindo, <strong style={{ color: '#09355F' }}>{form.nome}</strong>! Seu perfil foi criado com sucesso. Agora você pode explorar as vagas disponíveis.
                        </p>
                        <Link href="/vagas" className="auth-submit" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Ver vagas disponíveis →
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
                <AuthPanel variant="candidato" />
            </div>

            {/* ── Direita ── */}
            <div className="auth-right">
                <div className="auth-card" style={{ maxWidth: 520 }}>

                    {/* Voltar */}
                    <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(42,185,192,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User style={{ width: 22, height: 22, color: '#2AB9C0' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#09355F', lineHeight: 1.2 }}>Criar conta de candidato</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>É grátis e leva menos de 2 minutos</p>
                        </div>
                    </div>

                    {/* Google */}
                    <button className="google-btn" type="button" style={{ marginBottom: '0' }}>
                        <GoogleLogo />
                        Cadastrar com Google
                    </button>

                    <div className="auth-divider">ou preencha o formulário</div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Nome + Sobrenome */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="nome">Nome *</label>
                                <input id="nome" type="text" className="auth-input" placeholder="João" value={form.nome} onChange={e => set('nome', e.target.value)} />
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="sobrenome">Sobrenome</label>
                                <input id="sobrenome" type="text" className="auth-input" placeholder="Silva" value={form.sobrenome} onChange={e => set('sobrenome', e.target.value)} />
                            </div>
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="auth-label" htmlFor="email-cand">E-mail *</label>
                            <input id="email-cand" type="email" className="auth-input" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>

                        {/* Telefone + Área */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="telefone">Telefone</label>
                                <input id="telefone" type="tel" className="auth-input" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="area">Área de interesse</label>
                                <select id="area" className="auth-input" value={form.area} onChange={e => set('area', e.target.value)} style={{ cursor: 'pointer' }}>
                                    <option value="">Selecione...</option>
                                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Senha + Confirmar (mesma linha) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="auth-label" htmlFor="senha-cand">Senha * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(mín. 8)</span></label>
                                <div className="auth-input-wrapper">
                                    <input id="senha-cand" type={mostrarSenha ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={form.senha} onChange={e => set('senha', e.target.value)} />
                                    <button type="button" className="auth-input-toggle" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label="Mostrar senha">
                                        {mostrarSenha ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="auth-label" htmlFor="confirmar-cand">Confirmar senha *</label>
                                <div className="auth-input-wrapper">
                                    <input id="confirmar-cand" type={mostrarConfirmar ? 'text' : 'password'} className={`auth-input${form.confirmarSenha && form.senha !== form.confirmarSenha ? ' error' : ''}`} placeholder="••••••••" value={form.confirmarSenha} onChange={e => set('confirmarSenha', e.target.value)} />
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
                            <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} style={{ marginTop: 2, flexShrink: 0, accentColor: '#09355F' }} />
                            <span>
                                Aceito os{' '}
                                <Link href="/termos" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Termos de Uso</Link>
                                {' '}e a{' '}
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
                        <button type="submit" className="auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #2AB9C0, #0d8a90)' }}>
                            {loading
                                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : 'Criar conta gratuita →'
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

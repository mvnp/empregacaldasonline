'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'

export default function EsqueciASenhaPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [erro, setErro] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')
        if (!email) { setErro('Informe seu e-mail.'); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 1400))
        setLoading(false)
        setEnviado(true)
    }

    return (
        <div className="auth-layout">

            {/* ── Esquerda ── */}
            <div className="auth-panel-left">
                <AuthPanel variant="acesso" />
            </div>

            {/* ── Direita ── */}
            <div className="auth-right">
                <div className="auth-card">

                    {/* Link voltar */}
                    <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar para o login
                    </Link>

                    {!enviado ? (
                        <>
                            {/* Ícone */}
                            <div style={{ width: 52, height: 52, background: 'rgba(9,53,95,0.06)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                <Mail style={{ width: 26, height: 26, color: '#09355F' }} />
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.4rem' }}>
                                Esqueceu sua senha?
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                                Sem problema! Insira seu e-mail e enviaremos um link para você criar uma nova senha.
                            </p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="auth-label" htmlFor="email-reset">E-mail cadastrado</label>
                                    <input
                                        id="email-reset"
                                        type="email"
                                        className="auth-input"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>

                                {erro && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.83rem', color: '#dc2626' }}>
                                        {erro}
                                    </div>
                                )}

                                <button type="submit" className="auth-submit" disabled={loading}>
                                    {loading
                                        ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                        : <><Send style={{ width: 16, height: 16 }} /> Enviar link de recuperação</>
                                    }
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Estado: sucesso */
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <div style={{ width: 64, height: 64, background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                <CheckCircle2 style={{ width: 32, height: 32, color: '#10b981' }} />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#09355F', marginBottom: '0.5rem' }}>
                                E-mail enviado!
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                                Enviamos um link de recuperação para <strong style={{ color: '#09355F' }}>{email}</strong>.
                                Verifique sua caixa de entrada e pasta de spam.
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>O link expira em 30 minutos.</p>
                            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', padding: '0.625rem 1.25rem', background: '#09355F', color: '#fff', borderRadius: 9, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
                                <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar para o login
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

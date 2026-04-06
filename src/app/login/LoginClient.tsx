'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, User, Building2, ArrowRight } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'
import { login as loginAction } from '@/actions/auth'

// ── Google "G" logo ────────────────────────────────────────
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

function LoginContent() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [lembrar, setLembrar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')
        if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
        setLoading(true)

        try {
            const resultado = await loginAction({ email, senha })

            if (!resultado.success) {
                setLoading(false)
                setErro(resultado.error || 'Erro ao fazer login.')
                return
            }

            const redirect = searchParams.get('redirect')
            window.location.href = redirect || resultado.redirectTo || '/admin'
        } catch {
            setLoading(false)
            setErro('Erro de conexão. Tente novamente.')
        }
    }

    return (
        <div className="auth-layout">

            {/* ── Esquerda: branding ── */}
            <div className="auth-panel-left">
                <AuthPanel variant="acesso" />
            </div>

            {/* ── Direita: formulário ── */}
            <div className="auth-right">
                <div className="auth-card">

                    {/* Cabeçalho */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.35rem' }}>
                            Entrar na conta
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Não tem conta?{' '}
                            <Link href="/cadastro" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>
                                Criar conta grátis →
                            </Link>
                        </p>
                    </div>

                    {/* Botão Google */}
                    <button className="google-btn" type="button">
                        <GoogleLogo />
                        Continuar com Google
                    </button>

                    <div className="auth-divider">ou entre com e-mail</div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* E-mail */}
                        <div>
                            <label className="auth-label" htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <label className="auth-label" htmlFor="senha" style={{ margin: 0 }}>Senha</label>
                                <Link href="/esqueci-a-senha" style={{ fontSize: '0.8rem', color: '#2AB9C0', fontWeight: 600, textDecoration: 'none' }}>
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="auth-input-wrapper">
                                <input
                                    id="senha"
                                    type={mostrarSenha ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button type="button" className="auth-input-toggle" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label="Mostrar/ocultar senha">
                                    {mostrarSenha ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                                </button>
                            </div>
                        </div>

                        {/* Lembrar-me */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                            <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#09355F' }} />
                            Manter conectado
                        </label>

                        {/* Erro */}
                        {erro && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.83rem', color: '#dc2626' }}>
                                {erro}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading
                                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : <><LogIn style={{ width: 17, height: 17 }} /> Entrar</>
                            }
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="auth-divider" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>nova por aqui?</div>

                    {/* Tipo de cadastro */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link href="/cadastro/candidato" className="auth-type-btn">
                            <User style={{ width: 20, height: 20, color: '#2AB9C0' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Sou Candidato</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Busco vagas</span>
                        </Link>
                        <Link href="/cadastro/empresa" className="auth-type-btn">
                            <Building2 style={{ width: 20, height: 20, color: '#FE8341' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Sou Empresa</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Quero contratar</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default function LoginClient() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    )
}

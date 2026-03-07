'use client'

import Link from 'next/link'
import { User, Building2, ArrowRight, Sparkles } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'

export default function CadastroPage() {
    return (
        <div className="auth-layout">

            {/* ── Esquerda ── */}
            <div className="auth-panel-left">
                <AuthPanel variant="candidato" />
            </div>

            {/* ── Direita: escolher tipo ── */}
            <div className="auth-right">
                <div className="auth-card">

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #09355F, #0d4278)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Sparkles style={{ width: 26, height: 26, color: '#FBBF53' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.4rem' }}>
                            Criar conta grátis
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Como você quer usar o PortalJobs?
                        </p>
                    </div>

                    {/* Duas opções */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>

                        <Link href="/cadastro/candidato" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: '#fff', border: '2px solid #e8edf5', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2AB9C0'; el.style.background = '#f8fdff' }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8edf5'; el.style.background = '#fff' }}>
                                <div style={{ width: 52, height: 52, background: 'rgba(42,185,192,0.1)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User style={{ width: 26, height: 26, color: '#2AB9C0' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F', marginBottom: '0.2rem' }}>Sou Candidato</p>
                                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Quero buscar vagas e me candidatar</p>
                                </div>
                                <ArrowRight style={{ width: 18, height: 18, color: '#94a3b8', flexShrink: 0 }} />
                            </div>
                        </Link>

                        <Link href="/cadastro/empresa" style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: '#fff', border: '2px solid #e8edf5', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#FE8341'; el.style.background = '#fffaf7' }}
                                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8edf5'; el.style.background = '#fff' }}>
                                <div style={{ width: 52, height: 52, background: 'rgba(254,131,65,0.1)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Building2 style={{ width: 26, height: 26, color: '#FE8341' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F', marginBottom: '0.2rem' }}>Sou Empresa</p>
                                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Quero publicar vagas e contratar</p>
                                </div>
                                <ArrowRight style={{ width: 18, height: 18, color: '#94a3b8', flexShrink: 0 }} />
                            </div>
                        </Link>

                    </div>

                    {/* Já tem conta */}
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                        Já tem conta?{' '}
                        <Link href="/login" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>
                            Fazer login
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}

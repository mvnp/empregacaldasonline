'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, Menu, X } from 'lucide-react'

interface NavbarProps {
    variant?: 'transparent' | 'solid'
}

const NAV_LINKS = [
    { label: 'Vagas', href: '/vagas' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Carreiras', href: '/carreiras' },
    { label: 'Blog', href: '/blog' },
]

export default function Navbar({ variant = 'solid' }: NavbarProps) {
    const [aberto, setAberto] = useState(false)
    const isTransparent = variant === 'transparent'

    const headerStyle: React.CSSProperties = isTransparent
        ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }
        : { position: 'sticky', top: 0, zIndex: 50, background: '#09355F', boxShadow: '0 2px 12px rgba(9,53,95,0.25)', borderBottom: '1px solid rgba(255,255,255,0.08)' }

    return (
        <header style={headerStyle}>
            {/* ── Barra principal ── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    <div style={{ width: 36, height: 36, background: '#FBBF53', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(251,191,83,0.35)', flexShrink: 0 }}>
                        <Briefcase style={{ width: 19, height: 19, color: '#09355F' }} />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                        Portal<span style={{ color: '#FBBF53' }}>Jobs</span>
                    </span>
                </Link>

                {/* ── Nav desktop ── */}
                <nav className="nav-desktop">
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.78)', borderRadius: 7, textDecoration: 'none' }}
                        >
                            {label}
                        </Link>
                    ))}

                    <Link
                        href="/admin/login"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.875rem', fontWeight: 700, color: '#FBBF53', borderRadius: 8, textDecoration: 'none', border: '1.5px solid #FBBF53', marginLeft: '0.5rem' }}
                    >
                        Admin
                    </Link>

                    <Link href="/publicar-vaga" className="btn-primary" style={{ marginLeft: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem', borderRadius: 9 }}>
                        Publicar Vaga
                    </Link>
                </nav>

                {/* ── Hambúrguer (mobile) ── */}
                <button
                    className="nav-hamburger"
                    onClick={() => setAberto(!aberto)}
                    aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
                >
                    {aberto
                        ? <X style={{ width: 26, height: 26 }} />
                        : <Menu style={{ width: 26, height: 26 }} />
                    }
                </button>
            </div>

            {/* ── Menu mobile ── */}
            <nav className={`nav-mobile-menu${aberto ? ' aberto' : ''}`}>
                {NAV_LINKS.map(({ label, href }) => (
                    <Link key={label} href={href} className="nav-mobile-link" onClick={() => setAberto(false)}>
                        {label}
                    </Link>
                ))}
                <Link href="/admin/login" className="nav-mobile-link-admin" onClick={() => setAberto(false)}>
                    Admin
                </Link>
                <Link
                    href="/publicar-vaga"
                    className="btn-primary"
                    style={{ marginTop: '0.5rem', borderRadius: 9, textAlign: 'center', padding: '0.7rem 1rem' }}
                    onClick={() => setAberto(false)}
                >
                    Publicar Vaga
                </Link>
            </nav>
        </header>
    )
}

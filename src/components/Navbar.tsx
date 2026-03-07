import Link from 'next/link'
import { Briefcase } from 'lucide-react'

const NAV_LINKS = [
    { label: 'Vagas', href: '/vagas' },
    { label: 'Empresas', href: '/empresas' },
    { label: 'Carreiras', href: '/carreiras' },
    { label: 'Blog', href: '/blog' },
]

// Estilos separados para melhor legibilidade
const styles = {
    header: {
        position: 'absolute' as const,
        top: 0, left: 0, right: 0,
        zIndex: 50,
    },
    inner: {
        maxWidth: 1280,
        margin: '0 auto',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        textDecoration: 'none',
    },
    logoIcon: {
        width: 38, height: 38,
        background: '#FBBF53',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(251,191,83,0.4)',
        flexShrink: 0,
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-0.02em',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    divider: {
        width: 1, height: 20,
        background: 'rgba(255,255,255,0.2)',
        margin: '0 0.5rem',
    },
    btnPublicar: {
        marginLeft: '0.5rem',
        padding: '0.6rem 1.25rem',
        fontSize: '0.875rem',
        borderRadius: 10,
    },
}

export default function Navbar() {
    return (
        <header style={styles.header}>
            <div style={styles.inner}>

                {/* Logo */}
                <Link href="/" style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <Briefcase style={{ width: 20, height: 20, color: '#09355F' }} />
                    </div>
                    <span style={styles.logoText}>
                        Portal<span style={{ color: '#FBBF53' }}>Jobs</span>
                    </span>
                </Link>

                {/* Navegação */}
                <nav style={styles.nav}>
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            style={{
                                padding: '0.5rem 0.9rem',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.8)',
                                borderRadius: 8,
                                textDecoration: 'none',
                            }}
                        >
                            {label}
                        </Link>
                    ))}

                    <div style={styles.divider} />

                    <Link
                        href="/admin/login"
                        style={{
                            padding: '0.5rem 0.9rem',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.8)',
                            borderRadius: 8,
                            textDecoration: 'none',
                        }}
                    >
                        Admin
                    </Link>

                    <Link href="/publicar-vaga" className="btn-primary" style={styles.btnPublicar}>
                        Publicar Vaga
                    </Link>
                </nav>

            </div>
        </header>
    )
}

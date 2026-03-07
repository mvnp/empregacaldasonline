'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Briefcase, Users, Building2, BarChart3,
    Settings, LogOut, ChevronLeft, ChevronRight, Bell, Search, Menu, X
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Itens do menu admin
// ─────────────────────────────────────────────────────────────
const ADMIN_MENU = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Vagas', href: '/admin/vagas', icon: Briefcase },
    { label: 'Candidatos', href: '/admin/candidatos', icon: Users },
    { label: 'Empresas', href: '/admin/empresas', icon: Building2 },
    { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

const EMPREGADOR_MENU = [
    { label: 'Dashboard', href: '/admin/empregador', icon: LayoutDashboard },
    { label: 'Minhas Vagas', href: '/admin/empregador/vagas', icon: Briefcase },
    { label: 'Candidatos', href: '/admin/empregador/candidatos', icon: Users },
    { label: 'Relatórios', href: '/admin/empregador/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/empregador/configuracoes', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebar, setMobileSidebar] = useState(false)

    const isEmpregador = pathname.startsWith('/admin/empregador')
    const menu = isEmpregador ? EMPREGADOR_MENU : ADMIN_MENU
    const titulo = isEmpregador ? 'Painel Empregador' : 'Admin Portal'

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>

            {/* ── Overlay mobile ── */}
            {mobileSidebar && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 60 }}
                    onClick={() => setMobileSidebar(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`admin-sidebar ${mobileSidebar ? 'admin-sidebar-open' : ''}`}
                style={{
                    width: sidebarCollapsed ? 72 : 260,
                    background: 'linear-gradient(180deg, #09355F 0%, #062540 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.25s ease',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 70,
                    overflow: 'hidden',
                }}
            >
                {/* Header sidebar */}
                <div style={{ padding: sidebarCollapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: '0.5rem' }}>
                    {!sidebarCollapsed && (
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <div style={{ width: 32, height: 32, background: '#FBBF53', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Briefcase style={{ width: 16, height: 16, color: '#09355F' }} />
                            </div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>
                                Portal<span style={{ color: '#FBBF53' }}>Jobs</span>
                            </span>
                        </Link>
                    )}
                    {sidebarCollapsed && (
                        <div style={{ width: 32, height: 32, background: '#FBBF53', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Briefcase style={{ width: 16, height: 16, color: '#09355F' }} />
                        </div>
                    )}

                    {/* Botão fechar no mobile */}
                    <button
                        className="admin-sidebar-close"
                        onClick={() => setMobileSidebar(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '0.25rem', display: 'none' }}
                        aria-label="Fechar sidebar"
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                {/* Tipo painel */}
                {!sidebarCollapsed && (
                    <div style={{ padding: '0.75rem 1.5rem 0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {titulo}
                        </span>
                    </div>
                )}

                {/* Menu */}
                <nav style={{ flex: 1, padding: sidebarCollapsed ? '0.5rem 0.5rem' : '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    {menu.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileSidebar(false)}
                                title={sidebarCollapsed ? label : undefined}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: sidebarCollapsed ? '0.7rem' : '0.65rem 0.85rem',
                                    borderRadius: 10,
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#FBBF53' : 'rgba(255,255,255,0.65)',
                                    background: isActive ? 'rgba(251,191,83,0.12)' : 'transparent',
                                    transition: 'all 0.18s',
                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                }}
                            >
                                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                {!sidebarCollapsed && label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Toggle entre Admin e Empregador */}
                {!sidebarCollapsed && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <Link
                            href={isEmpregador ? '/admin' : '/admin/empregador'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem',
                                background: 'rgba(42,185,192,0.12)', borderRadius: 10,
                                color: '#2AB9C0', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                                transition: 'background 0.18s',
                            }}
                        >
                            {isEmpregador ? <LayoutDashboard style={{ width: 16, height: 16 }} /> : <Building2 style={{ width: 16, height: 16 }} />}
                            {isEmpregador ? 'Painel Admin' : 'Painel Empregador'}
                        </Link>
                    </div>
                )}

                {/* Collapse btn + logout */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="admin-collapse-btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: sidebarCollapsed ? '0.7rem' : '0.6rem 0.85rem',
                            background: 'none', border: 'none', cursor: 'pointer', borderRadius: 10,
                            color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', width: '100%',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            transition: 'color 0.18s',
                        }}
                        aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                    >
                        {sidebarCollapsed ? <ChevronRight style={{ width: 18, height: 18 }} /> : <><ChevronLeft style={{ width: 18, height: 18 }} /> Recolher</>}
                    </button>
                    <Link
                        href="/login"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: sidebarCollapsed ? '0.7rem' : '0.6rem 0.85rem',
                            borderRadius: 10, textDecoration: 'none',
                            color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        }}
                    >
                        <LogOut style={{ width: 18, height: 18 }} />
                        {!sidebarCollapsed && 'Sair'}
                    </Link>
                </div>
            </aside>

            {/* ── Conteúdo principal ── */}
            <div
                className="admin-content"
                style={{
                    flex: 1,
                    marginLeft: sidebarCollapsed ? 72 : 260,
                    transition: 'margin-left 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                {/* Top bar */}
                <header style={{
                    background: '#fff',
                    borderBottom: '1.5px solid #e8edf5',
                    padding: '0.875rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    gap: '1rem',
                }}>
                    {/* Hamburger mobile */}
                    <button
                        className="admin-hamburger"
                        onClick={() => setMobileSidebar(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#09355F', padding: '0.25rem', display: 'none' }}
                        aria-label="Abrir menu"
                    >
                        <Menu style={{ width: 24, height: 24 }} />
                    </button>

                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            style={{
                                width: '100%', height: 40, paddingLeft: '2.5rem', paddingRight: '1rem',
                                background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: 10,
                                fontSize: '0.85rem', color: '#1a2332', outline: 'none',
                            }}
                        />
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Notifications */}
                        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#64748b' }} aria-label="Notificações">
                            <Bell style={{ width: 20, height: 20 }} />
                            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#FE8341', borderRadius: '50%', border: '2px solid #fff' }} />
                        </button>

                        {/* Avatar */}
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #09355F, #0d4a82)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#FBBF53', fontWeight: 800, fontSize: '0.85rem',
                            cursor: 'pointer',
                        }}>
                            {isEmpregador ? 'E' : 'A'}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: '1.5rem 2rem 2.5rem' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}

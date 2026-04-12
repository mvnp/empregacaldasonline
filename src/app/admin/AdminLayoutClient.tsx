'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Briefcase, Users, Building2, BarChart3,
    Settings, LogOut, ChevronLeft, ChevronRight, Bell, Search, Menu, X, List, User, FileText, Megaphone
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

// ─────────────────────────────────────────────────────────────
// Itens do menu admin
// ─────────────────────────────────────────────────────────────
const ADMIN_MENU = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Artigos do Blog', href: '/admin/blog', icon: FileText },
    { label: 'Vagas', href: '/admin/vagas', icon: Briefcase },
    { label: 'Candidatos', href: '/admin/candidatos', icon: Users },
    { label: 'Empresas', href: '/admin/empresas', icon: Building2 },
    { label: 'Lista de Empresas', href: '/admin/lista-empresas', icon: List },
    { label: 'Usuários', href: '/admin/usuarios', icon: User },
    { label: 'Publicidades', href: '/admin/publicidades', icon: Megaphone },
    { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

const EMPREGADOR_MENU = [
    { label: 'Dashboard', href: '/admin/empregador', icon: LayoutDashboard },
    { label: 'Minhas Empresas', href: '/admin/empregador/empresas', icon: Building2 },
    { label: 'Minhas Vagas', href: '/admin/empregador/vagas', icon: Briefcase },
    { label: 'Candidatos', href: '/admin/empregador/candidatos', icon: Users },
    { label: 'Relatórios', href: '/admin/empregador/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/empregador/configuracoes', icon: Settings },
]

const CANDIDATO_MENU = [
    { label: 'Dashboard', href: '/admin/candidato', icon: LayoutDashboard },
    { label: 'Vagas', href: '/admin/candidato/vagas', icon: Briefcase },
    { label: 'Lista de Empresas', href: '/admin/candidato/empresas', icon: Building2 },
    { label: 'Meus Currículos', href: '/admin/candidato/listar-curriculos', icon: FileText },
    { label: 'Meu Perfil', href: '/admin/perfil', icon: User },
]

export default function AdminLayoutClient({ children, isImpersonating = false }: { children: React.ReactNode, isImpersonating?: boolean }) {
    const pathname = usePathname()
    const { tipoUsuario } = useUser()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebar, setMobileSidebar] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
        const stored = localStorage.getItem('sidebar_collapsed')
        if (stored === 'true') {
            setSidebarCollapsed(true)
        }
    }, [])

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed
        setSidebarCollapsed(newState)
        localStorage.setItem('sidebar_collapsed', String(newState))
    }

    // Permite que Admin simule painel empregador nas rotas dele
    const isMasqueradingEmpregador = tipoUsuario === 'admin' && (pathname === '/admin/empregador' || pathname.startsWith('/admin/empregador/'))
    const isEmpregadorMenu = tipoUsuario === 'empregador' || isMasqueradingEmpregador
    const isCandidatoMenu = tipoUsuario === 'candidato'

    let menu = ADMIN_MENU
    let titulo = 'Admin Portal'

    // Fallback limpo: Menu é 100% atrelado ao banco global do logado, jamais deduzido sozinho pela rota (corrige bug que sobrepunha admin em /admin/candidatos)
    if (isCandidatoMenu) {
        menu = CANDIDATO_MENU
        titulo = 'Área do Candidato'
    } else if (isEmpregadorMenu) {
        menu = EMPREGADOR_MENU
        titulo = 'Painel Empregador'
    } else if (tipoUsuario === 'admin') {
        menu = ADMIN_MENU
        titulo = 'Admin Portal'
    }

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
                <nav className="admin-sidebar-nav" style={{ flex: 1, padding: sidebarCollapsed ? '0.5rem 0.5rem' : '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
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

                {!sidebarCollapsed && !isCandidatoMenu && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <Link
                            href={isEmpregadorMenu ? '/admin' : '/admin/empregador'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem',
                                background: 'rgba(42,185,192,0.12)', borderRadius: 10,
                                color: '#2AB9C0', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                                transition: 'background 0.18s',
                            }}
                        >
                            {isEmpregadorMenu ? <LayoutDashboard style={{ width: 16, height: 16 }} /> : <Building2 style={{ width: 16, height: 16 }} />}
                            {isEmpregadorMenu ? 'Painel Admin' : 'Painel Empregador'}
                        </Link>
                    </div>
                )}

                {/* Collapse btn + logout */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                        onClick={toggleSidebar}
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
                    <button
                        onClick={async () => {
                            const { logout } = await import('@/actions/auth')
                            await logout()
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: sidebarCollapsed ? '0.7rem' : '0.6rem 0.85rem',
                            borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', width: '100%',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        }}
                        aria-label="Sair"
                    >
                        <LogOut style={{ width: 18, height: 18 }} />
                        {!sidebarCollapsed && 'Sair'}
                    </button>
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
                        {/* Go Back (Impersonation) */}
                        {isImpersonating && (
                            <button
                                onClick={async () => {
                                    const { encerrarImpersonacao } = await import('@/actions/auth')
                                    await encerrarImpersonacao()
                                    window.location.href = '/admin/usuarios'
                                }}
                                title="Voltar para Admin"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.4rem 0.8rem', borderRadius: 8,
                                    background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                                    border: 'none', cursor: 'pointer'
                                }}
                            >
                                <LogOut style={{ width: 14, height: 14 }} /> Go Back
                            </button>
                        )}

                        {/* Notifications */}
                        <button title="Notificações" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#64748b' }} aria-label="Notificações">
                            <Bell style={{ width: 20, height: 20 }} />
                            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#FE8341', borderRadius: '50%', border: '2px solid #fff' }} />
                        </button>

                        {/* Logout - Header */}
                        <button
                            onClick={async () => {
                                const { logout } = await import('@/actions/auth')
                                await logout()
                            }}
                            title="Sair"
                            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: '#ef4444' }}
                            aria-label="Sair"
                        >
                            <LogOut style={{ width: 20, height: 20 }} />
                        </button>

                        {/* Avatar */}
                        <Link
                            href="/admin/perfil"
                            title="Meu Perfil"
                            style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'linear-gradient(135deg, #09355F, #0d4a82)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#FBBF53', fontWeight: 800, fontSize: '0.85rem',
                                cursor: 'pointer', textDecoration: 'none',
                            }}
                        >
                            {isEmpregadorMenu ? 'E' : (isCandidatoMenu ? 'C' : 'A')}
                        </Link>
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

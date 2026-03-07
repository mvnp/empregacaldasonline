import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    Briefcase, MapPin, CheckCircle, Star, ChevronRight,
    FileText, List, Lightbulb, Gift, Building2, AlertCircle,
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VagaDetailSidebar from '@/components/VagaDetailSidebar'

import { getVagaDetalhe } from '@/data/vagas'
import { getBadgeModalidade, getBadgeContrato, getAvatarColor } from '@/lib/helpers'

// ─────────────────────────────────────────────────────────────
// Metadata dinâmica para SEO
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const vaga = getVagaDetalhe(id)
    if (!vaga) return { title: 'Vaga não encontrada' }
    return {
        title: `${vaga.titulo} — ${vaga.empresa}`,
        description: `Vaga de ${vaga.titulo} na ${vaga.empresa}. ${vaga.modalidade} · ${vaga.contrato} · ${vaga.nivel}. ${vaga.salario}.`,
    }
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: seção de conteúdo com header colorido
// ─────────────────────────────────────────────────────────────
function VagaSection({
    icon: Icon,
    title,
    iconColor = '#09355F',
    children,
}: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    title: string
    iconColor?: string
    children: React.ReactNode
}) {
    return (
        <div className="vaga-section">
            <div className="vaga-section-header">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 17, height: 17, color: iconColor }} />
                </div>
                <h2>{title}</h2>
            </div>
            <div className="vaga-section-body">{children}</div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: lista de itens com ícone
// ─────────────────────────────────────────────────────────────
function ItemList({
    items,
    iconColor = '#2AB9C0',
    badge,
}: {
    items: string[]
    iconColor?: string
    badge?: string
}) {
    return (
        <ul className="vaga-list">
            {items.map((item, i) => (
                <li key={i}>
                    <CheckCircle className="vaga-list-icon" style={{ color: iconColor }} />
                    <span>{item}</span>
                    {badge && <span className={`req-badge ${badge === 'diferencial' ? 'diferencial' : ''}`}>{badge}</span>}
                </li>
            ))}
        </ul>
    )
}

// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────
export default async function VagaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const vaga = getVagaDetalhe(id)

    if (!vaga) notFound()

    const dataPublicacao = new Date(vaga.dataPublicacao).toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>

            {/* Navbar sólida — páginas internas */}
            <Navbar variant="solid" />

            {/* ── Banner superior da vaga ── */}
            <div style={{ background: '#09355F', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 2.5rem' }}>

                    {/* Breadcrumb */}
                    <nav className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
                        <Link href="/">Início</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <Link href="/vagas">Vagas</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <Link href={`/vagas?area=${encodeURIComponent(vaga.area)}`}>{vaga.area}</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <span className="breadcrumb-current">{vaga.titulo}</span>
                    </nav>

                    {/* Cabeçalho da vaga */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>

                        {/* Avatar empresa */}
                        <div style={{
                            width: 72, height: 72, borderRadius: 16,
                            background: getAvatarColor(vaga.empresa),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 900, fontSize: '1.75rem', flexShrink: 0,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}>
                            {vaga.empresa[0]}
                        </div>

                        <div style={{ flex: 1, minWidth: 250 }}>
                            {/* Badge destaque */}
                            {vaga.destaque && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#FBBF53', color: '#09355F', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                                    <Star style={{ width: 11, height: 11 }} /> Vaga em Destaque
                                </span>
                            )}

                            {/* Título */}
                            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                                {vaga.titulo}
                            </h1>

                            {/* Empresa + local */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.875rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                                    <Building2 style={{ width: 15, height: 15, color: '#2AB9C0' }} />
                                    {vaga.empresa}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)' }}>
                                    <MapPin style={{ width: 15, height: 15, color: '#FBBF53' }} />
                                    {vaga.local}
                                </span>
                            </div>

                            {/* Badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                <span className={getBadgeContrato(vaga.contrato)}>
                                    <Briefcase style={{ width: 10, height: 10 }} /> {vaga.contrato}
                                </span>
                                <span className={getBadgeModalidade(vaga.modalidade)}>{vaga.modalidade}</span>
                                <span className="badge badge-level">{vaga.nivel}</span>
                                <span className="badge badge-salary">{vaga.salario}</span>
                            </div>
                        </div>

                        {/* Data de publicação */}
                        <div className="vaga-data" style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Publicada em</p>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{dataPublicacao}</p>
                            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                                {vaga.candidaturas} candidaturas
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Conteúdo principal ── */}
            <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>
                <div className="content-sidebar-grid">

                    {/* ── Coluna esquerda: conteúdo ── */}
                    <div>

                        {/* Sobre a oportunidade */}
                        <VagaSection icon={FileText} title="Sobre a Oportunidade" iconColor="#09355F">
                            <div className="vaga-prose">
                                {vaga.descricao.split('\n\n').map((paragrafo, i) => (
                                    <p key={i}>{paragrafo.trim()}</p>
                                ))}
                            </div>
                        </VagaSection>

                        {/* Responsabilidades */}
                        <VagaSection icon={List} title="O que você vai fazer" iconColor="#2AB9C0">
                            <ItemList items={vaga.responsabilidades} iconColor="#2AB9C0" />
                        </VagaSection>

                        {/* Requisitos obrigatórios */}
                        <VagaSection icon={AlertCircle} title="Requisitos Obrigatórios" iconColor="#09355F">
                            <ItemList items={vaga.requisitos} iconColor="#09355F" badge="obrigatório" />
                        </VagaSection>

                        {/* Diferenciais */}
                        {vaga.diferenciais.length > 0 && (
                            <VagaSection icon={Lightbulb} title="Diferenciais" iconColor="#FE8341">
                                <ItemList items={vaga.diferenciais} iconColor="#FE8341" badge="diferencial" />
                            </VagaSection>
                        )}

                        {/* Benefícios */}
                        <VagaSection icon={Gift} title="Benefícios" iconColor="#10b981">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
                                {vaga.beneficios.map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                                        <CheckCircle style={{ width: 15, height: 15, color: '#10b981', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </VagaSection>

                        {/* Sobre a empresa */}
                        <VagaSection icon={Building2} title={`Sobre a ${vaga.empresa}`} iconColor="#09355F">
                            <div className="vaga-prose">
                                {vaga.sobreEmpresa.split('\n\n').map((paragrafo, i) => (
                                    <p key={i}>{paragrafo.trim()}</p>
                                ))}
                            </div>
                        </VagaSection>

                        {/* CTA mobile — aparece abaixo do conteúdo em telas pequenas */}
                        <div style={{ background: '#09355F', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                Gostou da vaga?
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                Candidate-se agora e dê o próximo passo na sua carreira.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {vaga.whatsapp && (
                                    <a
                                        href={`https://wa.me/${vaga.whatsapp}?text=Olá! Vi a vaga de ${encodeURIComponent(vaga.titulo)} e tenho interesse.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                        style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: 10 }}
                                    >
                                        Candidatar via WhatsApp
                                    </a>
                                )}
                                <Link href="/vagas" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    ← Ver outras vagas
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* ── Coluna direita: sidebar ── */}
                    <aside>
                        <VagaDetailSidebar vaga={vaga} />
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    )
}

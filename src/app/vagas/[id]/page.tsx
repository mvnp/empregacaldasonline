import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Clock,
    CheckCircle2, Star, Gift, DollarSign,
    ArrowLeft, Send, ExternalLink
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { buscarVaga } from '@/actions/vagas'
import { buscarEmpresa } from '@/actions/empresas'

export const dynamic = 'force-dynamic'

function formatSalario(min: number | null, max: number | null, mostrar: boolean) {
    if (!mostrar) return 'A combinar'
    if (!min && !max) return 'A combinar'
    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    if (min && max) return `${fmt(min)} – ${fmt(max)}`
    if (min) return `A partir de ${fmt(min)}`
    if (max) return `Até ${fmt(max)}`
    return 'A combinar'
}

function diasAtras(created_at: string): string {
    const diff = Math.floor((Date.now() - new Date(created_at).getTime()) / 86_400_000)
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Ontem'
    return `${diff} dias atrás`
}

export default async function VagaPublicaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const vagaId = parseInt(id, 10)

    if (isNaN(vagaId)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar variant="transparent" />
                <div style={{ flex: 1, backgroundColor: '#09355F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
                        <h1>Vaga Inválida</h1>
                        <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Voltar para a Home</Link>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const vaga = await buscarVaga(vagaId)

    if (!vaga) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar variant="transparent" />
                <div style={{ flex: 1, backgroundColor: '#09355F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
                        <h1>Vaga não encontrada</h1>
                        <p style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>A vaga que você procura pode ter sido encerrada.</p>
                        <Link href="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Ver vagas disponíveis</Link>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const empresaPerfil = vaga.empresa_id ? await buscarEmpresa(vaga.empresa_id) : null;

    const modalidade = vaga.modalidade.charAt(0).toUpperCase() + vaga.modalidade.slice(1)
    const regime = (vaga.tipo_contrato || 'CLT').toUpperCase()
    const nivel = vaga.nivel ? vaga.nivel.charAt(0).toUpperCase() + vaga.nivel.slice(1) : ''
    const horario = vaga.modalidade === 'remoto' ? 'Horário Flexível' : 'Horário Comercial'
    const salario = formatSalario(vaga.salario_min, vaga.salario_max, vaga.mostrar_salario)

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
            {/* Header / Navbar adaptado */}
            <div style={{ background: 'linear-gradient(135deg, #09355F, #062340)', position: 'relative', zIndex: 10 }}>
                <Navbar variant="transparent" />

                {/* Reduced Hero Section */}
                <div style={{ padding: '5rem 2rem 3.5rem', maxWidth: 1280, margin: '0 auto', color: '#fff' }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2AB9C0',
                        fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem',
                        transition: 'color 0.2s'
                    }}>
                        <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar para Vagas
                    </Link>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 800, color: '#FBBF53', flexShrink: 0
                        }}>
                            {vaga.empresa[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 280 }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.15 }}>
                                {vaga.titulo}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Building2 style={{ width: 14, height: 14 }} /> {vaga.empresa}
                                </span>
                                {vaga.local && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <MapPin style={{ width: 14, height: 14 }} /> {vaga.local}
                                    </span>
                                )}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Clock style={{ width: 14, height: 14 }} /> Publicada {diasAtras(vaga.created_at)}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.4rem 1rem', borderRadius: 9999, background: 'rgba(42, 185, 192, 0.15)', color: '#2AB9C0', fontWeight: 700, fontSize: '0.8rem' }}>{modalidade}</span>
                            {nivel && <span style={{ padding: '0.4rem 1rem', borderRadius: 9999, background: 'rgba(251, 191, 83, 0.15)', color: '#FBBF53', fontWeight: 700, fontSize: '0.8rem' }}>{nivel}</span>}
                            <span style={{ padding: '0.4rem 1rem', borderRadius: 9999, background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>{regime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout principal */}
            <main style={{ flex: 1, padding: '2.5rem 2rem 5rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }} className="vaga-publica-grid">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Descrição */}
                        <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Descrição da Vaga
                            </h2>
                            <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.8 }}>
                                {(vaga.descricao || '').split('\n').map((p: string, i: number) => (
                                    <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
                                ))}
                            </div>
                        </div>

                        {/* Responsabilidades */}
                        {vaga.responsabilidades && vaga.responsabilidades.length > 0 && (
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 style={{ color: '#16a34a' }} /> Responsabilidades
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {vaga.responsabilidades.map((r: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: 9 }} />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Requisitos */}
                        {vaga.requisitos && vaga.requisitos.length > 0 && (
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star style={{ color: '#FE8341' }} /> Requisitos
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {vaga.requisitos.map((r: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE8341', flexShrink: 0, marginTop: 9 }} />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Diferenciais */}
                        {vaga.diferenciais && vaga.diferenciais.length > 0 && (
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star style={{ color: '#FBBF53' }} /> Diferenciais
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {vaga.diferenciais.map((d: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF53', flexShrink: 0, marginTop: 9 }} />
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Direita */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>

                        {/* Cartão Sobre a Empresa */}
                        {empresaPerfil && (
                            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8', textAlign: 'center' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 14, margin: '0 auto 1rem',
                                    background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: 800, color: '#fff'
                                }}>
                                    <Building2 style={{ width: 24, height: 24 }} />
                                </div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.25rem' }}>{empresaPerfil.nome_fantasia}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem' }}>{empresaPerfil.setor || 'Setor não informado'} · {empresaPerfil.local || vaga.local}</p>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '0', borderTop: '1px solid #f0f4f8', paddingTop: '1rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{empresaPerfil.vagas?.filter((v: any) => v.status === 'ativa').length || 1}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Vagas Ativas</p>
                                    </div>
                                    <div style={{ width: 1, background: '#f0f4f8' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{empresaPerfil.tamanho_empresa || '-'}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Funcionários</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cartão de Resumo e Ação */}
                        <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2AB9C0' }}>
                                        <DollarSign style={{ width: 20, height: 20 }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem' }}>Salário</p>
                                        <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{salario}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FE8341' }}>
                                        <Briefcase style={{ width: 20, height: 20 }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem' }}>Regime</p>
                                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0 }}>{regime} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {horario}</span></p>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(254,131,65,0.25)' }}>
                                Candidatar-se <Send style={{ width: 16, height: 16 }} />
                            </button>
                        </div>

                        {/* Benefícios */}
                        {vaga.beneficios && vaga.beneficios.length > 0 && (
                            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Gift style={{ color: '#FBBF53', width: 20, height: 20 }} /> Benefícios Principais
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {vaga.beneficios.map((b: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#475569' }}>
                                            <Gift style={{ width: 14, height: 14, color: '#FBBF53' }} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>

                <style suppressHydrationWarning>{`
                    @media (max-width: 900px) {
                        .vaga-publica-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}</style>
            </main>

            <Footer />
        </div>
    )
}

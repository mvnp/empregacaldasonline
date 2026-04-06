import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Clock,
    CheckCircle2, Star, Gift, DollarSign,
    ArrowLeft, Send, ExternalLink
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { buscarVagaPublica } from '@/actions/vagas'
import { buscarEmpresaPublica } from '@/actions/empresas'
import VagaDetailDisplay from '@/components/VagaDetailDisplay'

export const dynamic = 'force-dynamic'

function formatSalario(min: number | null, max: number | null, mostrar: boolean, a_combinar?: boolean) {
    if (!mostrar) return 'A combinar'
    if (a_combinar) return 'Salário a combinar'
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

    const vaga = await buscarVagaPublica(vagaId)

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

    const empresaPerfil = vaga.empresa_id ? await buscarEmpresaPublica(vaga.empresa_id) : null;

    const modalidade = vaga.modalidade.charAt(0).toUpperCase() + vaga.modalidade.slice(1)
    const regime = (vaga.tipo_contrato || 'CLT').toUpperCase()
    const nivel = vaga.nivel ? vaga.nivel.charAt(0).toUpperCase() + vaga.nivel.slice(1) : ''
    const horario = vaga.modalidade === 'remoto' ? 'Horário Flexível' : 'Horário Comercial'
    const salario = vaga.empresa === 'Empresa: Cadastre-se ou faça login' ? 'R$ **,***.**' : formatSalario(vaga.salario_min, vaga.salario_max, vaga.mostrar_salario, vaga.salario_a_combinar)

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
                                    <Building2 style={{ width: 14, height: 14 }} />
                                    {vaga.empresa === 'Empresa: Cadastre-se ou faça login' ? (
                                        <span>
                                            <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>Cadastre-se</Link> ou faça{' '}
                                            <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>Login</Link>
                                        </span>
                                    ) : (
                                        vaga.empresa
                                    )}
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
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <VagaDetailDisplay
                        vaga={vaga}
                        empresaPerfil={empresaPerfil}
                        salario={salario}
                        regime={regime}
                        horario={horario}
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}

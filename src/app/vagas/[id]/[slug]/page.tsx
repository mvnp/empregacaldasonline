import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Clock,
    CheckCircle2, Star, Gift, DollarSign,
    ArrowLeft, Send, ExternalLink
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { buscarVagaPublica, listarVagasPublicas } from '@/actions/vagas'
import { buscarEmpresaPublica } from '@/actions/empresas'
import VagaDetailDisplay from '@/components/VagaDetailDisplay'
import BannerSpace from '@/components/publicidade/BannerSpace'
import { verificarOnboardingCandidato, getUsuarioLogado } from '@/actions/auth'

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

import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params
    const vagaId = parseInt(id, 10)

    if (isNaN(vagaId)) {
        return { title: 'Vaga não encontrada | Emprega Caldas' }
    }

    const vaga = await buscarVagaPublica(vagaId)

    if (!vaga) {
        return { title: 'Vaga não encontrada | Emprega Caldas' }
    }

    const descricaoSeo = vaga.descricao ? vaga.descricao.substring(0, 160) + '...' : `Vaga para ${vaga.titulo} em Caldas Novas e região. Confira os detalhes e candidate-se agora!`

    return {
        title: `${vaga.titulo} - Emprega Caldas Novas Online`,
        description: descricaoSeo,
        openGraph: {
            title: `${vaga.titulo} - Emprega Caldas Novas Online`,
            description: descricaoSeo,
            images: [
                {
                    url: 'https://empregacaldas.online/portal-jobs-caldas-novas.png',
                    alt: `Vaga para ${vaga.titulo} - Emprega Caldas Novas Online`,
                    width: 1200,
                    height: 630,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: vaga.titulo,
            description: descricaoSeo,
            images: ['https://empregacaldas.online/portal-jobs-caldas-novas.png'],
        },
    }
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

    // Fetch related jobs (using the same area/title or just recent ones)
    // Here we'll just fetch latest active jobs and exclude the current one to show 2.
    const resRelacionadas = await listarVagasPublicas({ perPage: 3 });
    const vagasRelacionadas = resRelacionadas.vagas.filter(v => v.id !== vaga.id).slice(0, 2);

    const modalidade = vaga.modalidade.charAt(0).toUpperCase() + vaga.modalidade.slice(1)
    const regime = (vaga.tipo_contrato || 'CLT').toUpperCase()
    const nivel = vaga.nivel ? vaga.nivel.charAt(0).toUpperCase() + vaga.nivel.slice(1) : ''
    const horario = vaga.modalidade === 'remoto' ? 'Horário Flexível' : 'Horário Comercial'
    const salario = vaga.empresa === 'Empresa: Cadastre-se ou faça login' ? 'R$ **,***.**' : formatSalario(vaga.salario_min, vaga.salario_max, vaga.mostrar_salario, vaga.salario_a_combinar)

    const user = await getUsuarioLogado();
    const isCandidato = user?.tipo === 'candidato';
    const onboardingStatus = isCandidato ? await verificarOnboardingCandidato() : null;
    const onboardingConcluido = isCandidato ? (onboardingStatus?.perfilCompleto && onboardingStatus?.temCurriculo) : false;

    let mostrarContato = false;
    if (user) {
        if (isCandidato) {
            mostrarContato = !!onboardingConcluido;
        } else {
            mostrarContato = true;
        }
    }

    let whatsAppUrl = '';
    if (isCandidato) {
        if (!onboardingConcluido) {
            whatsAppUrl = '/admin/perfil';
        } else {
            const rawPhone = vaga.whatsapp || vaga.telefone || empresaPerfil?.whatsapp || empresaPerfil?.telefone || '';
            const cleanPhone = rawPhone.replace(/\D/g, '');
            if (cleanPhone) {
                const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                whatsAppUrl = `https://wa.me/${fullPhone}`;
            }
        }
    }

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
                                            <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>login</Link>
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <a
                                href="https://chat.whatsapp.com/KIYDOOBhx9LLc9hWOKmFOE"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '0.4rem 1.2rem',
                                    borderRadius: 9999,
                                    background: '#25D366',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                                    transition: 'all 0.2s ease',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Entrar no Grupo
                            </a>
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

                    {/* Banner H2 / G2 - Topo centralizado */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                        <BannerSpace formato="leaderboard" className="ad-detail-vaga-top" />
                    </div>
                    <VagaDetailDisplay
                        vaga={vaga}
                        empresaPerfil={empresaPerfil}
                        salario={salario}
                        regime={regime}
                        horario={horario}
                        vagasRelacionadas={vagasRelacionadas}
                        isCandidato={isCandidato}
                        whatsAppUrl={whatsAppUrl}
                        mostrarContato={mostrarContato}
                    />
                </div>
            </main>
            {/* Banner H3 - Pré-Footer */}
            <div style={{ maxWidth: 1280, margin: '0 auto 4rem', padding: '0 2rem', width: '100%' }}>
                <BannerSpace formato="billboard" className="ad-billboard-vaga" />
            </div>

            <Footer />
        </div>
    )
}

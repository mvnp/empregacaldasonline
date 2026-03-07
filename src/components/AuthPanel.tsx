import Link from 'next/link'
import { Briefcase, CheckCircle, Users, Building2, TrendingUp } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Conteúdo por variante
// ─────────────────────────────────────────────────────────────
type AuthVariant = 'candidato' | 'empresa' | 'acesso'

const CONTENT: Record<AuthVariant, {
    headline: string
    sub: string
    features: string[]
    testemunho: { texto: string; autor: string; cargo: string }
}> = {
    candidato: {
        headline: 'Encontre a vaga perfeita para você',
        sub: 'Junte-se a mais de 50.000 profissionais que encontraram oportunidades incríveis pelo PortalJobs.',
        features: [
            'Mais de 5.000 vagas ativas todo mês',
            'Candidatura simplificada em 1 clique',
            'Alertas personalizados por e-mail',
            'Perfil profissional indexado por empresas',
        ],
        testemunho: {
            texto: 'Em menos de 2 semanas encontrei uma vaga remota com salário 40% maior. O processo foi super simples!',
            autor: 'Lucas Carvalho',
            cargo: 'Dev Front-End · Contratado em 10 dias',
        },
    },
    empresa: {
        headline: 'Contrate os melhores talentos',
        sub: 'Mais de 2.000 empresas confiam no PortalJobs para encontrar profissionais qualificados em todo o Brasil.',
        features: [
            'Publicação rápida em menos de 5 minutos',
            'Banco com 50.000+ candidatos ativos',
            'Gestão de candidaturas centralizada',
            'Relatórios e métricas de performance',
        ],
        testemunho: {
            texto: 'Preenchemos 3 vagas sêniores em 15 dias. A qualidade dos candidatos é bem superior ao que esperávamos.',
            autor: 'Mariana Félix',
            cargo: 'Head of People · TechBrasil Ltda.',
        },
    },
    acesso: {
        headline: 'Bem-vindo de volta!',
        sub: 'Acesse sua conta e continue sua jornada no maior portal de empregos do Brasil.',
        features: [
            'Painel com suas candidaturas',
            'Novas vagas recomendadas para você',
            'Mensagens de recrutadores',
            'Atualize seu perfil profissional',
        ],
        testemunho: {
            texto: 'Após criar meu perfil no PortalJobs, comecei a receber propostas diretamente no meu e-mail. Recomendo muito!',
            autor: 'Amanda Soares',
            cargo: 'Analista de Marketing · Agência Crescer',
        },
    },
}

const STATS_CANDIDATO = [
    { icon: Users, valor: '50k+', label: 'Candidatos ativos' },
    { icon: Briefcase, valor: '5k+', label: 'Vagas publicadas' },
    { icon: Building2, valor: '2k+', label: 'Empresas parceiras' },
]
const STATS_EMPRESA = [
    { icon: Building2, valor: '2k+', label: 'Empresas' },
    { icon: Users, valor: '50k+', label: 'Candidatos' },
    { icon: TrendingUp, valor: '94%', label: 'Taxa de match' },
]

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────
export default function AuthPanel({ variant = 'acesso' }: { variant?: AuthVariant }) {
    const c = CONTENT[variant]
    const stats = variant === 'empresa' ? STATS_EMPRESA : STATS_CANDIDATO

    return (
        <div style={{
            position: 'relative',
            background: 'linear-gradient(160deg, #09355F 0%, #0d4278 60%, #0a3560 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2.5rem',
            overflow: 'hidden',
            minHeight: '100vh',
            height: '100%',
        }}>
            {/* Decorações de fundo */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(251,191,83,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(42,185,192,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '40%', right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(254,131,65,0.05)', pointerEvents: 'none' }} />

            {/* ── Top: Logo ── */}
            <div style={{ marginBottom: '1.7rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    <div style={{ width: 38, height: 38, background: '#FBBF53', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(251,191,83,0.3)', flexShrink: 0 }}>
                        <Briefcase style={{ width: 20, height: 20, color: '#09355F' }} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                        Portal<span style={{ color: '#FBBF53' }}>Jobs</span>
                    </span>
                </Link>
            </div>

            {/* ── Middle: Headline + Features ── */}
            <div>

                {/* Headline */}
                <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '0.875rem' }}>
                    {c.headline}
                </h1>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 340 }}>
                    {c.sub}
                </p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {c.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(42,185,192,0.15)', border: '1px solid rgba(42,185,192,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CheckCircle style={{ width: 13, height: 13, color: '#2AB9C0' }} />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f}</span>
                        </li>
                    ))}
                </ul>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                    {stats.map(({ icon: Icon, valor, label }) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.875rem 0.75rem', textAlign: 'center' }}>
                            <Icon style={{ width: 16, height: 16, color: '#FBBF53', margin: '0 auto 0.3rem' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{valor}</p>
                            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: 2, lineHeight: 1.3 }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom: Testemunho ── */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '1.25rem' }}>
                {/* Aspas decorativas */}
                <div style={{ fontSize: '2.5rem', lineHeight: 1, color: '#FBBF53', fontFamily: 'Georgia, serif', marginBottom: '0.25rem', opacity: 0.7 }}>"</div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, marginBottom: '0.875rem', fontStyle: 'italic' }}>
                    {c.testemunho.texto}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #FBBF53, #FE8341)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09355F', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                        {c.testemunho.autor[0]}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{c.testemunho.autor}</p>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{c.testemunho.cargo}</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

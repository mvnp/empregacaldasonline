import { Search, MapPin, Briefcase, Building2, Users, CheckCircle, TrendingUp } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface HeroSectionProps {
    busca: string
    cidade: string
    onBuscaChange: (value: string) => void
    onCidadeChange: (value: string) => void
    onBuscar: () => void
}

// ─────────────────────────────────────────────────────────────
// Dados estáticos do Hero
// ─────────────────────────────────────────────────────────────
const SUGESTOES = ['Desenvolvedor', 'Marketing', 'Vendas', 'Design', 'Engenharia']

const STATS = [
    { icon: Briefcase, valor: '1.200+', label: 'Vagas ativas' },
    { icon: Building2, valor: '350+', label: 'Empresas' },
    { icon: Users, valor: '45k+', label: 'Candidatos' },
    { icon: CheckCircle, valor: '8.500+', label: 'Contratações' },
]

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────
export default function HeroSection({ busca, cidade, onBuscaChange, onCidadeChange, onBuscar }: HeroSectionProps) {
    return (
        <section className="hero-bg">
            <div
                className="hero-content"
                style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 2rem',
                    minHeight: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingTop: 120,
                    paddingBottom: 60,
                }}
            >
                {/* Badge */}
                <div className="anim-fade-up" style={{ marginBottom: '1.25rem' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.35rem 1rem', borderRadius: 9999,
                        fontSize: '0.75rem', fontWeight: 700,
                        background: 'rgba(251,191,83,0.18)', color: '#FBBF53',
                        border: '1px solid rgba(251,191,83,0.3)',
                    }}>
                        <TrendingUp style={{ width: 14, height: 14 }} />
                        +1.200 vagas disponíveis hoje
                    </span>
                </div>

                {/* Título */}
                <h1
                    className="anim-fade-up d-100"
                    style={{
                        fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
                        fontWeight: 900, color: '#fff',
                        lineHeight: 1.1, maxWidth: 700,
                        marginBottom: '1.25rem',
                    }}
                >
                    Encontre o emprego{' '}
                    <span style={{
                        backgroundImage: 'linear-gradient(135deg, #FBBF53, #FE8341)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                        que você merece
                    </span>
                </h1>

                {/* Subtítulo */}
                <p
                    className="anim-fade-up d-200"
                    style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.72)', maxWidth: 480, marginBottom: '2.25rem', lineHeight: 1.65 }}
                >
                    Conectamos profissionais às melhores empresas do Brasil.
                    Oportunidades de CLT, PJ, estágio e muito mais.
                </p>

                {/* Barra de busca */}
                <div className="anim-fade-up d-300" style={{ maxWidth: 780 }}>
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(14px)',
                        borderRadius: 16, border: '1px solid rgba(255,255,255,0.18)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    }}>
                        {/* Campo: Cargo */}
                        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9aabb8', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                className="input-hero"
                                placeholder="Cargo, empresa ou área..."
                                value={busca}
                                onChange={e => onBuscaChange(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>

                        {/* Divisor vertical */}
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' }} />

                        {/* Campo: Cidade */}
                        <div style={{ position: 'relative', flex: '0 1 200px', minWidth: 160 }}>
                            <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9aabb8', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                className="input-hero"
                                placeholder="Cidade ou Remoto"
                                value={cidade}
                                onChange={e => onCidadeChange(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>

                        {/* Botão buscar */}
                        <button
                            className="btn-primary anim-pulse-ring"
                            onClick={onBuscar}
                            style={{ padding: '0 1.75rem', height: 52, fontSize: '1rem', borderRadius: 10, flexShrink: 0 }}
                        >
                            <Search style={{ width: 18, height: 18 }} />
                            Buscar Vagas
                        </button>
                    </div>

                    {/* Sugestões de busca */}
                    <div style={{ marginTop: '0.875rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>Popular:</span>
                        {SUGESTOES.map(s => (
                            <button
                                key={s}
                                onClick={() => onBuscaChange(s)}
                                style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2.5rem' }}>
                    {STATS.map(({ icon: Icon, valor, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Icon style={{ width: 15, height: 15, color: '#2AB9C0' }} />
                            <strong style={{ color: '#fff', fontSize: '0.875rem' }}>{valor}</strong>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

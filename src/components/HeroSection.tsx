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
                        fontSize: 'clamp(2.4rem, 5vw, 4.25rem)',
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
                <div className="anim-fade-up d-300" style={{ maxWidth: 940, width: '100%' }}>
                    <div className="hero-search-container" style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.75rem', width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(14px)',
                        borderRadius: 16, border: '1px solid rgba(255,255,255,0.18)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    }}>
                        {/* Campo: Cargo */}
                        <div className="hero-search-item" style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
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

                        {/* Campo: Cidade */}
                        <div className="hero-search-item" style={{ position: 'relative', flex: '0 1 200px', minWidth: 160 }}>
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
                            className="btn-primary anim-pulse-ring hero-search-btn"
                            onClick={onBuscar}
                            style={{ padding: '0 1.75rem', height: 52, fontSize: '1rem', borderRadius: 10, flexShrink: 0 }}
                        >
                            <Search style={{ width: 18, height: 18 }} />
                            Buscar Vagas
                        </button>

                        <a
                            href="https://chat.whatsapp.com/KIYDOOBhx9LLc9hWOKmFOE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-search-btn-whatsapp"
                            style={{
                                padding: '0 1.5rem',
                                height: 52,
                                borderRadius: 10,
                                background: '#25D366',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                border: 'none',
                                flexShrink: 0
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Entrar no Grupo
                        </a>
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

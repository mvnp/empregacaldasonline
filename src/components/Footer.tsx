import Link from 'next/link'
import { Briefcase, Instagram, Linkedin, Facebook, Twitter, Mail, Phone, ArrowRight } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Dados do footer — edite aqui para atualizar os links
// ─────────────────────────────────────────────────────────────
const LINKS_CANDIDATOS = [
    { label: 'Buscar Vagas', href: '/vagas' },
    { label: 'Vagas em Destaque', href: '/vagas?destaque=true' },
    { label: 'Vagas Remotas', href: '/vagas?modalidade=Remoto' },
    { label: 'Cadastrar Currículo', href: '/curriculo' },
    { label: 'Dicas de Carreira', href: '/blog' },
    { label: 'Salários & Mercado', href: '/salarios' },
]

const LINKS_EMPRESAS = [
    { label: 'Publicar Vaga Grátis', href: '/publicar-vaga' },
    { label: 'Planos e Preços', href: '/planos' },
    { label: 'Banco de Talentos', href: '/talentos' },
    { label: 'Gestão de Candidatos', href: '/admin' },
    { label: 'Área do Recrutador', href: '/admin/login' },
    { label: 'Cases de Sucesso', href: '/cases' },
]

const REDES_SOCIAIS = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
]

const LINKS_LEGAIS = ['Termos de Uso', 'Privacidade', 'Cookies']

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────
export default function Footer() {
    return (
        <footer>

            {/* Bloco principal — 4 colunas */}
            <div style={{ background: '#09355F', padding: '4rem 2rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>

                    {/* Coluna 1: Marca + redes sociais */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <div style={{ width: 36, height: 36, background: '#FBBF53', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Briefcase style={{ width: 18, height: 18, color: '#09355F' }} />
                            </div>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>
                                Portal<span style={{ color: '#FBBF53' }}>Jobs</span>
                            </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                            Conectamos talentos às melhores empresas do Brasil. Seu próximo emprego começa aqui.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {REDES_SOCIAIS.map(({ icon: Icon, label, href }) => (
                                <a key={label} href={href} className="social-btn" aria-label={label}>
                                    <Icon style={{ width: 16, height: 16 }} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 2: Para Candidatos */}
                    <div>
                        <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            Para Candidatos
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {LINKS_CANDIDATOS.map(({ label, href }) => (
                                <Link key={label} href={href} className="footer-link">
                                    <ArrowRight style={{ width: 13, height: 13, color: '#FBBF53' }} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 3: Para Empresas */}
                    <div>
                        <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            Para Empresas
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {LINKS_EMPRESAS.map(({ label, href }) => (
                                <Link key={label} href={href} className="footer-link footer-link-orange">
                                    <ArrowRight style={{ width: 13, height: 13, color: '#FE8341' }} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 4: Contato */}
                    <div>
                        <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            Contato
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Mail style={{ width: 16, height: 16, color: '#2AB9C0', flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>E-mail</span>
                                    <a href="mailto:contato@portaljobs.com.br" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                                        contato@portaljobs.com.br
                                    </a>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Phone style={{ width: 16, height: 16, color: '#2AB9C0', flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>WhatsApp</span>
                                    <a href="tel:+551140028922" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                                        (11) 4002-8922
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '0.875rem 1rem', background: 'rgba(251,191,83,0.08)', border: '1px solid rgba(251,191,83,0.2)', borderRadius: 10 }}>
                            <p style={{ color: '#FBBF53', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.25rem' }}>🕐 Atendimento</p>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>Seg–Sex, das 9h às 18h</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Barra de copyright — linha inteira */}
            <div style={{ background: '#062540', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
                        © {new Date().getFullYear()} PortalJobs. Todos os direitos reservados.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {LINKS_LEGAIS.map(item => (
                            <Link key={item} href="#" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </footer>
    )
}

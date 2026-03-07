import Link from 'next/link'
import {
    Briefcase, MapPin, Monitor, TrendingUp, DollarSign,
    Calendar, Users, Globe, Mail, MessageCircle,
    Building2, CheckCircle, Clock,
} from 'lucide-react'
import { VagaDetalhe } from '@/data/vagas'
import { getBadgeModalidade, getBadgeContrato, getAvatarColor } from '@/lib/helpers'

interface VagaDetailSidebarProps {
    vaga: VagaDetalhe
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: linha de spec
// ─────────────────────────────────────────────────────────────
function SpecRow({ icon: Icon, label, value, color = '#2AB9C0' }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    value: string
    color?: string
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f4f8' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a2332' }}>{value}</span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function VagaDetailSidebar({ vaga }: VagaDetailSidebarProps) {
    const diasParaExpirar = Math.ceil(
        (new Date(vaga.dataExpiracao).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    const expiracaoLabel = diasParaExpirar > 0 ? `${diasParaExpirar} dias restantes` : 'Expirada'
    const expiracaoCor = diasParaExpirar <= 7 ? '#FE8341' : '#10b981'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── Card: CTA Principal ── */}
            <div style={{ background: '#09355F', borderRadius: 16, padding: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                {/* Decoração de fundo */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(251,191,83,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(42,185,192,0.08)' }} />

                <div style={{ position: 'relative' }}>
                    {/* Avatar empresa */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: getAvatarColor(vaga.empresa), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                            {vaga.empresa[0]}
                        </div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{vaga.empresa}</p>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{vaga.setorEmpresa}</p>
                        </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        <span className={getBadgeContrato(vaga.contrato)}>{vaga.contrato}</span>
                        <span className={getBadgeModalidade(vaga.modalidade)}>{vaga.modalidade}</span>
                    </div>

                    {/* Salário */}
                    <div style={{ background: 'rgba(251,191,83,0.12)', border: '1px solid rgba(251,191,83,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#FBBF53', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Remuneração</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FBBF53' }}>{vaga.salario}</p>
                    </div>

                    {/* Botão candidatar */}
                    {vaga.whatsapp && (
                        <a
                            href={`https://wa.me/${vaga.whatsapp}?text=Olá! Vi a vaga de ${encodeURIComponent(vaga.titulo)} e tenho interesse.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', borderRadius: 10, marginBottom: '0.5rem' }}
                        >
                            <MessageCircle style={{ width: 18, height: 18 }} />
                            Candidatar via WhatsApp
                        </a>
                    )}
                    {vaga.email && (
                        <a
                            href={`mailto:${vaga.email}?subject=Candidatura: ${vaga.titulo}`}
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', borderRadius: 10, background: '#FBBF53', color: '#1c405f', border: 'none' }}
                        >
                            <Mail style={{ width: 16, height: 16 }} />
                            Se Candidatar
                        </a>
                    )}
                </div>
            </div>

            {/* ── Card: Especificações ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F' }}>Detalhes da Vaga</h3>
                </div>
                <div style={{ padding: '0 1.25rem' }}>
                    <SpecRow icon={Briefcase} label="Tipo de Contrato" value={vaga.contrato} color="#09355F" />
                    <SpecRow icon={Monitor} label="Modalidade" value={vaga.modalidade} color="#2AB9C0" />
                    <SpecRow icon={TrendingUp} label="Nível" value={vaga.nivel} color="#FE8341" />
                    <SpecRow icon={MapPin} label="Localização" value={vaga.local} color="#2AB9C0" />
                    <SpecRow icon={Building2} label="Área" value={vaga.area} color="#09355F" />
                    <SpecRow icon={DollarSign} label="Salário" value={vaga.salario} color="#10b981" />
                    <SpecRow icon={Users} label="Candidaturas" value={`${vaga.candidaturas} candidatos`} color="#FBBF53" />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${expiracaoCor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Clock style={{ width: 16, height: 16, color: expiracaoCor }} />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Expira em</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: expiracaoCor }}>{expiracaoLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Card: Sobre a empresa ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F' }}>Sobre a Empresa</h3>
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{vaga.setorEmpresa}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Users style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{vaga.tamanhoEmpresa}</span>
                    </div>
                    {vaga.website && (
                        <a
                            href={vaga.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#2AB9C0', textDecoration: 'none', fontWeight: 600 }}
                        >
                            <Globe style={{ width: 14, height: 14 }} />
                            Visitar site da empresa
                        </a>
                    )}
                </div>
            </div>

            {/* ── Card: Compartilhar ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F' }}>Compartilhar Vaga</h3>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
                    {[
                        { label: 'WhatsApp', bg: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(`Vi essa vaga: ${vaga.titulo} em ${vaga.empresa}`)}` },
                        { label: 'LinkedIn', bg: '#0077B5', href: '#' },
                        { label: 'Copiar link', bg: '#09355F', href: '#' },
                    ].map(({ label, bg, href }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                flex: 1, padding: '0.5rem 0.25rem', borderRadius: 8,
                                background: bg, color: '#fff', fontSize: '0.72rem',
                                fontWeight: 700, textAlign: 'center', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Link: voltar ── */}
            <Link
                href="/vagas"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', padding: '0.5rem' }}
            >
                ← Ver todas as vagas
            </Link>

        </div>
    )
}

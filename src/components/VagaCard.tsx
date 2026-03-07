import Link from 'next/link'
import { Building2, MapPin, Briefcase, Clock, Star, ArrowRight } from 'lucide-react'
import { VagaItem } from '@/data/vagas'
import { getBadgeModalidade, getBadgeContrato, formatarDiasAtras, getAvatarColor } from '@/lib/helpers'

interface VagaCardProps {
    vaga: VagaItem
}

export default function VagaCard({ vaga }: VagaCardProps) {
    return (
        <article className="card-vaga">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

                {/* Avatar da empresa */}
                <div style={{
                    width: 48, height: 48,
                    borderRadius: 12,
                    background: getAvatarColor(vaga.empresa),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                    {vaga.empresa[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Título + badge destaque */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#09355F', lineHeight: 1.35 }}>
                            {vaga.titulo}
                        </h3>
                        {vaga.destaque && (
                            <span className="badge badge-destaque" style={{ fontSize: '0.68rem' }}>
                                <Star style={{ width: 10, height: 10 }} />
                                Destaque
                            </span>
                        )}
                    </div>

                    {/* Empresa + localização */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                            <Building2 style={{ width: 13, height: 13, color: '#2AB9C0' }} />
                            {vaga.empresa}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <MapPin style={{ width: 13, height: 13, color: '#94a3b8' }} />
                            {vaga.local}
                        </span>
                    </div>

                    {/* Badges: contrato, modalidade, nível, salário */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                        <span className={getBadgeContrato(vaga.contrato)}>
                            <Briefcase style={{ width: 10, height: 10 }} />
                            {vaga.contrato}
                        </span>
                        <span className={getBadgeModalidade(vaga.modalidade)}>
                            {vaga.modalidade}
                        </span>
                        <span className="badge badge-level">{vaga.nivel}</span>
                        <span className="badge badge-salary">{vaga.salario}</span>
                    </div>

                    {/* Rodapé: data + botão */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <Clock style={{ width: 13, height: 13 }} />
                            {formatarDiasAtras(vaga.diasAtras)}
                        </span>
                        <Link
                            href={`/vagas/${vaga.id}`}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: 8 }}
                        >
                            Ver detalhes
                            <ArrowRight style={{ width: 15, height: 15 }} />
                        </Link>
                    </div>

                </div>
            </div>
        </article>
    )
}

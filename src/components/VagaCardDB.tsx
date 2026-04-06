import Link from 'next/link'
import { Building2, MapPin, Briefcase, Clock, Star, ArrowRight } from 'lucide-react'
import { VagaPublica } from '@/actions/vagas'
import { getAvatarColor } from '@/lib/helpers'

// ── Helpers locais ────────────────────────────────────────────

/** Capitaliza e formata modalidade para exibição */
function formatModalidade(m: string): string {
    const map: Record<string, string> = {
        remoto: 'Remoto',
        hibrido: 'Híbrido',
        presencial: 'Presencial',
    }
    return map[m] ?? m
}

/** CSS class para badge de modalidade */
function getBadgeModalidade(m: string): string {
    const map: Record<string, string> = {
        remoto: 'badge badge-remoto',
        hibrido: 'badge badge-hibrido',
        presencial: 'badge badge-presencial',
    }
    return map[m] ?? 'badge badge-presencial'
}

/** Capitaliza contrato */
function formatContrato(c: string | null): string {
    if (!c) return ''
    const map: Record<string, string> = {
        clt: 'CLT',
        pj: 'PJ',
        estagio: 'Estágio',
        temporario: 'Temporário',
        freelancer: 'Freelancer',
    }
    return map[c] ?? c.toUpperCase()
}

/** CSS class para badge de contrato */
function getBadgeContrato(c: string | null): string {
    return c === 'pj' ? 'badge badge-pj' : 'badge badge-clt'
}

/** Capitaliza nível */
function formatNivel(n: string | null): string {
    if (!n) return ''
    const map: Record<string, string> = {
        estagio: 'Estágio',
        junior: 'Júnior',
        pleno: 'Pleno',
        senior: 'Sênior',
        gerente: 'Gerente',
        diretor: 'Diretor',
    }
    return map[n] ?? n
}

/** Formata salário a partir de min/max numéricos */
function formatSalario(min: number | null, max: number | null, mostrar: boolean, a_combinar?: boolean, empresa?: string): string {
    if (empresa === 'Empresa: Cadastre-se ou faça login') return 'R$ **,***.**'
    if (!mostrar) return 'A combinar'
    if (a_combinar) return 'Salário a combinar'
    if (!min && !max) return 'A combinar'
    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    if (min && max) return `${fmt(min)} – ${fmt(max)}`
    if (min) return `A partir de ${fmt(min)}`
    if (max) return `Até ${fmt(max)}`
    return 'A combinar'
}

/** Dias desde created_at */
function diasAtras(created_at: string): string {
    const diff = Math.floor((Date.now() - new Date(created_at).getTime()) / 86_400_000)
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Ontem'
    return `${diff} dias atrás`
}

// ── Componente ────────────────────────────────────────────────

interface VagaCardDBProps {
    vaga: VagaPublica
}

export default function VagaCardDB({ vaga }: VagaCardDBProps) {
    return (
        <article className="card-vaga">
            {/* Linha 1: Avatar + Titulo */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09355F', lineHeight: 1.35 }}>
                            {vaga.titulo}
                        </h3>
                        {vaga.destaque && (
                            <span className="badge badge-destaque" style={{ fontSize: '0.68rem' }}>
                                <Star style={{ width: 10, height: 10 }} />
                                Destaque
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Linha 2: Conteúdo 100% width */}
            <div style={{ width: '100%' }}>
                {/* Empresa + localização ou BLOQUEADO */}
                {vaga.empresa !== 'Empresa: Cadastre-se ou faça login' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                            <Building2 style={{ width: 13, height: 13, color: '#2AB9C0' }} />
                            {vaga.empresa}
                        </span>
                        {vaga.local && (
                            <>
                                <span style={{ color: '#cbd5e1' }}>·</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                                    <MapPin style={{ width: 13, height: 13, color: '#94a3b8' }} />
                                    {vaga.local}
                                </span>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', border: '1.4px dashed #cbd5e1', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>
                            <strong style={{ color: '#09355F' }}>Empresa:</strong>{' '}
                            <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>Cadastre-se</Link> ou faça{' '}
                            <Link href="/login" style={{ color: '#2AB9C0', textDecoration: 'none', outline: 'none' }}>login</Link>
                        </div>
                        <div><strong style={{ color: '#09355F' }}>Telefone/WhatsApp:</strong> (64) *****-*****</div>
                        <div><strong style={{ color: '#09355F' }}>E-mail:</strong> **********@ecn.online</div>
                    </div>
                )}

                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {vaga.tipo_contrato && (
                        <span className={getBadgeContrato(vaga.tipo_contrato)}>
                            <Briefcase style={{ width: 10, height: 10 }} />
                            {formatContrato(vaga.tipo_contrato)}
                        </span>
                    )}
                    <span className={getBadgeModalidade(vaga.modalidade)}>
                        {formatModalidade(vaga.modalidade)}
                    </span>
                    {vaga.nivel && (
                        <span className="badge badge-level">{formatNivel(vaga.nivel)}</span>
                    )}
                    <span className="badge badge-salary">
                        {formatSalario(vaga.salario_min, vaga.salario_max, vaga.mostrar_salario, vaga.salario_a_combinar, vaga.empresa)}
                    </span>
                </div>

                {/* Rodapé */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <Clock style={{ width: 13, height: 13 }} />
                        {diasAtras(vaga.created_at)}
                    </span>
                    <Link
                        href={`/vagas/${vaga.id}`}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: 8, textDecoration: 'none', outline: 'none' }}
                    >
                        Ver detalhes
                        <ArrowRight style={{ width: 15, height: 15 }} />
                    </Link>
                </div>
            </div>
        </article>
    )
}

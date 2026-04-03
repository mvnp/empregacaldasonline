import Link from 'next/link'
import { Building2, MapPin, Briefcase } from 'lucide-react'

interface EmpresaCardProps {
    id: string | number
    nome: string
    local: string
    status?: string // 'ativa' | 'inativa' | 'pendente'
    vagasTotais?: number | string
    vagasAtivas?: number | string
    tipoUsuario: 'admin' | 'empregador' | 'candidato'
}

export default function EmpresaCard({ id, nome, local, status = 'ativa', vagasTotais = 0, vagasAtivas = 0, tipoUsuario }: EmpresaCardProps) {
    const isAtiva = status === 'ativa'
    
    // Configurações específicas por tipo de usuário
    let backgroundGradient = 'linear-gradient(135deg, #e8edf5, #cbd5e1)'
    let tag = { bg: '#f0f4f8', color: '#64748b', text: status }
    let primaryAction = null
    let statusText = 'Vagas Totais'
    let statusValue = vagasTotais

    if (tipoUsuario === 'candidato') {
        backgroundGradient = 'linear-gradient(135deg, #09355F, #2AB9C0)' // Padrão colorido
        tag = { bg: '#f0f4f8', color: '#64748b', text: 'Parceira' }
        statusValue = vagasAtivas
        statusText = 'Vagas ativas'
        primaryAction = {
            label: 'Ver vagas',
            href: `/admin/candidato/vagas?empresa=${id}`,
            color: '#FE8341'
        }
    } else if (tipoUsuario === 'empregador') {
        backgroundGradient = 'linear-gradient(135deg, #FBBF53, #FE8341)' // Empregador
        tag = {
            bg: isAtiva ? '#dcfce7' : '#fef2f2',
            color: isAtiva ? '#16a34a' : '#dc2626',
            text: isAtiva ? 'Ativa' : 'Inativa'
        }
        statusValue = vagasTotais
        statusText = 'Vagas Criadas'
        primaryAction = {
            label: 'Gerenciar',
            href: `/admin/empregador/vagas?empresa=${id}`,
            color: '#2AB9C0'
        }
    } else {
        // Admin
        backgroundGradient = 'linear-gradient(135deg, #09355F, #062340)'
        tag = {
            bg: isAtiva ? '#2AB9C020' : '#dc262620',
            color: isAtiva ? '#2AB9C0' : '#dc2626',
            text: isAtiva ? 'Autorizada' : 'Bloqueada'
        }
        statusValue = vagasTotais
        statusText = 'Total de Vagas'
        primaryAction = {
            label: 'Detalhes Cadastrais',
            href: `/admin/empresas/${id}`,
            color: '#09355F'
        }
    }

    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '1.25rem',
            border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
            transition: 'border-color 0.18s, box-shadow 0.18s', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: 14, right: 14 }}>
                <span style={{
                    padding: '3px 10px', borderRadius: 9999,
                    fontSize: '0.68rem', fontWeight: 700,
                    background: tag.bg, color: tag.color,
                }}>
                    {tag.text}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: backgroundGradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Building2 style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <div style={{ minWidth: 0, paddingRight: 40 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {nome}
                    </h3>
                    {local && (
                        <p style={{ fontSize: '0.78rem', color: '#FE8341', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                            <MapPin style={{ width: 12, height: 12 }} /> {local}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{statusValue}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>{statusText}</p>
                </div>
                {tipoUsuario === 'candidato' && (
                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#09355F', lineHeight: 1 }}>{isAtiva ? '✓' : '✗'}</p>
                        <p style={{ fontSize: '0.65rem', color: isAtiva ? '#16a34a' : '#94a3b8', marginTop: 2 }}>{isAtiva ? 'Verificada' : 'Em Avaliação'}</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f0f4f8' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    <Briefcase style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Operações
                </span>
                
                {primaryAction && (
                    <Link href={primaryAction.href} style={{
                        background: 'none', border: '1.5px solid #e8edf5', borderRadius: 8,
                        padding: '0.3rem 0.7rem', cursor: 'pointer',
                        fontSize: '0.72rem', fontWeight: 600, color: primaryAction.color,
                        textDecoration: 'none',
                    }}>
                        {primaryAction.label}
                    </Link>
                )}
            </div>
        </div>
    )
}

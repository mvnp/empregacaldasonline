'use client'

import { useState, useEffect } from 'react'
import { listarEmpresasPublicas } from '@/actions/empresas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Building2, ArrowRight } from 'lucide-react'
import EmpresaCard from '@/components/admin/EmpresaCard'

// Posições (0-based) onde injetar anúncio: posição 3→2, 7→6, 14→13
const AD_POSITIONS = new Set([2, 6, 13])

type Empresa = any
type ListItem =
    | { type: 'empresa'; data: Empresa }
    | { type: 'ad'; key: string }

function buildItems(empresas: Empresa[]): ListItem[] {
    const items: ListItem[] = []
    let empIdx = 0
    for (let i = 0; empIdx < empresas.length; i++) {
        if (AD_POSITIONS.has(i)) {
            items.push({ type: 'ad', key: `ad-${i}` })
        } else {
            items.push({ type: 'empresa', data: empresas[empIdx] })
            empIdx++
        }
    }
    return items
}

export default function EmpresasCandidatoPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listarEmpresasPublicas()
            .then(data => setEmpresas(data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <AdminPageHeader
                titulo="Empresas"
                subtitulo={loading ? 'Carregando...' : `${empresas.length} empresas disponíveis`}
            />

            {loading ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>Carregando empresas...</div>
            ) : empresas.length === 0 ? (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: 14, textAlign: 'center', color: '#64748b' }}>
                    <Building2 style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhuma empresa parceira disponível no momento.</p>
                </div>
            ) : (
                <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {buildItems(empresas).map((item) => {
                        if (item.type === 'ad') {
                            return <AdNativeCard key={item.key} />
                        }
                        const e = item.data
                        const vagasAtivas = e.vagas?.filter((v: any) => v.status === 'ativa').length || 0
                        return (
                            <EmpresaCard
                                key={e.id}
                                id={e.id}
                                nome={e.nome_fantasia || e.razao_social}
                                local={e.local}
                                status={e.status}
                                vagasAtivas={vagasAtivas}
                                tipoUsuario="candidato"
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// Card de anúncio nativo — mesmo tamanho dos EmpresaCards
function AdNativeCard() {
    const [ad, setAd] = useState<any>(null)

    useEffect(() => {
        fetch('/api/ads?formato=rectangle')
            .then(r => r.json())
            .then(d => { if (d.active && d.ad) setAd(d.ad) })
            .catch(() => {})
    }, [])

    if (!ad) return null

    return (
        <a
            href={ad.pub.link_destino}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                background: '#fff', borderRadius: 14,
                border: '1.5px solid rgba(251,191,83,0.3)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(251,191,83,0.08)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
        >
            {/* Imagem */}
            <div style={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0 }}>
                <img
                    src={ad.arquivo_url}
                    alt="Publicidade"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span style={{
                    position: 'absolute', top: 8, right: 8, fontSize: '0.6rem',
                    background: 'rgba(255,255,255,0.92)', padding: '2px 8px',
                    borderRadius: 4, color: '#64748b', fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                }}>Patrocinado</span>
            </div>

            {/* Info */}
            <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF53', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09355F' }}>
                        {ad.pub.empresas?.nome_fantasia || 'Parceiro Emprega Caldas'}
                    </span>
                </div>
                <span style={{
                    display: 'inline-block', padding: '2px 8px',
                    background: 'rgba(251,191,83,0.15)', color: '#d97706',
                    borderRadius: 9999, fontSize: '0.65rem', fontWeight: 800,
                    textTransform: 'uppercase', width: 'fit-content'
                }}>
                    Publicidade
                </span>
                <p style={{
                    fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5,
                    margin: 0, overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                    Conteúdo patrocinado. Clique para conhecer mais sobre esse parceiro.
                </p>
                <span style={{
                    marginTop: 'auto', fontSize: '0.78rem', fontWeight: 600,
                    color: '#2AB9C0', display: 'flex', alignItems: 'center', gap: '0.2rem'
                }}>
                    Saiba mais <ArrowRight style={{ width: 11, height: 11 }} />
                </span>
            </div>
        </a>
    )
}

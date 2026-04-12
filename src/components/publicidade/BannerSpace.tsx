'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

interface BannerSpaceProps {
    formato: 'rectangle' | 'leaderboard' | 'billboard' | 'native'
    className?: string
    style?: React.CSSProperties
    slotFallback?: React.ReactNode
    imageColWidth?: number
    onNoAd?: () => void // Callback quando não há anúncio ativo
}

export default function BannerSpace({ formato, className = '', style = {}, slotFallback = null, imageColWidth, onNoAd }: BannerSpaceProps) {
    const [ad, setAd] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/ads?formato=${formato}`)
            .then(res => res.json())
            .then(data => {
                if (data.active && data.ad) {
                    setAd(data.ad)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [formato])

    useEffect(() => {
        if (!loading && !ad) {
            onNoAd?.()
        }
    }, [loading, ad])

    if (loading) return null
    if (!ad) {
        return slotFallback as React.ReactElement | null
    }

    const dimsContext = {
        rectangle: { width: '100%', maxWidth: 300, aspectRatio: '300/250' },
        leaderboard: { width: '100%', maxWidth: 970, aspectRatio: '970/90' },
        billboard: { width: '100%', maxWidth: 970, aspectRatio: '970/250' },
        native: { width: '100%' }
    }
    const dims = dimsContext[formato]

    if (formato === 'native') {
        const defaultImgWidth = imageColWidth || 280;
        return (
            <a 
                href={ad.pub.link_destino} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`ad-banner-space ${className}`}
                style={{ 
                    display: 'flex', 
                    background: '#fff',
                    borderRadius: 16,
                    border: '1.5px solid #e8edf5',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    textDecoration: 'none',
                    ...dims,
                    ...style 
                }}
            >
                {/* Lado Esquerdo - Textos */}
                <div style={{ flex: 1, padding: '1.25rem', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        {/* Primeira linha: Nome da empresa */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF53' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09355F' }}>
                                {ad.pub.empresas?.nome_fantasia || 'Parceiro Emprega Caldas'}
                            </span>
                        </div>
                        {/* Segunda linha: palavra Publicidade (estilo categoria) */}
                        <span style={{ display: 'inline-block', padding: '2px 10px', background: 'rgba(251, 191, 83, 0.15)', color: '#FBBF53', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Publicidade
                        </span>
                        {/* Terceira linha: Texto de 2 linhas */}
                        <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
                            Espaço reservado para comunicação patrocinada. Acesse o conteúdo dessa empresa parceira para descobrir novas oportunidades de negócio e carreira.
                        </p>
                    </div>
                    {/* Quarta linha: data, hora, Clique e saiba mais */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <Calendar style={{ width: 12, height: 12 }} /> {new Date().toLocaleDateString('pt-BR')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <Clock style={{ width: 12, height: 12 }} /> {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            Clique e saiba mais <ArrowRight style={{ width: 12, height: 12 }} />
                        </span>
                    </div>
                </div>

                {/* Lado Direito - Imagem */}
                <div style={{ width: '100%', maxWidth: defaultImgWidth, flexShrink: 0, position: 'relative' }}>
                    <img 
                        src={ad.arquivo_url} 
                        alt="Conteúdo Patrocinado" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                    <span style={{
                        position: 'absolute', top: 12, right: 12, fontSize: '0.65rem', 
                        background: 'rgba(255,255,255,0.95)', padding: '4px 10px', 
                        borderRadius: 6, color: '#64748b', fontWeight: 700,
                        backdropFilter: 'blur(4px)', zIndex: 10,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        Patrocinado
                    </span>
                </div>
            </a>
        );
    }

    return (
        <a 
            href={ad.pub.link_destino} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`ad-banner-space ${className}`}
            style={{ 
                display: 'block', 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                marginLeft: 'auto',
                marginRight: 'auto',
                ...dims,
                ...style 
            }}
            title="Patrocinado"
        >
            <span style={{
                position: 'absolute', top: 4, right: 6, fontSize: '0.6rem', 
                background: 'rgba(255,255,255,0.9)', padding: '2px 6px', 
                borderRadius: 4, color: '#64748b', fontWeight: 600,
                backdropFilter: 'blur(2px)', zIndex: 10
            }}>
                Patrocinado
            </span>
            <img 
                src={ad.arquivo_url} 
                alt="Banner Publicitário" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
        </a>
    )
}

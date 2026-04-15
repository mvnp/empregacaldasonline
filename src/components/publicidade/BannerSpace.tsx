'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { registrarClickPublicidade } from '@/actions/publicidade'

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

    const handleAdClick = () => {
        if (!ad) return;

        let formatoCompleto = formato as string;
        if (formato === 'rectangle') formatoCompleto = 'rectangle_300x250';
        if (formato === 'leaderboard') formatoCompleto = 'leaderboard_970x90';
        if (formato === 'billboard') formatoCompleto = 'billboard_970x250';
        if (formato === 'native') formatoCompleto = 'native_flex_300x300';

        registrarClickPublicidade({
            pub_id: ad.pub.id,
            empresa_id: ad.pub.empresa_id,
            formato: formatoCompleto,
            page: window.location.href
        }).catch(err => console.error('Erro ao registrar clique:', err));
    };

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
            <>
                <style>{`
                .ad-banner-native {
                    display: flex;
                    flex-direction: row;
                    background: #fff;
                    border-radius: 16px;
                    border: 1.5px solid #e8edf5;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    overflow: hidden;
                    position: relative;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    text-decoration: none;
                    width: 100%;
                }
                .ad-banner-native-text {
                    flex: 1;
                    padding: 1.25rem;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    order: 1;
                }
                .ad-banner-native-img {
                    width: 100%;
                    max-width: ${defaultImgWidth}px;
                    flex-shrink: 0;
                    position: relative;
                    order: 2;
                }
                @media (max-width: 768px) {
                    .ad-banner-native {
                        flex-direction: column;
                        height: auto !important;
                    }
                    .ad-banner-native-img {
                        max-width: 100%;
                        height: auto;
                        aspect-ratio: 16 / 9;
                        order: 1;
                    }
                    .ad-banner-native-text {
                        order: 2;
                    }
                }
            `}</style>
                <a
                    href={ad.pub.link_destino}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ad-banner-space ad-banner-native ${className}`}
                    style={style}
                    onClick={handleAdClick}
                >
                    {/* Textos */}
                    <div className="ad-banner-native-text">
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

                    {/* Imagem */}
                    <div className="ad-banner-native-img">
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
            </>
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
            onClick={handleAdClick}
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

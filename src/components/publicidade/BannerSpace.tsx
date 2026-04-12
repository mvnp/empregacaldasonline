'use client'

import React, { useEffect, useState } from 'react'

interface BannerSpaceProps {
    formato: 'rectangle' | 'leaderboard' | 'billboard' | 'native'
    className?: string
    style?: React.CSSProperties
    slotFallback?: React.ReactNode
}

export default function BannerSpace({ formato, className = '', style = {}, slotFallback = null }: BannerSpaceProps) {
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

    if (loading) return null // Hide while loading to avoid layout shifts if possible, or render placeholder
    if (!ad) return slotFallback

    const dimsContext = {
        rectangle: { width: '100%', maxWidth: 300, aspectRatio: '300/250' },
        leaderboard: { width: '100%', maxWidth: 970, aspectRatio: '970/90' },
        billboard: { width: '100%', maxWidth: 970, aspectRatio: '970/250' },
        native: { width: '100%', aspectRatio: 'auto' }
    }
    const dims = dimsContext[formato]

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
                border: formato !== 'native' ? '1px solid #e2e8f0' : 'none',
                boxShadow: formato !== 'native' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
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

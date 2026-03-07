import React from 'react'

interface DetailMiniInfoProps {
    icon: React.ElementType
    label: string
    value: string
}

/**
 * Par label-value lado a lado com ícone.
 * Usado nos resumos rápidos das sidebars.
 */
export default function DetailMiniInfo({ icon: Icon, label, value }: DetailMiniInfoProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Icon style={{ width: 14, height: 14 }} /> {label}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09355F' }}>{value}</span>
        </div>
    )
}

import React from 'react'

interface DetailInfoRowProps {
    icon: React.ElementType
    label: string
}

/**
 * Linha de informação com ícone (contato, endereço, etc).
 * Usado nas sidebars de candidato e empresa.
 */
export default function DetailInfoRow({ icon: Icon, label }: DetailInfoRowProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
            <Icon style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0, marginTop: 2 }} />
            <span style={{ wordBreak: 'break-word' }}>{label}</span>
        </div>
    )
}

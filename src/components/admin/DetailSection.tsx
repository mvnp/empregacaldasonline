import React from 'react'

interface DetailSectionProps {
    icon?: React.ElementType
    titulo?: string
    extra?: React.ReactNode
    children: React.ReactNode
    /** Se false, não renderiza o header (seção só com body) */
    semHeader?: boolean
}

/**
 * Container de seção padronizado para páginas de detalhe.
 * Encapsula card branco + header com ícone + título.
 */
export default function DetailSection({ icon: Icon, titulo, extra, children, semHeader }: DetailSectionProps) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5',
            overflow: 'hidden', marginBottom: '1.25rem',
        }}>
            {!semHeader && titulo && (
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    {Icon && <Icon style={{ width: 18, height: 18 }} />}
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0 }}>{titulo}</h2>
                    {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
                </div>
            )}
            {children}
        </div>
    )
}

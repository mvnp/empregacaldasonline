import { type ReactNode } from 'react'

interface AdminPageHeaderProps {
    titulo: string
    subtitulo: string
    acao?: ReactNode
}

export default function AdminPageHeader({ titulo, subtitulo, acao }: AdminPageHeaderProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', marginBottom: '0.25rem' }}>
                    {titulo}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {subtitulo}
                </p>
            </div>
            {acao && acao}
        </div>
    )
}

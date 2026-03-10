import { Search } from 'lucide-react'
import { type ReactNode } from 'react'

interface AdminFilterBarProps {
    children: ReactNode
    onBuscar: () => void
    onLimpar?: () => void
    temFiltroAtivo?: boolean
}

export default function AdminFilterBar({ children, onBuscar, onLimpar, temFiltroAtivo }: AdminFilterBarProps) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
            border: '1.5px solid #e8edf5', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        }}>
            {children}
            {onLimpar && temFiltroAtivo && (
                <button
                    onClick={onLimpar}
                    style={{
                        height: 40, padding: '0 1rem', borderRadius: 10, fontSize: '0.82rem',
                        display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0,
                        background: 'none', border: '1.5px solid #e2e8f0', color: '#64748b',
                        cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b' }}
                >
                    Limpar Filtros
                </button>
            )}
            <button
                onClick={onBuscar}
                className="btn-primary"
                style={{ height: 40, padding: '0 1.25rem', borderRadius: 10, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
            >
                <Search style={{ width: 14, height: 14 }} /> Buscar
            </button>
        </div>
    )
}

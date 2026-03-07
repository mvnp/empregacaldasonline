import { Search } from 'lucide-react'
import { type ReactNode } from 'react'

interface AdminFilterBarProps {
    children: ReactNode
    onBuscar: () => void
}

export default function AdminFilterBar({ children, onBuscar }: AdminFilterBarProps) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '1rem 1.25rem',
            border: '1.5px solid #e8edf5', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        }}>
            {children}
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

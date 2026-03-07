import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import type { StatCard } from '@/data/admin'

interface AdminStatCardProps {
    stat: StatCard
    icon: LucideIcon
    color: string
}

export default function AdminStatCard({ stat, icon: Icon, color }: AdminStatCardProps) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
            border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Decoração de fundo */}
            <div style={{ position: 'absolute', top: -12, right: -12, width: 60, height: 60, borderRadius: '50%', background: `${color}08`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: `${color}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: stat.positivo ? '#16a34a' : '#dc2626',
                    background: stat.positivo ? '#f0fdf4' : '#fef2f2',
                    padding: '2px 7px', borderRadius: 9999,
                }}>
                    {stat.positivo ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}
                    {stat.variacao}
                </span>
            </div>
            <p style={{ fontSize: '1.65rem', fontWeight: 900, color: '#09355F', lineHeight: 1, marginBottom: '0.2rem' }}>{stat.valor}</p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>{stat.label}</p>
        </div>
    )
}

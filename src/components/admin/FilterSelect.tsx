import { ChevronDown, type LucideIcon } from 'lucide-react'

interface FilterSelectProps {
    icon: LucideIcon
    value: string
    onChange: (value: string) => void
    placeholder: string
    opcoes: { value: string; label: string }[]
    flex?: string
}

export default function FilterSelect({ icon: Icon, value, onChange, placeholder, opcoes, flex = '0 1 155px' }: FilterSelectProps) {
    return (
        <div style={{ position: 'relative', flex }}>
            <Icon style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-filter"
                style={{ paddingLeft: '2rem', height: 40, appearance: 'none', cursor: 'pointer' }}
            >
                <option value="">{placeholder}</option>
                {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
    )
}

import { Search } from 'lucide-react'

interface FilterSearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder: string
}

export default function FilterSearchInput({ value, onChange, placeholder }: FilterSearchInputProps) {
    return (
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-filter"
                style={{ paddingLeft: '2.3rem', height: 40 }}
            />
        </div>
    )
}

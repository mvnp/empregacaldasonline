interface TagBadgeProps {
    items: string[]
}

/**
 * Lista de badges/tags (habilidades, tecnologias, etc).
 */
export default function TagBadge({ items }: TagBadgeProps) {
    return (
        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {items.map(item => (
                <span key={item} style={{
                    padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600,
                    background: '#09355F0a', color: '#09355F', border: '1px solid #09355F14',
                }}>
                    {item}
                </span>
            ))}
        </div>
    )
}

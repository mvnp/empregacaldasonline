import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
    href: string
    label?: string
}

/**
 * Botão "Voltar" padronizado para páginas de detalhe.
 */
export default function BackButton({ href, label = 'Voltar' }: BackButtonProps) {
    return (
        <Link href={href} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.6rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
            color: '#09355F', background: '#09355F0a', border: '1.5px solid #09355F14',
            textDecoration: 'none', transition: 'background 0.18s',
        }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> {label}
        </Link>
    )
}

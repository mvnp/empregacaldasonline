'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag } from 'lucide-react'
import CategorizarModal from '@/components/admin/CategorizarModal'

interface Props {
    candidatoId: number
}

export default function CategorizarButton({ candidatoId }: Props) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.55rem 1.1rem', borderRadius: 10,
                    background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.82rem',
                    boxShadow: '0 4px 12px rgba(9,53,95,0.2)',
                }}
            >
                <Tag style={{ width: 14, height: 14 }} />
                Categorizar
            </button>

            {open && (
                <CategorizarModal
                    candidatoId={candidatoId}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false)
                        router.refresh()
                    }}
                />
            )}
        </>
    )
}

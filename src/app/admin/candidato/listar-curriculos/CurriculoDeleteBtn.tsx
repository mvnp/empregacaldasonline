'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { excluirCurriculo } from '@/actions/candidatos'
import { useRouter } from 'next/navigation'

export default function CurriculoDeleteBtn({ curriculoId, userId }: { curriculoId: number, userId: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm('Tem certeza que deseja excluir ESTE currículo permanentemente? O seu usuário não será afetado.')) {
            return
        }

        setLoading(true)
        const res = await excluirCurriculo(curriculoId, userId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error || 'Erro ao excluir.')
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10, border: 'none',
                background: '#fef2f2', color: '#dc2626', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', opacity: loading ? 0.7 : 1
            }}
            title="Excluir Currículo"
        >
            <Trash2 style={{ width: 16, height: 16 }} />
        </button>
    )
}

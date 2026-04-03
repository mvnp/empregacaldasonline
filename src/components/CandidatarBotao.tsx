'use client'

import { useState, useTransition } from 'react'
import { Send, Check, Loader2 } from 'lucide-react'
import { candidatarVaga } from '@/actions/candidaturas'
import { useRouter } from 'next/navigation'

interface CandidatarBotaoProps {
    vagaId: number
    jaCandidatado: boolean
}

export default function CandidatarBotao({ vagaId, jaCandidatado }: CandidatarBotaoProps) {
    const [candidatado, setCandidatado] = useState(jaCandidatado)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleCandidatar = () => {
        if (candidatado || isPending) return

        setError(null)
        startTransition(async () => {
            const res = await candidatarVaga(vagaId)
            if (res.success) {
                setCandidatado(true)
                router.refresh()
            } else {
                setError(res.error || 'Erro desconhecido')
            }
        })
    }

    return (
        <div style={{ width: '100%' }}>
            {error && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                    {error}
                </div>
            )}
            <button 
                onClick={handleCandidatar}
                disabled={candidatado || isPending}
                style={{ 
                    width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: 12, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    boxShadow: candidatado ? 'none' : '0 8px 25px rgba(254,131,65,0.25)', 
                    border: 'none',
                    background: candidatado ? '#f1f5f9' : 'linear-gradient(135deg, #FE8341, #FBBF53)', 
                    color: candidatado ? '#64748b' : '#fff', 
                    fontWeight: 800,
                    cursor: candidatado || isPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                {isPending ? (
                    <>Processando... <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /></>
                ) : candidatado ? (
                    <>Candidatura Enviada <Check style={{ width: 16, height: 16, color: '#10b981' }} /></>
                ) : (
                    <>Candidatar-se à Vaga <Send style={{ width: 16, height: 16 }} /></>
                )}
            </button>
        </div>
    )
}

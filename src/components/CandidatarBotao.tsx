'use client'

import { useState, useTransition } from 'react'
import { Send, Check, Loader2 } from 'lucide-react'
import { candidatarVaga } from '@/actions/candidaturas'
import { useRouter } from 'next/navigation'

interface CandidatarBotaoProps {
    vagaId: number
    jaCandidatado: boolean
    curriculos?: any[]
}

export default function CandidatarBotao({ vagaId, jaCandidatado, curriculos = [] }: CandidatarBotaoProps) {
    const [candidatado, setCandidatado] = useState(jaCandidatado)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedCurriculoId, setSelectedCurriculoId] = useState<number>(curriculos.length > 0 ? curriculos[0].id : 0)
    const router = useRouter()

    const handleCandidatar = () => {
        if (candidatado || isPending) return
        if (curriculos.length === 0) {
            router.push('/admin/candidato/cadastrar-curriculos')
            return
        }

        if (!selectedCurriculoId) {
            setError('Selecione um currículo para se candidatar.')
            return
        }

        setError(null)
        startTransition(async () => {
            const res = await candidatarVaga(vagaId, selectedCurriculoId)
            if (res.success) {
                setCandidatado(true)
                router.refresh()
            } else {
                setError(res.error || 'Erro desconhecido')
            }
        })
    }

    if (curriculos.length === 0) {
        return (
            <button 
                onClick={() => router.push('/admin/candidato/cadastrar-curriculos')}
                style={{ 
                    width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: 12, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    border: 'none', background: '#09355F', color: '#fff', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(9,53,95,0.25)' 
                }}
            >
                Crie seu Currículo para Candidatar-se
            </button>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            {error && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                    {error}
                </div>
            )}
            
            {!candidatado && curriculos.length > 1 && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Enviar com qual currículo?</label>
                    <select
                        value={selectedCurriculoId}
                        onChange={e => setSelectedCurriculoId(Number(e.target.value))}
                        disabled={isPending}
                        style={{
                            width: '100%', padding: '0.65rem', borderRadius: 8, border: '1.5px solid #e2e8f0',
                            background: '#f8fafc', fontSize: '0.85rem', outline: 'none', color: '#09355F', fontWeight: 600
                        }}
                    >
                        {curriculos.map(c => (
                            <option key={c.id} value={c.id}>{c.cargo_desejado || 'Currículo Padrão'}</option>
                        ))}
                    </select>
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

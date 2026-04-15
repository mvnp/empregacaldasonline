'use client'

import { useState } from 'react'
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { criarVagaNotification } from '@/actions/vaga_notifications'

const MOTIVOS = [
    'Vaga indisponível',
    'Vaga não existe',
    'Contato empregador incorreto',
]

interface Props {
    vagaId: number
}

export default function VagaReportButton({ vagaId }: Props) {
    const [open, setOpen] = useState(false)
    const [motivo, setMotivo] = useState('')
    const [relato, setRelato] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    function handleOpen() {
        setOpen(true)
        setStatus('idle')
        setMotivo('')
        setRelato('')
        setErrorMsg('')
    }

    function handleClose() {
        if (loading) return
        setOpen(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!motivo) {
            setErrorMsg('Selecione um motivo.')
            return
        }
        setLoading(true)
        setErrorMsg('')

        const result = await criarVagaNotification({ vaga_id: vagaId, motivo, relato })

        setLoading(false)
        if (result.success) {
            setStatus('success')
        } else {
            setStatus('error')
            setErrorMsg(result.error || 'Erro ao enviar.')
        }
    }

    return (
        <>
            {/* Botão 1/4 de círculo no canto inferior direito do card de Descrição */}
            <button
                onClick={handleOpen}
                title="Relatar problema com essa vaga"
                aria-label="Relatar problema com essa vaga"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 56,
                    height: 56,
                    background: '#FBBF53',
                    border: 'none',
                    borderRadius: '16px 0 16px 0',
                    /* Cria o quarto de círculo: clipPath em forma de pizza */
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '8px',
                    transition: 'background 0.2s',
                    zIndex: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0a800')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FBBF53')}
            >
                <Flag style={{ width: 18, height: 18, color: '#fff' }} />
            </button>

            {/* Overlay + Modal */}
            {open && (
                <div
                    onClick={handleClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(9, 53, 95, 0.55)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '2rem',
                            width: '100%',
                            maxWidth: 480,
                            boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                            animation: 'slideUp 0.25s ease',
                            position: 'relative',
                        }}
                    >
                        {/* Fechar */}
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                                width: 34, height: 34, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                                transition: 'background 0.2s',
                            }}
                        >
                            <X style={{ width: 16, height: 16 }} />
                        </button>

                        {/* Ícone + Título na mesma linha */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                background: 'linear-gradient(135deg, #FBBF53, #f0a800)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 6px 16px rgba(251,191,83,0.35)',
                            }}>
                                <AlertTriangle style={{ width: 20, height: 20, color: '#fff' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.2rem' }}>
                                    Problema com essa vaga
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    Reporte qualquer inconsistência para nos ajudar.
                                </p>
                            </div>
                        </div>

                        {/* Estado de sucesso */}
                        {status === 'success' ? (
                            <div style={{
                                textAlign: 'center', padding: '2rem 1rem',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                            }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 20px rgba(34,197,94,0.35)',
                                }}>
                                    <CheckCircle style={{ width: 32, height: 32, color: '#fff' }} />
                                </div>
                                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09355F', margin: 0 }}>
                                    Notificação enviada!
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                    Obrigado. Nossa equipe irá verificar essa vaga em breve.
                                </p>
                                <button
                                    onClick={handleClose}
                                    style={{
                                        marginTop: '0.5rem', padding: '0.65rem 2rem',
                                        borderRadius: 10, background: '#09355F', color: '#fff',
                                        border: 'none', fontWeight: 700, fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Radio buttons */}
                                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                                    <legend style={{ fontSize: '0.8rem', fontWeight: 700, color: '#07355f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                        Motivo da denúncia
                                    </legend>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {MOTIVOS.map(m => (
                                            <label
                                                key={m}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    padding: '0.5rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                                                    border: `2px solid ${motivo === m ? '#FBBF53' : '#e8edf5'}`,
                                                    background: motivo === m ? '#fffbeb' : '#f8fafc',
                                                    transition: 'all 0.15s',
                                                    fontSize: '0.9rem', color: '#374151', fontWeight: motivo === m ? 600 : 400,
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="motivo"
                                                    value={m}
                                                    checked={motivo === m}
                                                    onChange={() => { setMotivo(m); setErrorMsg('') }}
                                                    style={{ accentColor: '#FBBF53', width: 16, height: 16 }}
                                                />
                                                {m}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Textarea */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#07355f', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                                        Comentário <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
                                    </label>
                                    <textarea
                                        value={relato}
                                        onChange={e => setRelato(e.target.value)}
                                        placeholder="Deixe aqui um comentário indicando o motivo da denúncia…"
                                        rows={4}
                                        maxLength={800}
                                        style={{
                                            width: '100%', borderRadius: 10, border: '2px solid #e8edf5',
                                            padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#374151',
                                            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                                            lineHeight: 1.6, boxSizing: 'border-box',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = '#FBBF53')}
                                        onBlur={e => (e.currentTarget.style.borderColor = '#e8edf5')}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0', textAlign: 'right' }}>{relato.length}/800</p>
                                </div>

                                {/* Erro */}
                                {(errorMsg || status === 'error') && (
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                                        {errorMsg || 'Ocorreu um erro. Tente novamente.'}
                                    </p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '0.9rem', borderRadius: 12, border: 'none',
                                        background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #FBBF53, #f0a800)',
                                        color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        boxShadow: loading ? 'none' : '0 8px 20px rgba(251,191,83,0.35)',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span style={{
                                                width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                                                borderTopColor: '#fff', borderRadius: '50%',
                                                display: 'inline-block', animation: 'spin 0.7s linear infinite',
                                            }} />
                                            Enviando…
                                        </>
                                    ) : (
                                        <>
                                            <Flag style={{ width: 16, height: 16 }} />
                                            Enviar notificação
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style suppressHydrationWarning>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>
        </>
    )
}

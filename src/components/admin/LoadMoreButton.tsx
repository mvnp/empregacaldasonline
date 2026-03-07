import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
    totalFiltrado: number
    exibidos: number
    carregando: boolean
    onCarregarMais: () => void
    entidade: string
}

export default function LoadMoreButton({ totalFiltrado, exibidos, carregando, onCarregarMais, entidade }: LoadMoreButtonProps) {
    const temMais = exibidos < totalFiltrado
    const restantes = totalFiltrado - exibidos
    const visivel = Math.min(exibidos, totalFiltrado)

    return (
        <>
            {temMais && (
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                    <button
                        onClick={onCarregarMais}
                        disabled={carregando}
                        className="btn-primary"
                        style={{ padding: '0.7rem 2rem', borderRadius: 10, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: carregando ? 0.7 : 1 }}
                    >
                        {carregando ? (
                            <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Carregando...</>
                        ) : (
                            `Carregar mais (${restantes} restantes)`
                        )}
                    </button>
                </div>
            )}
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem' }}>
                Exibindo {visivel} de {totalFiltrado} {entidade}
            </p>
        </>
    )
}

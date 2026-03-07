import { Filter, X, CheckCircle, Briefcase } from 'lucide-react'
import Link from 'next/link'
import {
    FiltrosState,
    FILTER_AREAS,
    FILTER_MODALIDADES,
    FILTER_CONTRATOS,
    FILTER_NIVEIS,
} from '@/data/vagas'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface FilterPanelProps {
    filtros: FiltrosState
    vagasCount: number
    temFiltroAtivo: boolean
    onChange: (filtros: Partial<FiltrosState>) => void
    onLimpar: () => void
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: label de seção
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
    return (
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#09355F', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
            {children}
        </p>
    )
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function FilterPanel({ filtros, vagasCount, temFiltroAtivo, onChange, onLimpar }: FilterPanelProps) {
    return (
        <div className="sidebar-card">

            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Filter style={{ width: 16, height: 16, color: '#09355F' }} />
                    <span style={{ fontWeight: 700, color: '#09355F', fontSize: '0.875rem' }}>Filtros</span>
                </div>
                {temFiltroAtivo && (
                    <button
                        onClick={onLimpar}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#FE8341', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X style={{ width: 13, height: 13 }} />
                        Limpar
                    </button>
                )}
            </div>

            {/* Corpo */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Toggle: Apenas destaques */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div
                        className={`checkbox-custom ${filtros.apenasDestaque ? 'checked' : ''}`}
                        onClick={() => onChange({ apenasDestaque: !filtros.apenasDestaque })}
                    >
                        {filtros.apenasDestaque && <CheckCircle style={{ width: 12, height: 12, color: '#09355F' }} />}
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#09355F' }}>Vagas em Destaque</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Somente vagas especiais</span>
                    </div>
                </label>

                <hr style={{ border: 'none', borderTop: '1.5px solid #f0f4f8' }} />

                {/* Filtro: Área de atuação (botões) */}
                <div>
                    <SectionLabel>Área de Atuação</SectionLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {FILTER_AREAS.map(a => (
                            <button
                                key={a}
                                className={`area-btn ${filtros.area === a ? 'active' : ''}`}
                                onClick={() => onChange({ area: a })}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px solid #f0f4f8' }} />

                {/* Filtro: Modalidade */}
                <div>
                    <SectionLabel>Modalidade</SectionLabel>
                    <select className="input-filter" value={filtros.modalidade} onChange={e => onChange({ modalidade: e.target.value })}>
                        {FILTER_MODALIDADES.map(m => <option key={m}>{m}</option>)}
                    </select>
                </div>

                {/* Filtro: Tipo de contrato */}
                <div>
                    <SectionLabel>Tipo de Contrato</SectionLabel>
                    <select className="input-filter" value={filtros.contrato} onChange={e => onChange({ contrato: e.target.value })}>
                        {FILTER_CONTRATOS.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>

                {/* Filtro: Nível de experiência */}
                <div>
                    <SectionLabel>Experiência</SectionLabel>
                    <select className="input-filter" value={filtros.nivel} onChange={e => onChange({ nivel: e.target.value })}>
                        {FILTER_NIVEIS.map(n => <option key={n}>{n}</option>)}
                    </select>
                </div>

            </div>

            {/* Rodapé: contador de resultados */}
            <div style={{ padding: '0.875rem 1.25rem', background: '#f8fafc', borderTop: '1.5px solid #e8edf5', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    <strong style={{ color: '#09355F' }}>{vagasCount}</strong>{' '}
                    {vagasCount === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                </span>
            </div>

            {/* CTA: Publicar vaga */}
            <div style={{ padding: '1.5rem 1.25rem', background: 'linear-gradient(135deg, #09355F, #0d4a82)', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, background: '#FBBF53', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <Briefcase style={{ width: 22, height: 22, color: '#09355F' }} />
                </div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Publique sua vaga</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                    Alcance milhares de candidatos
                </p>
                <Link href="/publicar-vaga" className="btn-primary" style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.85rem', borderRadius: 8 }}>
                    Publicar Grátis
                </Link>
            </div>

        </div>
    )
}

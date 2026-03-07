'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import VagaCard from '@/components/VagaCard'
import FilterPanel from '@/components/FilterPanel'
import Footer from '@/components/Footer'

import { VAGAS_MOCK, FILTROS_INICIAL, FiltrosState } from '@/data/vagas'

// ─────────────────────────────────────────────────────────────
// Lógica de filtragem
// ─────────────────────────────────────────────────────────────
function filtrarVagas(vagas: typeof VAGAS_MOCK, busca: string, cidade: string, filtros: FiltrosState) {
  return vagas.filter(v => {
    const matchBusca = !busca || v.titulo.toLowerCase().includes(busca.toLowerCase()) || v.empresa.toLowerCase().includes(busca.toLowerCase())
    const matchCidade = !cidade || v.local.toLowerCase().includes(cidade.toLowerCase())
    const matchArea = filtros.area === 'Todas' || v.area === filtros.area
    const matchModal = filtros.modalidade === 'Todas' || v.modalidade === filtros.modalidade
    const matchContrat = filtros.contrato === 'Todos' || v.contrato === filtros.contrato
    const matchNivel = filtros.nivel === 'Todos' || v.nivel === filtros.nivel
    const matchDestaqu = !filtros.apenasDestaque || v.destaque
    return matchBusca && matchCidade && matchArea && matchModal && matchContrat && matchNivel && matchDestaqu
  })
}

// ─────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  // Estado de busca (hero)
  const [busca, setBusca] = useState('')
  const [cidade, setCidade] = useState('')

  // Estado de filtros (sidebar)
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAL)

  // Estado de UI
  const [drawerAberto, setDrawerAberto] = useState(false)

  // Derivados
  const vagasFiltradas = filtrarVagas(VAGAS_MOCK, busca, cidade, filtros)
  const temFiltroAtivo = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIAL)

  // Handlers
  const handleFiltroChange = (parcial: Partial<FiltrosState>) =>
    setFiltros(prev => ({ ...prev, ...parcial }))

  const handleLimparFiltros = () => setFiltros(FILTROS_INICIAL)

  const handleBuscar = () => {
    document.getElementById('vagas')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Props compartilhadas do FilterPanel
  const filterPanelProps = {
    filtros,
    vagasCount: vagasFiltradas.length,
    temFiltroAtivo,
    onChange: handleFiltroChange,
    onLimpar: handleLimparFiltros,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>

      {/* Navbar absoluta sobre o hero */}
      <Navbar />

      {/* Hero com barra de busca */}
      <HeroSection
        busca={busca}
        cidade={cidade}
        onBuscaChange={setBusca}
        onCidadeChange={setCidade}
        onBuscar={handleBuscar}
      />

      {/* ── Seção de Vagas ── */}
      <section id="vagas" style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Cabeçalho da seção */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#09355F' }}>
                Vagas Disponíveis
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2AB9C0', marginLeft: '0.5rem' }}>
                  ({vagasFiltradas.length})
                </span>
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Atualizadas diariamente — encontre a oportunidade certa
              </p>
            </div>

            {/* Botão filtros — visível apenas em mobile */}
            <button
              onClick={() => setDrawerAberto(true)}
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', borderRadius: 10 }}
              aria-label="Abrir filtros"
            >
              <Filter style={{ width: 16, height: 16 }} />
              Filtros
              {temFiltroAtivo && (
                <span style={{ width: 18, height: 18, background: '#09355F', color: '#FBBF53', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  !
                </span>
              )}
            </button>
          </div>

          {/* Layout: lista (esquerda) + filtros (direita) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

            {/* Lista de vagas */}
            <div>
              {vagasFiltradas.length === 0 ? (
                // Estado vazio
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <Search style={{ width: 56, height: 56, color: '#e2e8f0', margin: '0 auto 1rem' }} />
                  <h3 style={{ color: '#09355F', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma vaga encontrada</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Tente ajustar os filtros ou a busca
                  </p>
                  <button className="btn-primary" onClick={handleLimparFiltros} style={{ padding: '0.625rem 1.5rem', borderRadius: 10 }}>
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {vagasFiltradas.map(vaga => (
                    <VagaCard key={vaga.id} vaga={vaga} />
                  ))}

                  {/* Paginação */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', paddingTop: '1.5rem' }}>
                    {[1, 2, 3, '...', 12].map((p, i) => (
                      <button key={i} className={`page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtros — sidebar desktop */}
            <aside style={{ position: 'sticky', top: '1.5rem' }}>
              <FilterPanel {...filterPanelProps} />
            </aside>

          </div>
        </div>
      </section>

      {/* ── Drawer de filtros (mobile) ── */}
      {drawerAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          {/* Overlay */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerAberto(false)}
          />
          {/* Painel lateral */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, background: '#fff', overflowY: 'auto', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)' }}>
            {/* Header do drawer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1.5px solid #e8edf5', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <strong style={{ color: '#09355F' }}>Filtrar Vagas</strong>
              <button onClick={() => setDrawerAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} aria-label="Fechar filtros">
                <X style={{ width: 20, height: 20, color: '#475569' }} />
              </button>
            </div>
            {/* Conteúdo — mesmo FilterPanel */}
            <div style={{ padding: '1rem' }}>
              <FilterPanel {...filterPanelProps} />
            </div>
            {/* Botão confirmar */}
            <div style={{ padding: '1rem', borderTop: '1.5px solid #e8edf5', position: 'sticky', bottom: 0, background: '#fff' }}>
              <button className="btn-primary" onClick={() => setDrawerAberto(false)} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, fontSize: '0.95rem' }}>
                Ver {vagasFiltradas.length} vagas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </div>
  )
}

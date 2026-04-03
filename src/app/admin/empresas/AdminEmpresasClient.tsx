'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    MapPin, Building2, Users, Briefcase, Award, Globe, Upload
} from 'lucide-react'
import { EmpresaAdmin } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import EmpresaCard from '@/components/admin/EmpresaCard'
import FilterSelect from '@/components/admin/FilterSelect'
import FilterSearchInput from '@/components/admin/FilterSearchInput'
import LoadMoreButton from '@/components/admin/LoadMoreButton'
import ImportarEstabelecimentosModal from '@/components/admin/ImportarEstabelecimentosModal'

const POR_PAGINA = 18

export default function AdminEmpresasClient({ empresas }: { empresas: EmpresaAdmin[] }) {
    const [busca, setBusca] = useState('')
    const [filtroSetor, setFiltroSetor] = useState('')
    const [filtroCidade, setFiltroCidade] = useState('')
    const [filtroPlano, setFiltroPlano] = useState('')
    const [exibidos, setExibidos] = useState(POR_PAGINA)
    const [carregando, setCarregando] = useState(false)
    const [modalImportarAberto, setModalImportarAberto] = useState(false)

    const empresasFiltradas = useMemo(() => {
        return empresas.filter(e => {
            if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase())) return false
            if (filtroSetor && e.setor !== filtroSetor) return false
            if (filtroCidade && e.local !== filtroCidade) return false
            if (filtroPlano && e.plano !== filtroPlano) return false
            return true
        })
    }, [empresas, busca, filtroSetor, filtroCidade, filtroPlano])

    const visiveis = empresasFiltradas.slice(0, exibidos)

    function handleCarregarMais() {
        setCarregando(true)
        setTimeout(() => {
            setExibidos(prev => prev + POR_PAGINA)
            setCarregando(false)
        }, 600)
    }

    const setoresOpcoes = [...new Set(empresas.map(e => e.setor).filter(Boolean))].map(s => ({ value: s as string, label: s as string }))
    const cidadesOpcoes = [...new Set(empresas.map(e => e.local).filter(Boolean))].map(c => ({ value: c as string, label: c as string }))

    return (
        <div>
            <AdminPageHeader
                titulo="Empresas"
                subtitulo={`${empresasFiltradas.length} empresas cadastradas`}
                acao={
                    <button
                        id="btn-importar-estabelecimentos"
                        onClick={() => setModalImportarAberto(true)}
                        title="Importar estabelecimentos via CSV"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                            color: '#fff', border: 'none', borderRadius: 12,
                            padding: '0.65rem 1.1rem', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.82rem',
                            boxShadow: '0 2px 8px rgba(9,53,95,0.18)',
                            transition: 'opacity 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        <Upload className="w-4 h-4" />
                        Importar CSV
                    </button>
                }
            />

            <AdminFilterBar onBuscar={() => setExibidos(POR_PAGINA)}>
                <FilterSearchInput value={busca} onChange={setBusca} placeholder="Buscar empresa..." />
                <FilterSelect icon={Globe} value={filtroSetor} onChange={v => { setFiltroSetor(v); setExibidos(POR_PAGINA) }} placeholder="Setor" flex="0 1 170px" opcoes={setoresOpcoes} />
                <FilterSelect icon={MapPin} value={filtroCidade} onChange={v => { setFiltroCidade(v); setExibidos(POR_PAGINA) }} placeholder="Cidade" flex="0 1 180px" opcoes={cidadesOpcoes} />
                <FilterSelect icon={Award} value={filtroPlano} onChange={v => { setFiltroPlano(v); setExibidos(POR_PAGINA) }} placeholder="Plano" flex="0 1 160px" opcoes={[{ value: 'gratuito', label: 'Gratuito' }, { value: 'profissional', label: 'Profissional' }, { value: 'enterprise', label: 'Enterprise' }]} />
            </AdminFilterBar>

            {/* ── Grid de cards ── */}
            <div className="admin-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {visiveis.map(e => (
                    <EmpresaCard
                        key={e.id}
                        id={e.id}
                        nome={e.nome}
                        local={e.local}
                        status={e.status}
                        vagasTotais={e.totalFuncionarios} // Temp workaround using old mock property
                        vagasAtivas={e.vagasAtivas}
                        tipoUsuario="admin"
                    />
                ))}
            </div>

            <LoadMoreButton
                totalFiltrado={empresasFiltradas.length}
                exibidos={exibidos}
                carregando={carregando}
                onCarregarMais={handleCarregarMais}
                entidade="empresas"
            />

            {/* Modal de importação CSV */}
            {modalImportarAberto && (
                <ImportarEstabelecimentosModal onClose={() => setModalImportarAberto(false)} />
            )}
        </div>
    )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { ArrowLeft, Search, Building2, Link as LinkIcon, Calendar, DollarSign, UploadCloud, Save, Loader2 } from 'lucide-react'
import { buscarEmpresasParaAutosuggest, criarPublicidade } from '@/actions/publicidade'

export default function CadastrarPublicidadeClient() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Auto-suggest state
    const [buscaEmpresa, setBuscaEmpresa] = useState('')
    const [resultadosEmpresa, setResultadosEmpresa] = useState<{id: number, label: string}[]>([])
    const [empresaSelecionada, setEmpresaSelecionada] = useState<{id: number, label: string} | null>(null)
    const [buscando, setBuscando] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Form data
    const [linkDestino, setLinkDestino] = useState('')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [orcamento, setOrcamento] = useState('')

    // Debounce search
    useEffect(() => {
        if (!buscaEmpresa || buscaEmpresa.length < 2) {
            setResultadosEmpresa([])
            return
        }
        
        const timeoutId = setTimeout(async () => {
            setBuscando(true)
            const res = await buscarEmpresasParaAutosuggest(buscaEmpresa)
            setResultadosEmpresa(res)
            setBuscando(false)
        }, 400)

        return () => clearTimeout(timeoutId)
    }, [buscaEmpresa])

    // Fechar dropdown onClick out
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setResultadosEmpresa([])
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Formata Moeda BRL
    const handleOrcamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value === '') { setOrcamento(''); return; }
        const numberValue = parseFloat(value) / 100
        setOrcamento(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        if (!empresaSelecionada) {
            setError('Selecione uma empresa válida no campo de busca.')
            return
        }

        setSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('empresa_id', String(empresaSelecionada.id))
            formData.append('orcamento', orcamento) // Envia formatado, server resolve regex
            
            const res = await criarPublicidade(formData)
            
            if (res.success) {
                router.push('/admin/publicidades')
                router.refresh()
            } else {
                setError(res.error || 'Erro desconhecido ao cadastrar')
                setSubmitting(false)
            }
        } catch (err: any) {
            setError('Erro ao enviar formulário. Verifique sua conexão.')
            setSubmitting(false)
        }
    }

    const FormatoUpload = ({ label, id, dims }: { label: string, id: string, dims: string }) => (
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 12, border: '1.5px dashed #cbd5e1' }}>
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#09355F' }}>{label}</h4>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Dimensão ideal: {dims} (JPG, PNG, WEBP)</span>
            
            <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: '#fff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: 8,
                cursor: 'pointer', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600
            }}>
                <UploadCloud size={16} /> Escolher Arquivo
                <input type="file" name={`imagem_${id}`} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} />
            </label>
        </div>
    )

    return (
        <div style={{ width: '100%' }}>
            <AdminPageHeader
                titulo="Cadastrar Publicidade"
                subtitulo="Configure a campanha e envie os banners."
                acao={
                    <Link href="/admin/publicidades" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                }
            />

            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                {/* DADOS BÁSICOS */}
                <h3 style={{ fontSize: '1.1rem', color: '#09355F', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Dados da Campanha</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    
                    {/* Auto-suggest Empresa */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Empresa Anunciante <span style={{color: '#ef4444'}}>*</span></label>
                        
                        {empresaSelecionada ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
                                    <Building2 size={16} /> {empresaSelecionada.label}
                                </div>
                                <button type="button" onClick={() => { setEmpresaSelecionada(null); setBuscaEmpresa('') }} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Alterar</button>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    value={buscaEmpresa}
                                    onChange={(e) => setBuscaEmpresa(e.target.value)}
                                    placeholder="Digite razão social, fantasia ou CNPJ..."
                                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', color: '#09355F' }}
                                />
                                {buscando && <Loader2 size={14} style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', color: '#94a3b8', animation: 'spin 1s linear infinite' }} />}
                            </div>
                        )}

                        {resultadosEmpresa.length > 0 && !empresaSelecionada && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                                {resultadosEmpresa.map(emp => (
                                    <div key={emp.id} onClick={() => { setEmpresaSelecionada(emp); setResultadosEmpresa([]) }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                                        {emp.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <LinkIcon size={14} /> Link de Destino <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="url" name="link_destino" value={linkDestino} onChange={e => setLinkDestino(e.target.value)} placeholder="https://exemplo.com.br" required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <DollarSign size={14} /> Orçamento Mensal 
                            </label>
                            <input type="text" value={orcamento} onChange={handleOrcamentoChange} placeholder="R$ 0,00" required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <Calendar size={14} /> Inicia em <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="date" name="data_inicio" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <Calendar size={14} /> Termina em <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="date" name="data_fim" value={dataFim} onChange={e => setDataFim(e.target.value)} required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                    </div>

                </div>

                {/* IMAGENS / FORMATOS */}
                <h3 style={{ fontSize: '1.1rem', color: '#09355F', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Ativos da Publicidade (Imagens)</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>Faça o upload apenas dos formatos que deseja que esta publicidade rode. Formatos não enviados não serão exibidos.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    <FormatoUpload id="rectangle" label="Medium Rectangle" dims="300×250" />
                    <FormatoUpload id="leaderboard" label="Leaderboard" dims="728×90 (ou 970×90)" />
                    <FormatoUpload id="native" label="Native Card" dims="Mesma proporção de vaga" />
                    <FormatoUpload id="billboard" label="Billboard / Footer" dims="970×250" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={submitting} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #FE8341, #FBBF53)', color: '#fff', fontSize: '1rem', fontWeight: 800,
                        border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                        boxShadow: '0 4px 15px rgba(254,131,65,0.3)'
                    }}>
                        {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...</> : <><Save size={18} /> Salvar Campanha</>}
                    </button>
                </div>
            </form>
        </div>
    )
}

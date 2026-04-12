'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import BackButton from '@/components/admin/BackButton'
import { Building2, Link as LinkIcon, Calendar, DollarSign, Save, Loader2, Activity } from 'lucide-react'
import { atualizarPublicidade } from '@/actions/publicidade'

export default function EditarPublicidadeClient({ publicidade }: { publicidade: any }) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    
    // Formatting date helper to input format
    const formatToDateInput = (isoString: string) => {
        if (!isoString) return ''
        return isoString.split('T')[0]
    }

    const [linkDestino, setLinkDestino] = useState(publicidade.link_destino || '')
    const [dataInicio, setDataInicio] = useState(formatToDateInput(publicidade.data_inicio))
    const [dataFim, setDataFim] = useState(formatToDateInput(publicidade.data_fim))
    const [status, setStatus] = useState(publicidade.status || 'ativo')
    
    const [orcamento, setOrcamento] = useState(
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(publicidade.orcamento_real || 0)
    )

    const handleOrcamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value === '') { setOrcamento(''); return; }
        const numberValue = parseFloat(value) / 100
        setOrcamento(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const cleanOrcStr = String(orcamento).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g, "")
            const numOrcamento = Number(cleanOrcStr) || 0
            
            const res = await atualizarPublicidade(publicidade.id, {
                status,
                link_destino: linkDestino,
                data_inicio: dataInicio,
                data_fim: dataFim,
                orcamento: numOrcamento
            })
            
            if (res.success) {
                router.push('/admin/publicidades')
                router.refresh()
            } else {
                setError(res.error || 'Erro desconhecido ao atualizar')
                setSubmitting(false)
            }
        } catch (err: any) {
            setError('Erro ao atualizar formulário. Verifique sua conexão.')
            setSubmitting(false)
        }
    }

    const emp = publicidade.empresas || {}
    const nomeEmpresa = emp.nome_fantasia || emp.razao_social || 'Empresa Desconhecida'

    return (
        <div style={{ width: '100%' }}>
            <AdminPageHeader
                titulo="Editar Publicidade"
                subtitulo="Altere datas, orçamentos, link ou pause a campanha."
                acao={<BackButton href="/admin/publicidades" />}
            />

            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#09355F', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Dados da Campanha</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Empresa Anunciante (Não Editável)</label>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                                <Building2 size={16} /> {nomeEmpresa} {emp.cnpj ? `(${emp.cnpj})` : ''}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <LinkIcon size={14} /> Link de Destino <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="url" value={linkDestino} onChange={e => setLinkDestino(e.target.value)} placeholder="https://exemplo.com.br" required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <Activity size={14} /> Status da Campanha <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <select value={status} onChange={e => setStatus(e.target.value)} required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo / Pausado</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <Calendar size={14} /> Inicia em <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                                <Calendar size={14} /> Termina em <span style={{color: '#ef4444'}}>*</span>
                            </label>
                            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} required
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

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button type="submit" disabled={submitting} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #FE8341, #FBBF53)', color: '#fff', fontSize: '1rem', fontWeight: 800,
                        border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                        boxShadow: '0 4px 15px rgba(254,131,65,0.3)'
                    }}>
                        {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Atualizando...</> : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>
            </form>
        </div>
    )
}

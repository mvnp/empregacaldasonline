'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    ArrowLeft, Save, Building2, Briefcase, Mail, MapPin, Loader2, Search
} from 'lucide-react'
import { atualizarEmpresaAdmin, buscarEmpresa, EmpresaFormData } from '@/actions/empresas'

export default function EditarEmpresaPage() {
    const params = useParams()
    const id = Number(params?.id)

    const [form, setForm] = useState<EmpresaFormData>({
        nome_fantasia: '',
        razao_social: '',
        cnpj: '',
        email_contato: '',
        telefone: '',
        whatsapp: '',
        website: '',
        linkedin: '',
        local: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        descricao: '',
        setor: '',
        tamanho_empresa: '1-10',
        fundacao_ano: '',
        status: 'ativa'
    })
    const [loadingData, setLoadingData] = useState(true)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    useEffect(() => {
        if (!id) return
        buscarEmpresa(id).then(data => {
            if (data) {
                setForm({
                    nome_fantasia: data.nome_fantasia || '',
                    razao_social: data.razao_social || '',
                    cnpj: data.cnpj || '',
                    email_contato: data.email_contato || '',
                    telefone: data.telefone || '',
                    whatsapp: data.whatsapp || '',
                    website: data.website || '',
                    linkedin: data.linkedin || '',
                    local: data.local || '',
                    logradouro: data.logradouro || '',
                    numero: data.numero || '',
                    bairro: data.bairro || '',
                    cidade: data.cidade || '',
                    estado: data.estado || '',
                    descricao: data.descricao || '',
                    setor: data.setor || '',
                    tamanho_empresa: data.tamanho_empresa || '1-10',
                    fundacao_ano: data.fundacao_ano?.toString() || '',
                    status: data.status || 'ativa'
                })
            }
            setLoadingData(false)
        }).catch(err => {
            setErro('Erro ao carregar dados da empresa.')
            setLoadingData(false)
        })
    }, [id])

    const handleChange = (field: keyof EmpresaFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!form.nome_fantasia.trim() || !form.email_contato.trim()) {
            setErro('Preencha os campos obrigatórios (Nome fantasia e E-mail de contato).')
            return
        }

        setLoading(true)
        const res = await atualizarEmpresaAdmin(id, form)
        setLoading(false)

        if (res.success) {
            window.location.href = `/admin/empresas/${res.id}`
        } else {
            setErro(res.error || 'Erro desconhecido ao atualizar.')
        }
    }

    // ── Estilos ──
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10,
        border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#09355F',
        background: '#f8fafc', outline: 'none', transition: 'border-color 0.18s',
        boxSizing: 'border-box' as const
    }
    const labelStyle: React.CSSProperties = {
        fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem', display: 'block',
    }
    const sectionTitle: React.CSSProperties = {
        fontSize: '1rem', fontWeight: 800, color: '#09355F', marginBottom: '1rem',
        paddingBottom: '0.5rem', borderBottom: '2px solid #e8edf5',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
    }
    const cardStyle: React.CSSProperties = {
        background: '#fff', borderRadius: 16, padding: '1.5rem',
        border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(9,53,95,0.04)',
        marginBottom: '1.25rem',
    }

    if (loadingData) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Carregando dados da empresa...</div>
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Link href="/admin/empresas" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                    color: '#64748b', textDecoration: 'none',
                }}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F' }}>Editar Empresa</h1>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Ajuste os dados da empresa registrada</p>
                </div>
            </div>

            {erro && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                    padding: '0.85rem 1.25rem', marginBottom: '1.25rem',
                    fontSize: '0.85rem', color: '#dc2626', fontWeight: 500,
                }}>{erro}</div>
            )}

            <form onSubmit={handleSubmit}>

                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Informações Principais</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Nome Fantasia *</label>
                                {form.nome_fantasia && (
                                    <a 
                                        href={`https://www.google.com/search?q=${encodeURIComponent(`${form.nome_fantasia}, Caldas Novas`)}`} 
                                        target="_blank" rel="noopener noreferrer"
                                        title="Pesquisar esta empresa no Google"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            fontSize: '0.7rem', fontWeight: 600, color: '#3b82f6',
                                            background: '#eff6ff', border: '1px solid #bfdbfe',
                                            padding: '0.15rem 0.5rem', borderRadius: 6,
                                            textDecoration: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <Search style={{ width: 12, height: 12 }} />
                                        Pesquisar no Google
                                    </a>
                                )}
                            </div>
                            <input style={inputStyle} value={form.nome_fantasia} onChange={e => handleChange('nome_fantasia', e.target.value)} required placeholder="Ex: Acme Corp" />
                        </div>
                        <div>
                            <label style={labelStyle}>Razão Social</label>
                            <input style={inputStyle} value={form.razao_social} onChange={e => handleChange('razao_social', e.target.value)} placeholder="Ex: Acme Corporation LTDA" />
                        </div>
                        
                        <div>
                            <label style={labelStyle}>CNPJ</label>
                            <input style={inputStyle} value={form.cnpj} onChange={e => handleChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label style={labelStyle}>Setor de Atuação</label>
                            <input style={inputStyle} value={form.setor} onChange={e => handleChange('setor', e.target.value)} placeholder="Ex: Tecnologia, Varejo" />
                        </div>
                        <div>
                            <label style={labelStyle}>Tamanho da Empresa</label>
                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.tamanho_empresa} onChange={e => handleChange('tamanho_empresa', e.target.value)}>
                                <option value="1-10">1 a 10 funcionários</option>
                                <option value="11-50">11 a 50 funcionários</option>
                                <option value="51-200">51 a 200 funcionários</option>
                                <option value="201-500">201 a 500 funcionários</option>
                                <option value="500+">Mais de 500 funcionários</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Ano de Fundação</label>
                            <input type="number" style={inputStyle} value={form.fundacao_ano} onChange={e => handleChange('fundacao_ano', e.target.value)} placeholder="Ex: 2010" />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Sobre a Empresa (Descrição)</label>
                            <textarea 
                                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} 
                                value={form.descricao} 
                                onChange={e => handleChange('descricao', e.target.value)} 
                                placeholder="Escreva brevemente sobre a empresa, missão, valores..."
                            />
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Mail style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Contato e Acesso</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>E-mail de Contato *</label>
                            <input type="email" style={inputStyle} value={form.email_contato} onChange={e => handleChange('email_contato', e.target.value)} required placeholder="contato@empresa.com" />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>Alterar este e-mail altera apenas o contato público, não afeta a conta de acesso criada inicialmente.</span>
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone</label>
                            <input style={inputStyle} value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} placeholder="(00) 0000-0000" />
                        </div>
                        <div>
                            <label style={labelStyle}>WhatsApp</label>
                            <input style={inputStyle} value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="(00) 90000-0000" />
                        </div>
                        <div>
                            <label style={labelStyle}>Website</label>
                            <input style={inputStyle} value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://..." />
                        </div>
                        <div>
                            <label style={labelStyle}>LinkedIn</label>
                            <input style={inputStyle} value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} placeholder="URL do perfil da empresa" />
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h2 style={sectionTitle}><MapPin style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Localização</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 8' }}>
                            <label style={labelStyle}>Logradouro</label>
                            <input style={inputStyle} value={form.logradouro} onChange={e => handleChange('logradouro', e.target.value)} placeholder="Rua, Avenida..." />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <label style={labelStyle}>Número</label>
                            <input style={inputStyle} value={form.numero} onChange={e => handleChange('numero', e.target.value)} placeholder="Ex: 123, S/N" />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <label style={labelStyle}>Bairro</label>
                            <input style={inputStyle} value={form.bairro} onChange={e => handleChange('bairro', e.target.value)} placeholder="Ex: Centro" />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <label style={labelStyle}>Cidade</label>
                            <input style={inputStyle} value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} placeholder="Ex: Caldas Novas" />
                        </div>
                        <div style={{ gridColumn: 'span 4' }}>
                            <label style={labelStyle}>Estado (UF)</label>
                            <input value={form.estado} onChange={e => handleChange('estado', e.target.value)} placeholder="Ex: GO" maxLength={2} style={{ ...inputStyle, textTransform: 'uppercase' }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <Link href="/admin/empresas" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.5rem', borderRadius: 10,
                        border: '1.5px solid #e2e8f0', background: '#fff',
                        color: '#64748b', fontSize: '0.875rem', fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        Cancelar
                    </Link>
                    <button type="submit" disabled={loading} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.75rem', borderRadius: 10,
                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                        color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                    }}>
                        {loading ? (
                            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        ) : (
                            <Save style={{ width: 16, height: 16 }} />
                        )}
                        {loading ? 'Salvando...' : 'Salvar Empresa'}
                    </button>
                    {loading && <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>}
                </div>
            </form>
        </div>
    )
}

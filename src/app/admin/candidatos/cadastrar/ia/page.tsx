'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Save, Plus, X, User, Briefcase, GraduationCap,
    Wrench, Globe, FileText, Phone, DollarSign, ExternalLink, Sparkles, Target
} from 'lucide-react'
import {
    cadastrarCandidato as cadastrarAction,
    buscarMeuUsuarioCompleto,
    type ExperienciaItem, type FormacaoItem, type IdiomaItem, type DocumentoItem
} from '@/actions/candidatos'
import { gerarDadosCurriculoComIA, gerarObjetivoComIA } from '@/actions/openai'

const NIVEL_IDIOMA = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
    { value: 'fluente', label: 'Fluente' },
    { value: 'nativo', label: 'Nativo' },
]

const maskPhone = (v: string) => {
    let digits = v.replace(/\D/g, '').substring(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const maskCurrency = (v: string | number) => {
    let digits = String(v).replace(/\D/g, '');
    if (!digits) return '';
    const num = (parseInt(digits, 10) / 100).toFixed(2);
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
};

const cleanCurrency = (v: string) => {
    if (!v) return '';
    return v.replace(/\./g, '').replace(',', '.');
};

const maskMMAAAA = (v: string) => {
    let digits = v.replace(/\D/g, '').substring(0, 6);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function CadastrarCandidatoIAPage() {
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    // ── MODAL IA STATUS ──
    const [showIaModal, setShowIaModal] = useState(false)
    const [iaLoading, setIaLoading] = useState(false)
    const [iaObjetivoLoading, setIaObjetivoLoading] = useState(false)
    const [iaErro, setIaErro] = useState('')
    
    // Tipo do usuário para mudar UI
    const [userTipo, setUserTipo] = useState<string>('admin')
    const [creditosIA, setCreditosIA] = useState(0)

    // ── DADOS DO MODAL IA ──
    const [iaObjetivo, setIaObjetivo] = useState('')
    const [iaExperiencias, setIaExperiencias] = useState<{ cargo: string, empresa: string, inicio: string, fim: string }[]>([
        { cargo: '', empresa: '', inicio: '', fim: '' }
    ])

    // Form principal
    const [form, setForm] = useState({
        user_id: 0,
        nome_completo: '',
        cargo_desejado: '',
        resumo: '',
        local: '',
        data_nascimento: '',
        email: '',
        telefone: '',
        whatsapp: '',
        linkedin: '',
        portfolio: '',
        github: '',
        disponivel: true,
        pretensao_min: '',
        pretensao_max: '',
    })

    // Listas dinâmicas
    const [experiencias, setExperiencias] = useState<ExperienciaItem[]>([
        { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [formacoes, setFormacoes] = useState<FormacaoItem[]>([
        { curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [habilidades, setHabilidades] = useState<string[]>([''])
    const [idiomas, setIdiomas] = useState<IdiomaItem[]>([{ idioma: '', nivel: '' }])
    const [documentos, setDocumentos] = useState<DocumentoItem[]>([{ titulo: '', tipo: '', url: '' }])

    useEffect(() => {
        async function load() {
            const u = await buscarMeuUsuarioCompleto();
            if (u) {
                setUserTipo(u.tipo || 'admin');
                setCreditosIA(u.creditos_ia ?? 0);
                const c = u.candidatos && u.candidatos.length > 0 ? u.candidatos[0] : {};
                setForm(prev => ({
                    ...prev,
                    user_id: u.id,
                    nome_completo: prev.nome_completo || `${u.nome || ''} ${u.sobrenome || ''}`.trim(),
                    email: prev.email || u.email || '',
                    telefone: prev.telefone || maskPhone(u.telefone || ''),
                    local: prev.local || c.local || '',
                    data_nascimento: prev.data_nascimento || c.data_nascimento || '',
                    whatsapp: prev.whatsapp || maskPhone(c.whatsapp || ''),
                    linkedin: prev.linkedin || c.linkedin || '',
                    portfolio: prev.portfolio || c.portfolio || '',
                    github: prev.github || c.github || '',
                    pretensao_min: prev.pretensao_min || (c.pretensao_min ? maskCurrency(Number(c.pretensao_min).toFixed(2)) : ''),
                    pretensao_max: prev.pretensao_max || (c.pretensao_max ? maskCurrency(Number(c.pretensao_max).toFixed(2)) : ''),
                }));
            }
        }
        load();
    }, [])

    function updateField(field: string, value: any) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleGerarObjetivoAuto() {
        setIaErro('')
        if (!form.cargo_desejado?.trim()) {
            setIaErro('A IA precisa saber o "Cargo Desejado" para criar o objetivo. Feche esta janela, preencha o Cargo e tente de novo.')
            return
        }

        setIaObjetivoLoading(true)
        try {
            const res = await gerarObjetivoComIA(form.cargo_desejado)
            if (!res.success || !res.data) {
                setIaErro(res.error || 'Erro ao gerar detalhamento do objetivo. Tente novamente.')
            } else {
                setIaObjetivo(res.data)
                setCreditosIA(prev => Math.max(0, prev - 1))
            }
        } catch (e) {
            setIaErro('Falha técnica ao falar com a IA.')
        }
        setIaObjetivoLoading(false)
    }

    async function handleGerarIA() {
        setIaErro('')
        if (!iaObjetivo.trim()) {
            setIaErro('O Resumo/Objetivo é essencial para a IA trabalhar.')
            return
        }

        setIaLoading(true)

        try {
            const payload = {
                objetivo: iaObjetivo,
                experiencias_basicas: iaExperiencias.filter(e => e.cargo.trim() || e.empresa.trim())
            }

            const res = await gerarDadosCurriculoComIA(payload)

            if (!res.success || !res.data) {
                setIaErro(res.error || 'Aconteceu um erro ao contatar a inteligência artificial.')
                setIaLoading(false)
                return
            }

            const aiData = res.data

            // Popula os dados
            setForm(prev => ({
                ...prev,
                resumo: aiData.resumo || iaObjetivo,
                cargo_desejado: aiData.cargo_desejado || prev.cargo_desejado,
            }))

            if (aiData.habilidades && Array.isArray(aiData.habilidades) && aiData.habilidades.length > 0) {
                setHabilidades(aiData.habilidades)
            }

            if (aiData.experiencias && Array.isArray(aiData.experiencias) && aiData.experiencias.length > 0) {
                setExperiencias(aiData.experiencias)
            } else {
                setExperiencias([{ cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])
            }

            setCreditosIA(prev => Math.max(0, prev - 1))
            setIaLoading(false)
            setShowIaModal(false) // Fecha o modal após preencher com sucesso!
        } catch (e: any) {
            setIaLoading(false)
            setIaErro('Erro de conexão com servidor IA.')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')

        if (!form.user_id) { setErro('Erro: Usuário Mestre Perdido na Sessão.'); return }
        if (!form.nome_completo.trim()) { setErro('Nome completo é obrigatório.'); return }
        if (!form.email.trim()) { setErro('E-mail é obrigatório.'); return }

        setLoading(true)

        try {
            const resultado = await cadastrarAction({
                ...form,
                pretensao_min: cleanCurrency(form.pretensao_min),
                pretensao_max: cleanCurrency(form.pretensao_max),
                experiencias: experiencias.filter(e => e.cargo.trim() || e.empresa.trim()),
                formacoes: formacoes.filter(f => f.curso.trim() || f.instituicao.trim()),
                habilidades: habilidades.filter(h => h.trim()),
                idiomas: idiomas.filter(i => i.idioma.trim()),
                documentos: documentos.filter(d => d.titulo.trim()),
            })

            if (!resultado.success) {
                setLoading(false)
                setErro(resultado.error || 'Erro ao cadastrar candidato.')
                return
            }

            if (userTipo === 'candidato') {
                window.location.href = '/admin/candidato/listar-curriculos'
            } else {
                window.location.href = '/admin/candidatos'
            }
        } catch {
            setLoading(false)
            setErro('Erro de conexão. Tente novamente.')
        }
    }

    // ── Estilos ──
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10,
        border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#09355F',
        background: '#f8fafc', outline: 'none', transition: 'border-color 0.18s',
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
    const removeBtnStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8, border: 'none',
        background: '#fef2f2', color: '#dc2626', cursor: 'pointer', flexShrink: 0,
    }
    const addBtnStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        marginTop: '0.65rem', padding: '0.45rem 0.85rem',
        borderRadius: 8, border: '1.5px dashed #cbd5e1',
        background: '#f8fafc', color: '#64748b',
        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link href={userTipo === 'candidato' ? '/admin/candidato/listar-curriculos' : '/admin/candidatos'} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                        color: '#64748b', textDecoration: 'none',
                    }}>
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F' }}>
                            {userTipo === 'candidato' ? 'Cadastrar currículo' : 'Cadastrar Candidato'}
                        </h1>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {userTipo === 'candidato' ? 'Crie uma nova versão do seu currículo' : 'Preencha os dados do candidato'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {userTipo === 'candidato' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.5rem 1rem', borderRadius: 8,
                            background: '#fff', border: '1px solid #e2e8f0',
                            color: '#334155', fontSize: '0.9rem', fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        }}>
                            <Sparkles style={{ width: 16, height: 16, color: '#0ea5e9' }} />
                            <span>Créditos IA: <strong>{creditosIA}</strong></span>
                        </div>
                    )}
                    <button type="button" onClick={() => setShowIaModal(true)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.75rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff', fontSize: '0.875rem', fontWeight: 800,
                        border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    }}>
                        <Sparkles style={{ width: 16, height: 16 }} />
                        Preencher com IA
                    </button>
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
                    <h2 style={sectionTitle}><Target style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Cargo Desejado</h2>
                    <div>
                        <label style={labelStyle}>Para qual vaga/área o candidato está se aplicando?</label>
                        <input style={inputStyle} placeholder="Ex: Desenvolvedor Full-Stack" value={form.cargo_desejado} onChange={e => updateField('cargo_desejado', e.target.value)} />
                    </div>
                </div>

                {/* ── Dados Pessoais ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><User style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Dados Pessoais</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Nome Completo *</label>
                            <input style={inputStyle} placeholder="Nome completo" value={form.nome_completo} onChange={e => updateField('nome_completo', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Localização</label>
                            <input style={inputStyle} placeholder="Ex: São Paulo, SP" value={form.local} onChange={e => updateField('local', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Data de Nascimento</label>
                            <input type="date" style={inputStyle} value={form.data_nascimento} onChange={e => updateField('data_nascimento', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, visibility: 'hidden' }}>_</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.disponivel} onChange={e => updateField('disponivel', e.target.checked)} />
                                Disponível para novas oportunidades
                            </label>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Resumo / Sobre</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                                placeholder="Fale um pouco sobre você, sua experiência e objetivos..."
                                value={form.resumo} onChange={e => updateField('resumo', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Contato ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Phone style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Contato</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>E-mail *</label>
                            <input type="email" style={inputStyle} placeholder="email@email.com" value={form.email} onChange={e => updateField('email', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone</label>
                            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => updateField('telefone', maskPhone(e.target.value))} />
                        </div>
                        <div>
                            <label style={labelStyle}>WhatsApp</label>
                            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e => updateField('whatsapp', maskPhone(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* ── Links ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><ExternalLink style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Links</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>LinkedIn</label>
                            <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e => updateField('linkedin', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Portfólio</label>
                            <input style={inputStyle} placeholder="https://meuportfolio.com" value={form.portfolio} onChange={e => updateField('portfolio', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>GitHub</label>
                            <input style={inputStyle} placeholder="https://github.com/..." value={form.github} onChange={e => updateField('github', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* ── Pretensão Salarial ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><DollarSign style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Pretensão Salarial</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Mínimo (R$)</label>
                            <input type="text" style={inputStyle} placeholder="3.000,00" value={form.pretensao_min} onChange={e => updateField('pretensao_min', maskCurrency(e.target.value))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Máximo (R$)</label>
                            <input type="text" style={inputStyle} placeholder="5.000,00" value={form.pretensao_max} onChange={e => updateField('pretensao_max', maskCurrency(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* ── Experiências ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Experiências Profissionais</h2>
                    {experiencias.map((exp, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '0.75rem', border: '1px solid #e8edf5', position: 'relative' }}>
                            {experiencias.length > 1 && (
                                <button type="button" onClick={() => setExperiencias(prev => prev.filter((_, i) => i !== idx))} style={{ ...removeBtnStyle, position: 'absolute', top: 8, right: 8 }} aria-label="Remover experiência">
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={labelStyle}>Cargo *</label>
                                    <input style={inputStyle} placeholder="Ex: Desenvolvedor Front-End" value={exp.cargo} onChange={e => { const v = [...experiencias]; v[idx].cargo = e.target.value; setExperiencias(v) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Empresa *</label>
                                    <input style={inputStyle} placeholder="Nome da empresa" value={exp.empresa} onChange={e => { const v = [...experiencias]; v[idx].empresa = e.target.value; setExperiencias(v) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Data Início</label>
                                    <input type="date" style={inputStyle} value={exp.data_inicio} onChange={e => { const v = [...experiencias]; v[idx].data_inicio = e.target.value; setExperiencias(v) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Data Fim</label>
                                    <input type="date" style={inputStyle} disabled={exp.em_andamento} value={exp.data_fim} onChange={e => { const v = [...experiencias]; v[idx].data_fim = e.target.value; setExperiencias(v) }} />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={exp.em_andamento} onChange={e => { const v = [...experiencias]; v[idx].em_andamento = e.target.checked; if (e.target.checked) v[idx].data_fim = ''; setExperiencias(v) }} />
                                        Em andamento
                                    </label>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Descrição</label>
                                    <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Principais atividades..." value={exp.descricao} onChange={e => { const v = [...experiencias]; v[idx].descricao = e.target.value; setExperiencias(v) }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => setExperiencias(prev => [...prev, { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])} style={addBtnStyle}>
                        <Plus style={{ width: 14, height: 14 }} /> Adicionar experiência
                    </button>
                </div>

                {/* ── Formação Acadêmica ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><GraduationCap style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Formação Acadêmica</h2>
                    {formacoes.map((f, idx) => (
                        <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '0.75rem', border: '1px solid #e8edf5', position: 'relative' }}>
                            {formacoes.length > 1 && (
                                <button type="button" onClick={() => setFormacoes(prev => prev.filter((_, i) => i !== idx))} style={{ ...removeBtnStyle, position: 'absolute', top: 8, right: 8 }} aria-label="Remover formação">
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={labelStyle}>Curso *</label>
                                        <input style={inputStyle} placeholder="Ex: Ciência da Computação" value={f.curso} onChange={e => { const v = [...formacoes]; v[idx].curso = e.target.value; setFormacoes(v) }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Instituição *</label>
                                        <input style={inputStyle} placeholder="Nome da instituição" value={f.instituicao} onChange={e => { const v = [...formacoes]; v[idx].instituicao = e.target.value; setFormacoes(v) }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={labelStyle}>Grau</label>
                                        <select style={inputStyle} value={f.grau} onChange={e => { const v = [...formacoes]; v[idx].grau = e.target.value; setFormacoes(v) }}>
                                            <option value="">Selecione...</option>
                                            <option value="sem_alfabetizacao">Sem alfabetização</option>
                                            <option value="ensino_fundamental">Ensino fundamental</option>
                                            <option value="ensino_medio">Ensino médio</option>
                                            <option value="tecnico">Técnico</option>
                                            <option value="graduacao">Graduação</option>
                                            <option value="pos-graduacao">Pós-Graduação</option>
                                            <option value="mestrado">Mestrado</option>
                                            <option value="doutorado">Doutorado</option>
                                            <option value="mba">MBA</option>
                                            <option value="outro">Outro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Data Início</label>
                                        <input type="date" style={inputStyle} value={f.data_inicio} onChange={e => { const v = [...formacoes]; v[idx].data_inicio = e.target.value; setFormacoes(v) }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Data Fim</label>
                                        <input type="date" style={inputStyle} disabled={f.em_andamento} value={f.data_fim} onChange={e => { const v = [...formacoes]; v[idx].data_fim = e.target.value; setFormacoes(v) }} />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={f.em_andamento} onChange={e => { const v = [...formacoes]; v[idx].em_andamento = e.target.checked; if (e.target.checked) v[idx].data_fim = ''; setFormacoes(v) }} />
                                            Em andamento
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => setFormacoes(prev => [...prev, { curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }])} style={addBtnStyle}>
                        <Plus style={{ width: 14, height: 14 }} /> Adicionar formação
                    </button>
                </div>

                {/* ── Habilidades ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Wrench style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Habilidades</h2>
                    {habilidades.map((h, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input style={{ ...inputStyle, flex: 1 }} placeholder="Ex: React, TypeScript, Node.js..." value={h} onChange={e => { const v = [...habilidades]; v[idx] = e.target.value; setHabilidades(v) }} />
                            {habilidades.length > 1 && (
                                <button type="button" onClick={() => setHabilidades(prev => prev.filter((_, i) => i !== idx))} style={removeBtnStyle} aria-label="Remover habilidade">
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => setHabilidades(prev => [...prev, ''])} style={addBtnStyle}>
                        <Plus style={{ width: 14, height: 14 }} /> Adicionar habilidade
                    </button>
                </div>

                {/* ── Idiomas ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Globe style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Idiomas</h2>
                    {idiomas.map((i, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input style={{ ...inputStyle, flex: 1 }} placeholder="Ex: Inglês" value={i.idioma} onChange={e => { const v = [...idiomas]; v[idx].idioma = e.target.value; setIdiomas(v) }} />
                            <select style={{ ...inputStyle, flex: '0 0 180px' }} value={i.nivel} onChange={e => { const v = [...idiomas]; v[idx].nivel = e.target.value; setIdiomas(v) }}>
                                <option value="">Nível...</option>
                                {NIVEL_IDIOMA.map(n => (<option key={n.value} value={n.value}>{n.label}</option>))}
                            </select>
                            {idiomas.length > 1 && (
                                <button type="button" onClick={() => setIdiomas(prev => prev.filter((_, i2) => i2 !== idx))} style={removeBtnStyle} aria-label="Remover idioma">
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => setIdiomas(prev => [...prev, { idioma: '', nivel: '' }])} style={addBtnStyle}>
                        <Plus style={{ width: 14, height: 14 }} /> Adicionar idioma
                    </button>
                </div>

                {/* ── Documentos ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><FileText style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Documentos</h2>
                    {documentos.map((d, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input style={{ ...inputStyle, flex: 1 }} placeholder="Título (Ex: Currículo)" value={d.titulo} onChange={e => { const v = [...documentos]; v[idx].titulo = e.target.value; setDocumentos(v) }} />
                            <input style={{ ...inputStyle, flex: '0 0 140px' }} placeholder="Tipo (PDF, DOC)" value={d.tipo} onChange={e => { const v = [...documentos]; v[idx].tipo = e.target.value; setDocumentos(v) }} />
                            <input style={{ ...inputStyle, flex: 1 }} placeholder="URL do documento" value={d.url} onChange={e => { const v = [...documentos]; v[idx].url = e.target.value; setDocumentos(v) }} />
                            {documentos.length > 1 && (
                                <button type="button" onClick={() => setDocumentos(prev => prev.filter((_, i) => i !== idx))} style={removeBtnStyle} aria-label="Remover documento">
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => setDocumentos(prev => [...prev, { titulo: '', tipo: '', url: '' }])} style={addBtnStyle}>
                        <Plus style={{ width: 14, height: 14 }} /> Adicionar documento
                    </button>
                </div>

                {/* ── Botões ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <Link href={userTipo === 'candidato' ? '/admin/candidato/listar-curriculos' : '/admin/candidatos'} style={{
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
                        {loading ? 'Salvando...' : (userTipo === 'candidato' ? 'Salvar Currículo' : 'Cadastrar Candidato')}
                    </button>
                </div>
            </form>

            {/* ── MODAL IA ── */}
            {showIaModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(9,53,95,0.4)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    backdropFilter: 'blur(3px)',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 1050,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
                    }}>
                        {/* Header do modal */}
                        <div style={{
                            padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8edf5',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#f8fafc'
                        }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles style={{ width: 20, height: 20, color: '#10b981' }} />
                                Preencher Currículo com IA
                            </h2>
                            <button onClick={() => setShowIaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X style={{ width: 22, height: 22 }} />
                            </button>
                        </div>

                        {/* Corpo do modal - scroll */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                                    Escreva um breve resumo e adicione suas experiências de forma simples. A inteligência artificial irá criar as descrições detalhadas e adivinhar as habilidades mais adequadas automaticamente.
                                </p>

                                {iaErro && (
                                    <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                                        {iaErro}
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Objetivo / Breve Resumo Profissional *</label>
                                    <button type="button" onClick={handleGerarObjetivoAuto} disabled={iaObjetivoLoading} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem',
                                        borderRadius: 8, border: 'none', background: '#dcfce7', color: '#166534',
                                        fontSize: '0.75rem', fontWeight: 800, cursor: iaObjetivoLoading ? 'not-allowed' : 'pointer'
                                    }}>
                                        {iaObjetivoLoading ? <div style={{ width: 12, height: 12, border: '2px solid rgba(22,101,52,0.3)', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <Sparkles style={{ width: 12, height: 12 }} />}
                                        {iaObjetivoLoading ? 'Gerando...' : 'Gerar com IA'}
                                    </button>
                                </div>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 80, marginBottom: '1rem' }}
                                    placeholder="Conte em poucas palavras sobre você e o que quer..."
                                    value={iaObjetivo} onChange={e => setIaObjetivo(e.target.value)}
                                />

                                <label style={labelStyle}>Experiências Base (Apenas Cargo, Empresa e Datas)</label>
                                {iaExperiencias.map((exp, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 90px 90px 30px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Cargo</label>
                                            <input style={{...inputStyle, padding: '0.5rem'}} placeholder="Ex: Atendente" value={exp.cargo} onChange={e => { const v = [...iaExperiencias]; v[idx].cargo = e.target.value; setIaExperiencias(v) }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Empresa</label>
                                            <input style={{...inputStyle, padding: '0.5rem'}} placeholder="Ex: McDonald's" value={exp.empresa} onChange={e => { const v = [...iaExperiencias]; v[idx].empresa = e.target.value; setIaExperiencias(v) }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Início</label>
                                            <input style={{...inputStyle, padding: '0.5rem', textAlign: 'center'}} placeholder="MM/AAAA" value={exp.inicio} onChange={e => { const v = [...iaExperiencias]; v[idx].inicio = maskMMAAAA(e.target.value); setIaExperiencias(v) }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Fim</label>
                                            <input style={{...inputStyle, padding: '0.5rem', textAlign: 'center'}} placeholder="MM/AAAA" value={exp.fim} onChange={e => { const v = [...iaExperiencias]; v[idx].fim = maskMMAAAA(e.target.value); setIaExperiencias(v) }} />
                                        </div>
                                        {iaExperiencias.length > 1 && (
                                            <button type="button" onClick={() => setIaExperiencias(prev => prev.filter((_, i) => i !== idx))} style={{ ...removeBtnStyle, height: '36px' }} title="Remover">
                                                <X style={{ width: 14, height: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setIaExperiencias(prev => [...prev, { cargo: '', empresa: '', inicio: '', fim: '' }])} style={addBtnStyle}>
                                    <Plus style={{ width: 14, height: 14 }} /> Mais uma experiência
                                </button>
                            </div>
                        </div>

                        {/* Footer do modal */}
                        <div style={{
                            padding: '1.25rem 1.5rem', borderTop: '1px solid #e8edf5', background: '#f8fafc',
                            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
                        }}>
                            <button onClick={() => setShowIaModal(false)} disabled={iaLoading} style={{
                                padding: '0.6rem 1.25rem', borderRadius: 8, border: '1.5px solid #cbd5e1',
                                background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                            }}>
                                Cancelar
                            </button>
                            <button onClick={handleGerarIA} disabled={iaLoading} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff', fontWeight: 700, cursor: iaLoading ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
                            }}>
                                {iaLoading ? (
                                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                ) : (
                                    <Sparkles style={{ width: 14, height: 14 }} />
                                )}
                                {iaLoading ? 'Gerando dados...' : 'Gerar e Preencher Formulário'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

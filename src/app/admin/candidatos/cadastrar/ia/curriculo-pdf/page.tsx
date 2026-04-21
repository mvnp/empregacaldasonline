'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Save, Plus, X, User, Briefcase, GraduationCap,
    Wrench, Globe, Phone, DollarSign, ExternalLink, FileText,
    Upload, CheckCircle, AlertCircle, Loader2, Target, FileScan, Tag
} from 'lucide-react'
import {
    cadastrarCandidatoViaPDF,
    type ExperienciaItem, type FormacaoItem, type IdiomaItem,
} from '@/actions/candidatos'
import { extrairDadosCurriculoPDF, gerarResumoComIA, gerarCargoComIA, gerarDescricaoExperienciaComIA, gerarHabilidadesComIA } from '@/actions/openai'
import CategorizarModal from '@/components/admin/CategorizarModal'

/* ── helpers ── */
const gerarCpfAleatorio = () => {
    const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
    let d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0)
    d1 = 11 - (d1 % 11)
    if (d1 >= 10) d1 = 0
    let d2 = n.reduce((acc, val, i) => acc + val * (11 - i), 0) + d1 * 2
    d2 = 11 - (d2 % 11)
    if (d2 >= 10) d2 = 0
    n.push(d1, d2)
    const s = n.join('')
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`
}

const formatarCamelCase = (texto: string) => {
    if (!texto) return ''
    const preposicoes = ['a', 'ante', 'após', 'até', 'com', 'contra', 'de', 'desde', 'em', 'entre', 'para', 'perante', 'por', 'sem', 'sob', 'sobre', 'trás']
    return texto.split(' ').map((palavra, index) => {
        const lower = palavra.toLowerCase()
        if (index > 0 && preposicoes.includes(lower)) {
            return lower
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1)
    }).join(' ')
}

const maskPhone = (v: string) => {
    let d = v.replace(/\D/g, '').substring(0, 11)
    if (!d) return ''
    if (d.length <= 2) return d
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
const maskCurrency = (v: string | number) => {
    let d = String(v).replace(/\D/g, '')
    if (!d) return ''
    const n = (parseInt(d, 10) / 100).toFixed(2)
    const [int, dec] = n.split('.')
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec
}
const cleanCurrency = (v: string) => v ? v.replace(/\./g, '').replace(',', '.') : ''

const NIVEL_IDIOMA = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
    { value: 'fluente', label: 'Fluente' },
    { value: 'nativo', label: 'Nativo' },
]

/* ── Tipos do form ── */
interface FormState {
    user_id: number
    nome: string
    sobrenome: string
    email: string
    cpf: string
    data_nascimento: string
    telefone: string
    whatsapp: string
    cargo_desejado: string
    resumo: string
    local: string
    linkedin: string
    portfolio: string
    github: string
    disponivel: boolean
    pretensao_min: string
    pretensao_max: string
}

/* ── Componente principal ── */
export default function CadastrarCandidatoPDFPage() {
    /* Modal PDF */
    const [showPdfModal, setShowPdfModal] = useState(true)
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [pdfBase64, setPdfBase64] = useState<string>('')
    const [pdfDragOver, setPdfDragOver] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [pdfErro, setPdfErro] = useState('')
    const [pdfStep, setPdfStep] = useState<'upload' | 'reading' | 'done'>('upload')
    const fileInputRef = useRef<HTMLInputElement>(null)

    /* Form */
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)
    const [userExistente, setUserExistente] = useState(false)
    const [resumoIALoading, setResumoIALoading] = useState(false)
    const [resumoIAErro, setResumoIAErro] = useState('')
    const [cargoIALoading, setCargoIALoading] = useState(false)
    const [cargoIAErro, setCargoIAErro] = useState('')
    const [habilidadesIALoading, setHabilidadesIALoading] = useState(false)
    const [habilidadesIAErro, setHabilidadesIAErro] = useState('')
    const [expIALoading, setExpIALoading] = useState<Record<number, boolean>>({})
    const [expIAErro, setExpIAErro] = useState<Record<number, string>>({})
    const [showCategorizarModal, setShowCategorizarModal] = useState(false)
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([])

    const [form, setForm] = useState<FormState>({
        user_id: 0,
        nome: '',
        sobrenome: '',
        email: '',
        cpf: '',
        data_nascimento: '',
        telefone: '',
        whatsapp: '',
        cargo_desejado: '',
        resumo: '',
        local: '',
        linkedin: '',
        portfolio: '',
        github: '',
        disponivel: true,
        pretensao_min: '',
        pretensao_max: '',
    })

    const [experiencias, setExperiencias] = useState<ExperienciaItem[]>([
        { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [formacoes, setFormacoes] = useState<FormacaoItem[]>([
        { curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [habilidades, setHabilidades] = useState<string[]>([''])
    const [idiomas, setIdiomas] = useState<IdiomaItem[]>([{ idioma: 'Português', nivel: 'nativo' }])

    /* ── Converter file para base64 ── */
    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result as string
                // Remove o prefixo data:application/pdf;base64,
                resolve(result.split(',')[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    /* ── Tratar seleção de arquivo ── */
    async function handlePdfSelect(file: File) {
        if (file.type !== 'application/pdf') {
            setPdfErro('Apenas arquivos PDF são aceitos.')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setPdfErro('O arquivo deve ter menos de 10 MB.')
            return
        }
        setPdfErro('')
        setPdfFile(file)
        const b64 = await fileToBase64(file)
        setPdfBase64(b64)
    }

    /* ── Enviar PDF para IA ── */
    async function handleLerPDF() {
        if (!pdfBase64 || !pdfFile) { setPdfErro('Selecione um arquivo PDF.'); return }
        setPdfErro('')
        setPdfLoading(true)
        setPdfStep('reading')

        try {
            const res = await extrairDadosCurriculoPDF(pdfBase64)

            if (!res.success) {
                setPdfErro(res.error || 'Erro ao processar o PDF.')
                setPdfStep('upload')
                setPdfLoading(false)
                return
            }

            const d = res.data

            const nomeSlug = `${d.nome || ''}${d.sobrenome || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'candidato'
            const fallbackEmail = `${nomeSlug}_${Date.now().toString().slice(-4)}@eco.com.br`

            // Preencher form com dados extraídos
            setForm(prev => ({
                ...prev,
                nome: d.nome || '',
                sobrenome: d.sobrenome || '',
                email: d.email?.trim() || fallbackEmail,
                cpf: d.cpf || gerarCpfAleatorio(),
                data_nascimento: d.data_nascimento || '1900-01-01',
                telefone: d.telefone ? maskPhone(d.telefone) : '',
                whatsapp: d.whatsapp ? maskPhone(d.whatsapp) : (d.telefone ? maskPhone(d.telefone) : ''),
                cargo_desejado: d.cargo_desejado || '',
                resumo: d.resumo || '',
                local: d.local || '',
                linkedin: d.linkedin || '',
                portfolio: d.portfolio || '',
                github: d.github || '',
            }))

            if (d.habilidades?.length > 0) {
                setHabilidades(d.habilidades.map((h: string) => formatarCamelCase(h)))
            } else {
                setHabilidades([])
            }

            if (d.experiencias?.length > 0) {
                setExperiencias(d.experiencias.map((e: any) => {
                    const dtInicio = e.data_inicio || ''
                    const dtFim = e.data_fim || ''
                    const isEmAndamento = e.em_andamento || !dtInicio || !dtFim
                    return {
                        ...e,
                        cargo: formatarCamelCase(e.cargo || ''),
                        em_andamento: isEmAndamento,
                        data_fim: isEmAndamento ? '' : dtFim,
                    }
                }))
            } else {
                setExperiencias([{ cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])
            }

            if (d.formacoes?.length > 0) {
                setFormacoes(d.formacoes.map((f: any) => ({
                    ...f,
                    curso: formatarCamelCase(f.curso || ''),
                    instituicao: formatarCamelCase(f.instituicao || ''),
                })))
            } else {
                setFormacoes([{ curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }])
            }

            if (d.idiomas?.length > 0) {
                const hasPt = d.idiomas.some((i: any) => i.idioma?.toLowerCase()?.includes('portug'))
                if (hasPt) {
                    setIdiomas(d.idiomas)
                } else {
                    setIdiomas([{ idioma: 'Português', nivel: 'nativo' }, ...d.idiomas])
                }
            } else {
                setIdiomas([{ idioma: 'Português', nivel: 'nativo' }])
            }

            setPdfStep('done')
        } catch (e: any) {
            setPdfErro('Erro inesperado ao processar o PDF.')
            setPdfStep('upload')
        } finally {
            setPdfLoading(false)
        }
    }

    /* ── Gerar Resumo com IA ── */
    async function handleGerarResumo() {
        setResumoIAErro('')
        setResumoIALoading(true)
        try {
            const res = await gerarResumoComIA({
                cargo: form.cargo_desejado,
                resumoAtual: form.resumo,
                habilidades: habilidades.filter(h => h.trim()),
                experiencias: experiencias.filter(e => e.cargo.trim() || e.empresa.trim()),
            })
            if (res.success) {
                setForm(p => ({ ...p, resumo: res.data }))
            } else {
                setResumoIAErro(res.error || 'Erro ao gerar resumo.')
            }
        } catch {
            setResumoIAErro('Erro de conexão com a IA.')
        } finally {
            setResumoIALoading(false)
        }
    }

    /* ── Gerar Cargo com IA ── */
    async function handleGerarCargo() {
        if (!form.resumo.trim()) {
            setCargoIAErro('Preencha o resumo primeiro.')
            return
        }
        setCargoIAErro('')
        setCargoIALoading(true)
        try {
            const res = await gerarCargoComIA(form.resumo)
            if (res.success) {
                setForm(p => ({ ...p, cargo_desejado: res.data }))
            } else {
                setCargoIAErro(res.error || 'Erro ao sugerir cargo.')
            }
        } catch {
            setCargoIAErro('Erro de conexão com a IA.')
        } finally {
            setCargoIALoading(false)
        }
    }

    /* ── Gerar Descrição de Experiência com IA ── */
    async function handleGerarDescricaoExp(idx: number) {
        const exp = experiencias[idx]
        if (!exp.cargo.trim() || !exp.empresa.trim()) {
            setExpIAErro(p => ({ ...p, [idx]: 'Preencha Cargo e Empresa primeiro.' }))
            return
        }

        setExpIAErro(p => ({ ...p, [idx]: '' }))
        setExpIALoading(p => ({ ...p, [idx]: true }))

        try {
            const res = await gerarDescricaoExperienciaComIA({ cargo: exp.cargo, empresa: exp.empresa, descricaoAtual: exp.descricao })
            if (res.success) {
                const v = [...experiencias]
                v[idx].descricao = res.data
                setExperiencias(v)
            } else {
                setExpIAErro(p => ({ ...p, [idx]: res.error || 'Erro ao gerar descrição.' }))
            }
        } catch {
            setExpIAErro(p => ({ ...p, [idx]: 'Erro de conexão com a IA.' }))
        } finally {
            setExpIALoading(p => ({ ...p, [idx]: false }))
        }
    }

    /* ── Gerar Habilidades com IA ── */
    async function handleGerarHabilidades() {
        if (!form.resumo.trim() && !experiencias.some(e => e.cargo.trim())) {
            setHabilidadesIAErro('Preencha o Resumo ou os Cargos das Experiências Profissionais primeiro.')
            return
        }

        setHabilidadesIAErro('')
        setHabilidadesIALoading(true)
        
        try {
            const cargos = experiencias.map(e => e.cargo.trim()).filter(Boolean)
            const res = await gerarHabilidadesComIA({ resumo: form.resumo, cargos })
            if (res.success) {
                // Atualiza o state injetando no fim se houver as vazias ou trocando tudo
                const c = habilidades.filter(h => h.trim() !== '')
                const novasAAdicionar = res.data.map(formatarCamelCase).filter(x => !c.includes(x))
                if (novasAAdicionar.length > 0) {
                    setHabilidades([...c, ...novasAAdicionar])
                }
            } else {
                setHabilidadesIAErro(res.error || 'Erro ao sugerir habilidades.')
            }
        } catch {
            setHabilidadesIAErro('Erro de conexão com a IA.')
        } finally {
            setHabilidadesIALoading(false)
        }
    }

    /* ── Submit do formulário ── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')

        if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
        if (!pdfBase64) { setErro('É necessário enviar o PDF do currículo.'); return }

        setLoading(true)

        try {
            const resultado = await cadastrarCandidatoViaPDF({
                nome: form.nome.trim(),
                sobrenome: form.sobrenome.trim(),
                email: form.email.trim() || null,
                data_nascimento: form.data_nascimento || null,
                cpf: form.cpf || null,
                telefone: form.telefone || null,
                whatsapp: form.whatsapp || null,
                cargo_desejado: form.cargo_desejado,
                resumo: form.resumo,
                local: form.local || null,
                linkedin: form.linkedin || null,
                portfolio: form.portfolio || null,
                github: form.github || null,
                habilidades: habilidades.filter(h => h.trim()),
                experiencias: experiencias.filter(e => e.cargo.trim() || e.empresa.trim()),
                formacoes: formacoes.filter(f => f.curso.trim() || f.instituicao.trim()),
                idiomas: idiomas.filter(i => i.idioma.trim()),
                categoriaIds: categoriasSelecionadas,
                pdfBase64,
                pdfNomeOriginal: pdfFile?.name || 'curriculo.pdf',
            })

            if (!resultado.success) {
                setErro(resultado.error || 'Erro ao cadastrar candidato.')
                setLoading(false)
                return
            }

            setUserExistente((resultado as any).userExistente || false)
            setSucesso(true)
            setTimeout(() => { window.location.href = '/admin/usuarios' }, 1500)
        } catch {
            setErro('Erro de conexão. Tente novamente.')
            setLoading(false)
        }
    }

    /* ── Estilos ── */
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

    if (sucesso) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: '1rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle style={{ width: 38, height: 38, color: '#16a34a' }} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', textAlign: 'center' }}>
                    Candidato cadastrado com sucesso!
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                    {userExistente
                        ? 'O usuário já existia no sistema — currículo vinculado ao seu cadastro.'
                        : 'Novo usuário candidato criado e currículo salvo com o PDF anexado.'}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Redirecionando para a lista de usuários...</p>
            </div>
        )
    }

    return (
        <div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .curriculo-pdf-page { animation: fadeIn 0.3s ease; }
                .drop-zone-active { border-color: #3b82f6 !important; background: #eff6ff !important; }
            `}</style>

            <div className="curriculo-pdf-page">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Link href="/admin/usuarios" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                            color: '#64748b', textDecoration: 'none',
                        }}>
                            <ArrowLeft style={{ width: 18, height: 18 }} />
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileScan style={{ width: 22, height: 22, color: '#3b82f6' }} />
                                Cadastrar via PDF
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Envie o currículo em PDF — a IA extrai e preenche os dados automaticamente</p>
                        </div>
                    </div>

                    {pdfFile && pdfStep === 'done' && (
                        <button
                            type="button"
                            onClick={() => setShowCategorizarModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.4rem', borderRadius: 10,
                                background: categoriasSelecionadas.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                                color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                                border: 'none', cursor: 'pointer',
                                boxShadow: categoriasSelecionadas.length > 0 ? '0 4px 12px rgba(16,185,129,0.25)' : '0 4px 12px rgba(9,53,95,0.25)',
                            }}
                        >
                            <Tag style={{ width: 16, height: 16 }} /> 
                            {categoriasSelecionadas.length > 0 ? `Categorizado (${categoriasSelecionadas.length})` : 'Categorizar'}
                        </button>
                    )}

                    {pdfFile && pdfStep === 'done' && (
                        <button
                            type="button"
                            onClick={() => {
                                const url = URL.createObjectURL(pdfFile)
                                window.open(url, '_blank')
                                setTimeout(() => URL.revokeObjectURL(url), 10000)
                            }}
                            title="Visualizar PDF"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', borderRadius: 10,
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                color: '#16a34a', fontSize: '0.8rem', fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            <CheckCircle style={{ width: 16, height: 16 }} />
                            {pdfFile.name}
                            <ExternalLink style={{ width: 13, height: 13, opacity: 0.7 }} />
                        </button>
                    )}

                    <button type="button" onClick={() => setShowPdfModal(true)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.65rem 1.4rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                        border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                    }}>
                        <Upload style={{ width: 16, height: 16 }} />
                        {pdfFile ? 'Trocar PDF' : 'Enviar PDF'}
                    </button>
                </div>

                {erro && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                        padding: '0.85rem 1.25rem', marginBottom: '1.25rem',
                        fontSize: '0.85rem', color: '#dc2626', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                        {erro}
                    </div>
                )}

                {/* Banner informativo quando PDF não foi enviado */}
                {!pdfFile && (
                    <div style={{
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        border: '1.5px solid #bfdbfe', borderRadius: 16,
                        padding: '1.5rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileScan style={{ width: 24, height: 24, color: '#fff' }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: '#1e40af', marginBottom: '0.25rem' }}>Envie o PDF do currículo para começar</p>
                            <p style={{ fontSize: '0.82rem', color: '#3b82f6' }}>Clique em "Enviar PDF" no canto superior direito. A IA vai ler o arquivo e preencher os campos automaticamente.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ── Dados Pessoais ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><User style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Dados Pessoais</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nome *</label>
                                <input style={inputStyle} placeholder="Ex: João" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Sobrenome</label>
                                <input style={inputStyle} placeholder="Ex: Silva" value={form.sobrenome} onChange={e => setForm(p => ({ ...p, sobrenome: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>CPF</label>
                                <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Data de Nascimento</label>
                                <input type="date" style={inputStyle} value={form.data_nascimento} onChange={e => setForm(p => ({ ...p, data_nascimento: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Localização</label>
                                <input style={inputStyle} placeholder="Ex: Caldas Novas, GO" value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ ...labelStyle, visibility: 'hidden' }}>_</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.disponivel} onChange={e => setForm(p => ({ ...p, disponivel: e.target.checked }))} />
                                    Disponível para novas oportunidades
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── Cargo Desejado + Resumo ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Target style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Cargo e Resumo</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Cargo Desejado</label>
                                    <button
                                        type="button"
                                        onClick={handleGerarCargo}
                                        disabled={cargoIALoading}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            padding: '0.3rem 0.75rem', borderRadius: 8,
                                            background: cargoIALoading ? '#e0e7ef' : '#094171',
                                            color: cargoIALoading ? '#94a3b8' : '#fff',
                                            fontSize: '0.72rem', fontWeight: 700, border: 'none',
                                            cursor: cargoIALoading ? 'not-allowed' : 'pointer',
                                            boxShadow: cargoIALoading ? 'none' : '0 2px 8px rgba(9,53,95,0.2)',
                                            transition: 'all 0.18s',
                                        }}
                                    >
                                        {cargoIALoading
                                            ? <div style={{ width: 12, height: 12, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                            : <span style={{ fontSize: '0.85rem' }}>✨</span>
                                        }
                                        {cargoIALoading ? 'Gerando...' : 'Gerar com IA'}
                                    </button>
                                </div>
                                {cargoIAErro && (
                                    <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.78rem', marginBottom: '0.5rem', border: '1px solid #fecaca' }}>
                                        {cargoIAErro}
                                    </div>
                                )}
                                <input style={inputStyle} placeholder="Ex: Auxiliar Administrativo" value={form.cargo_desejado} onChange={e => setForm(p => ({ ...p, cargo_desejado: e.target.value }))} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Resumo / Sobre</label>
                                    <button
                                        type="button"
                                        onClick={handleGerarResumo}
                                        disabled={resumoIALoading}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            padding: '0.3rem 0.75rem', borderRadius: 8,
                                            background: resumoIALoading ? '#e0e7ef' : '#094171',
                                            color: resumoIALoading ? '#94a3b8' : '#fff',
                                            fontSize: '0.72rem', fontWeight: 700, border: 'none',
                                            cursor: resumoIALoading ? 'not-allowed' : 'pointer',
                                            boxShadow: resumoIALoading ? 'none' : '0 2px 8px rgba(9,53,95,0.2)',
                                            transition: 'all 0.18s',
                                        }}
                                    >
                                        {resumoIALoading
                                            ? <div style={{ width: 12, height: 12, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                            : <span style={{ fontSize: '0.85rem' }}>✨</span>
                                        }
                                        {resumoIALoading ? 'Gerando...' : 'Gerar com IA'}
                                    </button>
                                </div>
                                {resumoIAErro && (
                                    <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.78rem', marginBottom: '0.5rem', border: '1px solid #fecaca' }}>
                                        {resumoIAErro}
                                    </div>
                                )}
                                <textarea
                                    style={{ ...inputStyle, minHeight: 300, resize: 'vertical' }}
                                    placeholder="Resumo profissional do candidato..."
                                    value={form.resumo} onChange={e => setForm(p => ({ ...p, resumo: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Contato ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Phone style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Contato</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>E-mail</label>
                                <input type="email" style={inputStyle} placeholder="email@exemplo.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone</label>
                                <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: maskPhone(e.target.value) }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>WhatsApp</label>
                                <input style={inputStyle} placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: maskPhone(e.target.value) }))} />
                            </div>
                        </div>
                    </div>

                    {/* ── Links ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><ExternalLink style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Links</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>LinkedIn</label>
                                <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Portfólio</label>
                                <input style={inputStyle} placeholder="https://..." value={form.portfolio} onChange={e => setForm(p => ({ ...p, portfolio: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>GitHub</label>
                                <input style={inputStyle} placeholder="https://github.com/..." value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} />
                            </div>
                        </div>
                    </div>

                    {/* ── Pretensão Salarial ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><DollarSign style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Pretensão Salarial</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Mínimo (R$)</label>
                                <input type="text" style={inputStyle} placeholder="3.000,00" value={form.pretensao_min} onChange={e => setForm(p => ({ ...p, pretensao_min: maskCurrency(e.target.value) }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Máximo (R$)</label>
                                <input type="text" style={inputStyle} placeholder="5.000,00" value={form.pretensao_max} onChange={e => setForm(p => ({ ...p, pretensao_max: maskCurrency(e.target.value) }))} />
                            </div>
                        </div>
                    </div>

                    {/* ── Experiências ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Experiências Profissionais</h2>
                        {experiencias.map((exp, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '0.75rem', border: '1px solid #e8edf5', position: 'relative' }}>
                                {experiencias.length > 1 && (
                                    <button type="button" onClick={() => setExperiencias(prev => prev.filter((_, i) => i !== idx))} style={{ ...removeBtnStyle, position: 'absolute', top: 8, right: 8 }} aria-label="Remover">
                                        <X style={{ width: 14, height: 14 }} />
                                    </button>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={labelStyle}>Cargo *</label>
                                        <input style={inputStyle} placeholder="Ex: Atendente" value={exp.cargo} onChange={e => { const v = [...experiencias]; v[idx].cargo = formatarCamelCase(e.target.value); setExperiencias(v) }} />
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
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                            <label style={{ ...labelStyle, marginBottom: 0 }}>Descrição</label>
                                            <button
                                                type="button"
                                                onClick={() => handleGerarDescricaoExp(idx)}
                                                disabled={expIALoading[idx]}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                    padding: '0.25rem 0.6rem', borderRadius: 6,
                                                    background: expIALoading[idx] ? '#e0e7ef' : '#094171',
                                                    color: expIALoading[idx] ? '#94a3b8' : '#fff',
                                                    fontSize: '0.68rem', fontWeight: 600, border: 'none',
                                                    cursor: expIALoading[idx] ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {expIALoading[idx]
                                                    ? <div style={{ width: 10, height: 10, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                                    : <span style={{ fontSize: '0.85rem' }}>✨</span>
                                                }
                                                {expIALoading[idx] ? 'Gerando...' : 'Gerar com IA'}
                                            </button>
                                        </div>
                                        {expIAErro[idx] && (
                                            <div style={{ padding: '0.4rem 0.6rem', background: '#fef2f2', color: '#dc2626', borderRadius: 6, fontSize: '0.72rem', marginBottom: '0.5rem', border: '1px solid #fecaca' }}>
                                                {expIAErro[idx]}
                                            </div>
                                        )}
                                        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Principais atividades..." value={exp.descricao} onChange={e => { const v = [...experiencias]; v[idx].descricao = e.target.value; setExperiencias(v) }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => setExperiencias(prev => [...prev, { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])} style={addBtnStyle}>
                            <Plus style={{ width: 14, height: 14 }} /> Adicionar experiência
                        </button>
                    </div>

                    {/* ── Formação ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><GraduationCap style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Formação Acadêmica</h2>
                        {formacoes.map((f, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '0.75rem', border: '1px solid #e8edf5', position: 'relative' }}>
                                {formacoes.length > 1 && (
                                    <button type="button" onClick={() => setFormacoes(prev => prev.filter((_, i) => i !== idx))} style={{ ...removeBtnStyle, position: 'absolute', top: 8, right: 8 }} aria-label="Remover">
                                        <X style={{ width: 14, height: 14 }} />
                                    </button>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={labelStyle}>Curso *</label>
                                        <input style={inputStyle} placeholder="Ex: Administração" value={f.curso} onChange={e => { const v = [...formacoes]; v[idx].curso = formatarCamelCase(e.target.value); setFormacoes(v) }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Instituição *</label>
                                        <input style={inputStyle} placeholder="Nome da instituição" value={f.instituicao} onChange={e => { const v = [...formacoes]; v[idx].instituicao = formatarCamelCase(e.target.value); setFormacoes(v) }} />
                                    </div>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <label style={labelStyle}>Início</label>
                                            <input type="date" style={inputStyle} value={f.data_inicio} onChange={e => { const v = [...formacoes]; v[idx].data_inicio = e.target.value; setFormacoes(v) }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Fim</label>
                                            <input type="date" style={inputStyle} disabled={f.em_andamento} value={f.data_fim} onChange={e => { const v = [...formacoes]; v[idx].data_fim = e.target.value; setFormacoes(v) }} />
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', cursor: 'pointer' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #e8edf5', paddingBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wrench style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Habilidades
                            </h2>
                            <button
                                type="button"
                                onClick={handleGerarHabilidades}
                                disabled={habilidadesIALoading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.3rem 0.75rem', borderRadius: 8,
                                    background: habilidadesIALoading ? '#e0e7ef' : '#094171',
                                    color: habilidadesIALoading ? '#94a3b8' : '#fff',
                                    fontSize: '0.72rem', fontWeight: 700, border: 'none',
                                    cursor: habilidadesIALoading ? 'not-allowed' : 'pointer',
                                    boxShadow: habilidadesIALoading ? 'none' : '0 2px 8px rgba(9,53,95,0.2)',
                                    transition: 'all 0.18s',
                                }}
                            >
                                {habilidadesIALoading
                                    ? <div style={{ width: 12, height: 12, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    : <span style={{ fontSize: '0.85rem' }}>✨</span>
                                }
                                {habilidadesIALoading ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                        {habilidadesIAErro && (
                            <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.78rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                                {habilidadesIAErro}
                            </div>
                        )}
                        {habilidades.map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <input style={{ ...inputStyle, flex: 1 }} placeholder="Ex: Pacote Office, Excel..." value={h} onChange={e => { const v = [...habilidades]; v[idx] = formatarCamelCase(e.target.value); setHabilidades(v) }} />
                                {habilidades.length > 1 && (
                                    <button type="button" onClick={() => setHabilidades(prev => prev.filter((_, i) => i !== idx))} style={removeBtnStyle} aria-label="Remover">
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
                                <select style={{ ...inputStyle, flex: '0 0 170px' }} value={i.nivel} onChange={e => { const v = [...idiomas]; v[idx].nivel = e.target.value; setIdiomas(v) }}>
                                    <option value="">Nível...</option>
                                    {NIVEL_IDIOMA.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                </select>
                                {idiomas.length > 1 && (
                                    <button type="button" onClick={() => setIdiomas(prev => prev.filter((_, i2) => i2 !== idx))} style={removeBtnStyle} aria-label="Remover">
                                        <X style={{ width: 14, height: 14 }} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => setIdiomas(prev => [...prev, { idioma: '', nivel: '' }])} style={addBtnStyle}>
                            <Plus style={{ width: 14, height: 14 }} /> Adicionar idioma
                        </button>
                    </div>

                    {/* ── Botões ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Link href="/admin/candidatos" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 1.5rem', borderRadius: 10,
                            border: '1.5px solid #e2e8f0', background: '#fff',
                            color: '#64748b', fontSize: '0.875rem', fontWeight: 600,
                            textDecoration: 'none',
                        }}>
                            Cancelar
                        </Link>
                        <button type="submit" disabled={loading || !pdfFile} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 1.75rem', borderRadius: 10,
                            background: (loading || !pdfFile) ? '#94a3b8' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                            color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                            border: 'none', cursor: (loading || !pdfFile) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                        }}>
                            {loading ? (
                                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                            ) : (
                                <Save style={{ width: 16, height: 16 }} />
                            )}
                            {loading ? 'Salvando...' : (!pdfFile ? 'Envie o PDF primeiro' : 'Cadastrar Candidato')}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── MODAL PDF ── */}
            {showPdfModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(9,53,95,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
                    }}>
                        {/* Header modal */}
                        <div style={{
                            padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8edf5',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
                        }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileScan style={{ width: 20, height: 20, color: '#3b82f6' }} />
                                Enviar Currículo PDF
                            </h2>
                            <button
                                onClick={() => setShowPdfModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: 6 }}
                                aria-label="Fechar"
                            >
                                <X style={{ width: 22, height: 22 }} />
                            </button>
                        </div>

                        {/* Corpo do modal */}
                        <div style={{ padding: '1.5rem' }}>
                            {pdfStep === 'reading' ? (
                                /* Estado de leitura */
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', gap: '1rem' }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '3px solid #bfdbfe',
                                    }}>
                                        <Loader2 style={{ width: 34, height: 34, color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    </div>
                                    <p style={{ fontWeight: 800, color: '#1e40af', fontSize: '1rem', textAlign: 'center' }}>
                                        Lendo o currículo com IA...
                                    </p>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', maxWidth: 340 }}>
                                        Estamos enviando o PDF para a inteligência artificial extrair os dados. Isso pode levar alguns segundos.
                                    </p>
                                </div>
                            ) : pdfStep === 'done' ? (
                                /* Estado de sucesso */
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '1rem' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle style={{ width: 32, height: 32, color: '#16a34a' }} />
                                    </div>
                                    <p style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem', textAlign: 'center' }}>
                                        Dados extraídos com sucesso!
                                    </p>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', maxWidth: 340 }}>
                                        O formulário foi preenchido com as informações encontradas no PDF. Revise os dados e salve.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = URL.createObjectURL(pdfFile!)
                                            window.open(url, '_blank')
                                            setTimeout(() => URL.revokeObjectURL(url), 10000)
                                        }}
                                        title="Abrir PDF"
                                        style={{
                                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                                            padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#2563eb',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            cursor: 'pointer', fontWeight: 600,
                                        }}
                                    >
                                        <FileText style={{ width: 14, height: 14, color: '#dc2626' }} />
                                        {pdfFile?.name}
                                        <ExternalLink style={{ width: 12, height: 12 }} />
                                    </button>
                                    <button onClick={() => setShowPdfModal(false)} style={{
                                        padding: '0.65rem 2rem', borderRadius: 10,
                                        background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                                        color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                                    }}>
                                        Revisar Formulário
                                    </button>
                                </div>
                            ) : (
                                /* Estado de upload */
                                <>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
                                        Selecione o arquivo PDF do currículo do candidato. A inteligência artificial irá extrair automaticamente os dados pessoais, experiências, formação e habilidades.
                                    </p>

                                    {pdfErro && (
                                        <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                                            {pdfErro}
                                        </div>
                                    )}

                                    <div
                                        onDragOver={e => { e.preventDefault(); setPdfDragOver(true) }}
                                        onDragLeave={() => setPdfDragOver(false)}
                                        onDrop={async e => {
                                            e.preventDefault()
                                            setPdfDragOver(false)
                                            const file = e.dataTransfer.files[0]
                                            if (file) await handlePdfSelect(file)
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={pdfDragOver ? 'drop-zone-active' : ''}
                                        style={{
                                            border: `2px dashed ${pdfFile ? '#22c55e' : '#cbd5e1'}`,
                                            borderRadius: 14, padding: '2rem',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                            background: pdfFile ? '#f0fdf4' : '#f8fafc',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            minHeight: 160,
                                        }}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            style={{ display: 'none' }}
                                            onChange={async e => {
                                                const file = e.target.files?.[0]
                                                if (file) await handlePdfSelect(file)
                                            }}
                                        />
                                        {pdfFile ? (
                                            <>
                                                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText style={{ width: 26, height: 26, color: '#16a34a' }} />
                                                </div>
                                                <p style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.9rem', textAlign: 'center' }}>{pdfFile.name}</p>
                                                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                    {(pdfFile.size / 1024).toFixed(0)} KB — Clique para trocar
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Upload style={{ width: 26, height: 26, color: '#3b82f6' }} />
                                                </div>
                                                <p style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem', textAlign: 'center' }}>
                                                    Arraste o PDF aqui ou clique para selecionar
                                                </p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                                    Apenas PDF • máximo 10 MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer do modal */}
                        {pdfStep === 'upload' && (
                            <div style={{
                                padding: '1.25rem 1.5rem', borderTop: '1px solid #e8edf5', background: '#f8fafc',
                                display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                            }}>
                                <button
                                    onClick={() => setShowPdfModal(false)}
                                    disabled={pdfLoading}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: 8, border: '1.5px solid #cbd5e1',
                                        background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >
                                    {pdfFile ? 'Fechar' : 'Cancelar'}
                                </button>
                                <button
                                    onClick={handleLerPDF}
                                    disabled={!pdfFile || pdfLoading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                                        background: (!pdfFile || pdfLoading) ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        color: '#fff', fontWeight: 700,
                                        cursor: (!pdfFile || pdfLoading) ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {pdfLoading ? (
                                        <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    ) : (
                                        <FileScan style={{ width: 14, height: 14 }} />
                                    )}
                                    {pdfLoading ? 'Processando...' : 'Ler e Preencher com IA'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showCategorizarModal && (
                <CategorizarModal
                    formSnapshot={{
                        nome_completo: `${form.nome} ${form.sobrenome}`.trim(),
                        cargo_desejado: form.cargo_desejado,
                        resumo: form.resumo,
                        experiencias: experiencias.filter(e => e.cargo || e.empresa),
                        formacoes: formacoes.filter(f => f.curso || f.instituicao),
                        habilidades: habilidades.filter(Boolean),
                        idiomas: idiomas.filter(i => i.idioma),
                    }}
                    initialSelecionadas={categoriasSelecionadas}
                    onClose={() => setShowCategorizarModal(false)}
                    onSaved={(selecionadas) => {
                        setCategoriasSelecionadas(selecionadas)
                        setShowCategorizarModal(false)
                    }}
                />
            )}
        </div>
    )
}

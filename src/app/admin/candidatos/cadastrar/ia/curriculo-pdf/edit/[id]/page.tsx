'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Save, Plus, X, User, Briefcase, GraduationCap,
    Wrench, Globe, Phone, DollarSign, ExternalLink, FileText,
    Upload, CheckCircle, AlertCircle, Loader2, Target, FileScan, RefreshCw, Tag
} from 'lucide-react'
import {
    atualizarCandidato, buscarCandidatoPorId,
    type ExperienciaItem, type FormacaoItem, type IdiomaItem, type CandidatoFormData,
} from '@/actions/candidatos'
import { extrairDadosCurriculoPDF, gerarResumoComIA, gerarCargoComIA, gerarDescricaoExperienciaComIA, gerarHabilidadesComIA } from '@/actions/openai'
import CategorizarModal from '@/components/admin/CategorizarModal'

/* ── helpers ── */
const formatarCamelCase = (texto: string) => {
    if (!texto) return ''
    const preposicoes = ['a', 'ante', 'após', 'até', 'com', 'contra', 'de', 'desde', 'em', 'entre', 'para', 'perante', 'por', 'sem', 'sob', 'sobre', 'trás']
    return texto.split(' ').map((palavra, index) => {
        const lower = palavra.toLowerCase()
        if (index > 0 && preposicoes.includes(lower)) return lower
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

const GRAUS = [
    { value: 'sem_alfabetizacao', label: 'Sem Alfabetização' },
    { value: 'ensino_fundamental', label: 'Ensino Fundamental' },
    { value: 'ensino_medio', label: 'Ensino Médio' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'graduacao', label: 'Graduação' },
    { value: 'pos-graduacao', label: 'Pós-Graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' },
    { value: 'mba', label: 'MBA' },
    { value: 'outro', label: 'Outro' },
]

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

const FORM_VAZIO: FormState = {
    user_id: 0, nome: '', sobrenome: '', email: '', cpf: '',
    data_nascimento: '', telefone: '', whatsapp: '', cargo_desejado: '',
    resumo: '', local: '', linkedin: '', portfolio: '', github: '',
    disponivel: true, pretensao_min: '', pretensao_max: '',
}

export default function EditarCandidatoPDFPage() {
    const params = useParams()
    const candidatoId = Number(params.id)

    /* Carregamento inicial */
    const [carregando, setCarregando] = useState(true)
    const [erroCarga, setErroCarga] = useState('')
    const [candidatoNomeCompleto, setCandidatoNomeCompleto] = useState('')

    /* Modal PDF (opcional no edit) */
    const [showPdfModal, setShowPdfModal] = useState(false)
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
    const [resumoIALoading, setResumoIALoading] = useState(false)
    const [resumoIAErro, setResumoIAErro] = useState('')
    const [cargoIALoading, setCargoIALoading] = useState(false)
    const [cargoIAErro, setCargoIAErro] = useState('')
    const [habilidadesIALoading, setHabilidadesIALoading] = useState(false)
    const [habilidadesIAErro, setHabilidadesIAErro] = useState('')
    const [expIALoading, setExpIALoading] = useState<Record<number, boolean>>({})
    const [expIAErro, setExpIAErro] = useState<Record<number, string>>({})
    const [showCategorizarModal, setShowCategorizarModal] = useState(false)

    const [form, setForm] = useState<FormState>(FORM_VAZIO)
    const [experiencias, setExperiencias] = useState<ExperienciaItem[]>([
        { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [formacoes, setFormacoes] = useState<FormacaoItem[]>([
        { curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }
    ])
    const [habilidades, setHabilidades] = useState<string[]>([''])
    const [idiomas, setIdiomas] = useState<IdiomaItem[]>([{ idioma: 'Português', nivel: 'nativo' }])

    /* ── Carregar dados existentes ── */
    useEffect(() => {
        if (!candidatoId) return
        setCarregando(true)
        buscarCandidatoPorId(candidatoId).then(res => {
            if (!res.success || !res.data) {
                setErroCarga(res.error || 'Candidato não encontrado.')
                setCarregando(false)
                return
            }
            const c = res.data
            const nomeCompleto = c.nome_completo || ''
            const partes = nomeCompleto.trim().split(' ')
            const nome = partes[0] || ''
            const sobrenome = partes.slice(1).join(' ')

            setCandidatoNomeCompleto(nomeCompleto)
            setForm({
                user_id: c.user_id || 0,
                nome,
                sobrenome,
                email: c.email || '',
                cpf: c.cpf || '',
                data_nascimento: c.data_nascimento || '',
                telefone: c.telefone ? maskPhone(c.telefone) : '',
                whatsapp: c.whatsapp ? maskPhone(c.whatsapp) : '',
                cargo_desejado: c.cargo_desejado || '',
                resumo: c.resumo || '',
                local: c.local || '',
                linkedin: c.linkedin || '',
                portfolio: c.portfolio || '',
                github: c.github || '',
                disponivel: c.disponivel ?? true,
                pretensao_min: c.pretensao_min ? maskCurrency(String(Math.round(Number(c.pretensao_min) * 100))) : '',
                pretensao_max: c.pretensao_max ? maskCurrency(String(Math.round(Number(c.pretensao_max) * 100))) : '',
            })

            const exps = c.candidato_experiencias || []
            setExperiencias(exps.length > 0 ? exps.map((e: any) => ({
                cargo: e.cargo || '', empresa: e.empresa || '', descricao: e.descricao || '',
                data_inicio: e.data_inicio === '1900-01-01' ? '' : (e.data_inicio || ''),
                data_fim: e.data_fim || '', em_andamento: e.em_andamento || false,
            })) : [{ cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])

            const forms = c.candidato_formacoes || []
            setFormacoes(forms.length > 0 ? forms.map((f: any) => ({
                curso: f.curso || '', instituicao: f.instituicao || '', grau: f.grau || '',
                data_inicio: f.data_inicio === '1900-01-01' ? '' : (f.data_inicio || ''),
                data_fim: f.data_fim || '', em_andamento: f.em_andamento || false,
            })) : [{ curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }])

            const habs = c.candidato_habilidades || []
            setHabilidades(habs.length > 0 ? habs.map((h: any) => h.texto || '') : [''])

            const ids = c.candidato_idiomas || []
            setIdiomas(ids.length > 0 ? ids.map((i: any) => ({ idioma: i.idioma || '', nivel: i.nivel || '' })) : [{ idioma: 'Português', nivel: 'nativo' }])

            setCarregando(false)
        })
    }, [candidatoId])

    /* ── Converter file para base64 ── */
    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    /* ── Selecionar PDF ── */
    async function handlePdfSelect(file: File) {
        if (file.type !== 'application/pdf') { setPdfErro('Apenas arquivos PDF são aceitos.'); return }
        if (file.size > 10 * 1024 * 1024) { setPdfErro('O arquivo deve ter menos de 10 MB.'); return }
        setPdfErro('')
        setPdfFile(file)
        const b64 = await fileToBase64(file)
        setPdfBase64(b64)
    }

    /* ── Reextrair dados via IA ── */
    async function handleLerPDF() {
        if (!pdfBase64 || !pdfFile) { setPdfErro('Selecione um arquivo PDF.'); return }
        setPdfErro('')
        setPdfLoading(true)
        setPdfStep('reading')
        try {
            const res = await extrairDadosCurriculoPDF(pdfBase64)
            if (!res.success) { setPdfErro(res.error || 'Erro ao processar o PDF.'); setPdfStep('upload'); setPdfLoading(false); return }
            const d = res.data
            setForm(prev => ({
                ...prev,
                nome: d.nome || prev.nome,
                sobrenome: d.sobrenome || prev.sobrenome,
                email: d.email?.trim() || prev.email,
                cpf: d.cpf || prev.cpf,
                data_nascimento: d.data_nascimento || prev.data_nascimento || '1900-01-01',
                telefone: d.telefone ? maskPhone(d.telefone) : prev.telefone,
                whatsapp: d.whatsapp ? maskPhone(d.whatsapp) : (d.telefone ? maskPhone(d.telefone) : prev.whatsapp),
                cargo_desejado: d.cargo_desejado || prev.cargo_desejado,
                resumo: d.resumo || prev.resumo,
                local: d.local || prev.local,
                linkedin: d.linkedin || prev.linkedin,
                portfolio: d.portfolio || prev.portfolio,
                github: d.github || prev.github,
            }))
            if (d.habilidades?.length > 0) setHabilidades(d.habilidades.map((h: string) => formatarCamelCase(h)))
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
            }
            if (d.formacoes?.length > 0) setFormacoes(d.formacoes.map((f: any) => ({ ...f, curso: formatarCamelCase(f.curso || ''), instituicao: formatarCamelCase(f.instituicao || '') })))
            if (d.idiomas?.length > 0) {
                const hasPt = d.idiomas.some((i: any) => i.idioma?.toLowerCase()?.includes('portug'))
                setIdiomas(hasPt ? d.idiomas : [{ idioma: 'Português', nivel: 'nativo' }, ...d.idiomas])
            }
            setPdfStep('done')
            setShowPdfModal(false)
        } catch { setPdfErro('Erro inesperado ao processar o PDF.'); setPdfStep('upload') }
        finally { setPdfLoading(false) }
    }

    /* ── Gerar Resumo com IA ── */
    async function handleGerarResumo() {
        setResumoIAErro(''); setResumoIALoading(true)
        try {
            const res = await gerarResumoComIA({ cargo: form.cargo_desejado, resumoAtual: form.resumo, habilidades: habilidades.filter(h => h.trim()), experiencias: experiencias.filter(e => e.cargo.trim() || e.empresa.trim()) })
            if (res.success) setForm(p => ({ ...p, resumo: res.data }))
            else setResumoIAErro(res.error || 'Erro ao gerar resumo.')
        } catch { setResumoIAErro('Erro de conexão com a IA.') }
        finally { setResumoIALoading(false) }
    }

    /* ── Gerar Cargo com IA ── */
    async function handleGerarCargo() {
        if (!form.resumo.trim()) { setCargoIAErro('Preencha o resumo primeiro.'); return }
        setCargoIAErro(''); setCargoIALoading(true)
        try {
            const res = await gerarCargoComIA(form.resumo)
            if (res.success) setForm(p => ({ ...p, cargo_desejado: res.data }))
            else setCargoIAErro(res.error || 'Erro ao sugerir cargo.')
        } catch { setCargoIAErro('Erro de conexão com a IA.') }
        finally { setCargoIALoading(false) }
    }

    /* ── Gerar Descrição de Experiência com IA ── */
    async function handleGerarDescricaoExp(idx: number) {
        const exp = experiencias[idx]
        if (!exp.cargo.trim() || !exp.empresa.trim()) { setExpIAErro(p => ({ ...p, [idx]: 'Preencha Cargo e Empresa primeiro.' })); return }
        setExpIAErro(p => ({ ...p, [idx]: '' })); setExpIALoading(p => ({ ...p, [idx]: true }))
        try {
            const res = await gerarDescricaoExperienciaComIA({ cargo: exp.cargo, empresa: exp.empresa, descricaoAtual: exp.descricao })
            if (res.success) { const v = [...experiencias]; v[idx].descricao = res.data; setExperiencias(v) }
            else setExpIAErro(p => ({ ...p, [idx]: res.error || 'Erro ao gerar descrição.' }))
        } catch { setExpIAErro(p => ({ ...p, [idx]: 'Erro de conexão com a IA.' })) }
        finally { setExpIALoading(p => ({ ...p, [idx]: false })) }
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
                const c = habilidades.filter(h => h.trim() !== '')
                const novasAAdicionar = res.data.map(formatarCamelCase).filter(x => !c.includes(x))
                if (novasAAdicionar.length > 0) setHabilidades([...c, ...novasAAdicionar])
            } else setHabilidadesIAErro(res.error || 'Erro ao sugerir habilidades.')
        } catch { setHabilidadesIAErro('Erro de conexão com a IA.') }
        finally { setHabilidadesIALoading(false) }
    }

    /* ── Submit ── */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')
        if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
        setLoading(true)
        try {
            const nomeCompleto = `${form.nome.trim()} ${form.sobrenome.trim()}`.trim()
            const formData: CandidatoFormData = {
                user_id: form.user_id,
                nome_completo: nomeCompleto,
                cargo_desejado: form.cargo_desejado,
                resumo: form.resumo,
                local: form.local || '',
                data_nascimento: form.data_nascimento || '',
                email: form.email?.trim() || '',
                telefone: form.telefone || '',
                whatsapp: form.whatsapp || '',
                linkedin: form.linkedin || '',
                portfolio: form.portfolio || '',
                github: form.github || '',
                disponivel: form.disponivel,
                pretensao_min: form.pretensao_min ? cleanCurrency(form.pretensao_min) : '',
                pretensao_max: form.pretensao_max ? cleanCurrency(form.pretensao_max) : '',
                experiencias: experiencias.filter(e => e.cargo.trim() || e.empresa.trim()),
                formacoes: formacoes.filter(f => f.curso.trim() || f.instituicao.trim()),
                habilidades: habilidades.filter(h => h.trim()),
                idiomas: idiomas.filter(i => i.idioma.trim()),
                documentos: [],
            }
            const resultado = await atualizarCandidato(candidatoId, form.user_id, formData)
            if (!resultado.success) { setErro(resultado.error || 'Erro ao atualizar candidato.'); setLoading(false); return }
            setSucesso(true)
            setTimeout(() => { window.location.href = `/admin/usuarios` }, 2200)
        } catch { setErro('Erro de conexão. Tente novamente.'); setLoading(false) }
    }

    /* ── Estilos ── */
    const inputStyle: React.CSSProperties = { width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#09355F', background: '#f8fafc', outline: 'none', transition: 'border-color 0.18s' }
    const labelStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem', display: 'block' }
    const sectionTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 800, color: '#09355F', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e8edf5', display: 'flex', alignItems: 'center', gap: '0.5rem' }
    const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(9,53,95,0.04)', marginBottom: '1.25rem' }
    const removeBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', flexShrink: 0 }
    const addBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', padding: '0.45rem 0.85rem', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }

    /* ── Estados de tela ── */
    if (carregando) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360, flexDirection: 'column', gap: '1rem' }}>
            <Loader2 size={36} style={{ color: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Carregando dados do candidato...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (erroCarga) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360, flexDirection: 'column', gap: '1rem' }}>
            <AlertCircle size={36} style={{ color: '#dc2626' }} />
            <p style={{ color: '#dc2626', fontWeight: 700 }}>{erroCarga}</p>
            <Link href="/admin/usuarios" style={{ color: '#3b82f6', fontSize: '0.88rem' }}>← Voltar para usuários</Link>
        </div>
    )

    if (sucesso) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: '1rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle style={{ width: 38, height: 38, color: '#16a34a' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', textAlign: 'center' }}>Candidato atualizado com sucesso!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>As informações de <strong>{candidatoNomeCompleto}</strong> foram salvas.</p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Redirecionando para a lista de usuários...</p>
        </div>
    )

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
                        <Link href="/admin/usuarios" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', color: '#64748b', textDecoration: 'none' }}>
                            <ArrowLeft style={{ width: 18, height: 18 }} />
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileScan style={{ width: 22, height: 22, color: '#f59e0b' }} />
                                Editar via PDF — <span style={{ color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>{candidatoNomeCompleto}</span>
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                ID #{candidatoId} — Edite os dados manualmente ou re-extraia com um novo PDF
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setShowCategorizarModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.4rem', borderRadius: 10,
                                background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                                color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                                border: 'none', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                            }}
                        >
                            <Tag style={{ width: 16, height: 16 }} /> Categorizar
                        </button>
                        {pdfFile && pdfStep === 'done' && (
                            <button type="button" onClick={() => { const url = URL.createObjectURL(pdfFile); window.open(url, '_blank'); setTimeout(() => URL.revokeObjectURL(url), 10000) }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                <CheckCircle style={{ width: 16, height: 16 }} />{pdfFile.name}<ExternalLink style={{ width: 13, height: 13, opacity: 0.7 }} />
                            </button>
                        )}
                        <button type="button" onClick={() => setShowPdfModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                            <RefreshCw style={{ width: 16, height: 16 }} />
                            {pdfFile ? 'Trocar PDF' : 'Re-extrair com IA'}
                        </button>
                    </div>
                </div>

                {/* Banner informativo */}
                <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', border: '1px solid #fde68a', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileScan style={{ width: 18, height: 18, color: '#d97706', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0 }}>
                        Modo edição — os campos já estão preenchidos com os dados atuais do candidato.
                        Você pode editar manualmente ou enviar um novo PDF para re-extrair os dados com IA.
                    </p>
                </div>

                {erro && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '0.85rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#dc2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />{erro}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ── Dados Pessoais ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><User style={{ width: 18, height: 18, color: '#3b82f6' }} />Dados Pessoais</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nome *</label>
                                <input style={inputStyle} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Primeiro nome" required />
                            </div>
                            <div>
                                <label style={labelStyle}>Sobrenome</label>
                                <input style={inputStyle} value={form.sobrenome} onChange={e => setForm(p => ({ ...p, sobrenome: e.target.value }))} placeholder="Restante do nome" />
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail</label>
                                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>CPF</label>
                                <input style={inputStyle} value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
                            </div>
                            <div>
                                <label style={labelStyle}>Data de Nascimento</label>
                                <input style={inputStyle} type="date" value={form.data_nascimento} onChange={e => setForm(p => ({ ...p, data_nascimento: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Localização</label>
                                <input style={inputStyle} value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))} placeholder="Caldas Novas, GO" />
                            </div>
                        </div>
                    </div>

                    {/* ── Contato ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Phone style={{ width: 18, height: 18, color: '#22c55e' }} />Contato</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Telefone</label>
                                <input style={inputStyle} value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: maskPhone(e.target.value) }))} placeholder="(62) 99999-9999" />
                            </div>
                            <div>
                                <label style={labelStyle}>WhatsApp</label>
                                <input style={inputStyle} value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: maskPhone(e.target.value) }))} placeholder="(62) 99999-9999" />
                            </div>
                        </div>
                    </div>

                    {/* ── Perfil Profissional ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Target style={{ width: 18, height: 18, color: '#f59e0b' }} />Perfil Profissional</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Cargo Desejado</label>
                                <button type="button" onClick={handleGerarCargo} disabled={cargoIALoading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 7, border: '1px solid #e0d7ff', background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, cursor: cargoIALoading ? 'not-allowed' : 'pointer' }}>
                                    {cargoIALoading ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Target size={11} />} Sugerir com IA
                                </button>
                            </div>
                            {cargoIAErro && <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: '0.25rem 0' }}>{cargoIAErro}</p>}
                            <input style={inputStyle} value={form.cargo_desejado} onChange={e => setForm(p => ({ ...p, cargo_desejado: e.target.value }))} placeholder="Ex: Atendente, Auxiliar Administrativo..." />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Resumo / Objetivo</label>
                                <button type="button" onClick={handleGerarResumo} disabled={resumoIALoading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 7, border: '1px solid #e0d7ff', background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, cursor: resumoIALoading ? 'not-allowed' : 'pointer' }}>
                                    {resumoIALoading ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Target size={11} />} Melhorar com IA
                                </button>
                            </div>
                            {resumoIAErro && <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: '0.25rem 0' }}>{resumoIAErro}</p>}
                            <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={form.resumo} onChange={e => setForm(p => ({ ...p, resumo: e.target.value }))} placeholder="Resumo profissional do candidato..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <input type="checkbox" id="disponivel" checked={form.disponivel} onChange={e => setForm(p => ({ ...p, disponivel: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                            <label htmlFor="disponivel" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Disponível para novas oportunidades</label>
                        </div>
                    </div>

                    {/* ── Links ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Globe style={{ width: 18, height: 18, color: '#06b6d4' }} />Links e Redes</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>LinkedIn</label>
                                <input style={inputStyle} value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Portfolio</label>
                                <input style={inputStyle} value={form.portfolio} onChange={e => setForm(p => ({ ...p, portfolio: e.target.value }))} placeholder="https://..." />
                            </div>
                            <div>
                                <label style={labelStyle}>GitHub</label>
                                <input style={inputStyle} value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} placeholder="github.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* ── Pretensão Salarial ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><DollarSign style={{ width: 18, height: 18, color: '#10b981' }} />Pretensão Salarial</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Mínimo (R$)</label>
                                <input style={inputStyle} value={form.pretensao_min} onChange={e => setForm(p => ({ ...p, pretensao_min: maskCurrency(e.target.value) }))} placeholder="1.500,00" />
                            </div>
                            <div>
                                <label style={labelStyle}>Máximo (R$)</label>
                                <input style={inputStyle} value={form.pretensao_max} onChange={e => setForm(p => ({ ...p, pretensao_max: maskCurrency(e.target.value) }))} placeholder="3.000,00" />
                            </div>
                        </div>
                    </div>

                    {/* ── Experiências ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#FE8341' }} />Experiências Profissionais</h2>
                        {experiencias.map((exp, idx) => (
                            <div key={idx} style={{ border: '1.5px solid #e8edf5', borderRadius: 12, padding: '1rem', marginBottom: '0.85rem', background: '#fafbfd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Experiência #{idx + 1}</span>
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        <button type="button" onClick={() => handleGerarDescricaoExp(idx)} disabled={expIALoading[idx]} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 7, border: '1px solid #e0d7ff', background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, cursor: expIALoading[idx] ? 'not-allowed' : 'pointer' }}>
                                            {expIALoading[idx] ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Target size={11} />} IA
                                        </button>
                                        {experiencias.length > 1 && <button type="button" style={removeBtnStyle} onClick={() => setExperiencias(v => v.filter((_, i) => i !== idx))}><X size={14} /></button>}
                                    </div>
                                </div>
                                {expIAErro[idx] && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.5rem' }}>{expIAErro[idx]}</p>}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div><label style={labelStyle}>Cargo</label><input style={inputStyle} value={exp.cargo} onChange={e => { const v = [...experiencias]; v[idx].cargo = e.target.value; setExperiencias(v) }} placeholder="Ex: Atendente" /></div>
                                    <div><label style={labelStyle}>Empresa</label><input style={inputStyle} value={exp.empresa} onChange={e => { const v = [...experiencias]; v[idx].empresa = e.target.value; setExperiencias(v) }} placeholder="Nome da empresa" /></div>
                                    <div><label style={labelStyle}>Início</label><input style={inputStyle} type="date" value={exp.data_inicio} onChange={e => { const v = [...experiencias]; v[idx].data_inicio = e.target.value; setExperiencias(v) }} /></div>
                                    <div><label style={labelStyle}>Fim</label><input style={inputStyle} type="date" value={exp.data_fim} disabled={exp.em_andamento} onChange={e => { const v = [...experiencias]; v[idx].data_fim = e.target.value; setExperiencias(v) }} /></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={exp.em_andamento} onChange={e => { const v = [...experiencias]; v[idx].em_andamento = e.target.checked; if (e.target.checked) v[idx].data_fim = ''; setExperiencias(v) }} />
                                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Trabalho atual (em andamento)</label>
                                </div>
                                <div><label style={labelStyle}>Descrição das atividades</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={exp.descricao} onChange={e => { const v = [...experiencias]; v[idx].descricao = e.target.value; setExperiencias(v) }} placeholder="Responsabilidades e atividades principais..." /></div>
                            </div>
                        ))}
                        <button type="button" style={addBtnStyle} onClick={() => setExperiencias(v => [...v, { cargo: '', empresa: '', descricao: '', data_inicio: '', data_fim: '', em_andamento: false }])}>
                            <Plus size={14} /> Adicionar Experiência
                        </button>
                    </div>

                    {/* ── Formações ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><GraduationCap style={{ width: 18, height: 18, color: '#7c3aed' }} />Formações Acadêmicas</h2>
                        {formacoes.map((form2, idx) => (
                            <div key={idx} style={{ border: '1.5px solid #e8edf5', borderRadius: 12, padding: '1rem', marginBottom: '0.85rem', background: '#fafbfd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Formação #{idx + 1}</span>
                                    {formacoes.length > 1 && <button type="button" style={removeBtnStyle} onClick={() => setFormacoes(v => v.filter((_, i) => i !== idx))}><X size={14} /></button>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div><label style={labelStyle}>Curso</label><input style={inputStyle} value={form2.curso} onChange={e => { const v = [...formacoes]; v[idx].curso = e.target.value; setFormacoes(v) }} placeholder="Ex: Administração" /></div>
                                    <div><label style={labelStyle}>Instituição</label><input style={inputStyle} value={form2.instituicao} onChange={e => { const v = [...formacoes]; v[idx].instituicao = e.target.value; setFormacoes(v) }} placeholder="Ex: Unicesumar" /></div>
                                    <div>
                                        <label style={labelStyle}>Grau</label>
                                        <select style={inputStyle} value={form2.grau} onChange={e => { const v = [...formacoes]; v[idx].grau = e.target.value; setFormacoes(v) }}>
                                            <option value="">Selecionar...</option>
                                            {GRAUS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                        </select>
                                    </div>
                                    <div></div>
                                    <div><label style={labelStyle}>Início</label><input style={inputStyle} type="date" value={form2.data_inicio} onChange={e => { const v = [...formacoes]; v[idx].data_inicio = e.target.value; setFormacoes(v) }} /></div>
                                    <div><label style={labelStyle}>Conclusão</label><input style={inputStyle} type="date" value={form2.data_fim} disabled={form2.em_andamento} onChange={e => { const v = [...formacoes]; v[idx].data_fim = e.target.value; setFormacoes(v) }} /></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <input type="checkbox" checked={form2.em_andamento} onChange={e => { const v = [...formacoes]; v[idx].em_andamento = e.target.checked; if (e.target.checked) v[idx].data_fim = ''; setFormacoes(v) }} />
                                    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Curso em andamento</label>
                                </div>
                            </div>
                        ))}
                        <button type="button" style={addBtnStyle} onClick={() => setFormacoes(v => [...v, { curso: '', instituicao: '', grau: '', data_inicio: '', data_fim: '', em_andamento: false }])}>
                            <Plus size={14} /> Adicionar Formação
                        </button>
                    </div>

                    {/* ── Habilidades ── */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #e8edf5', paddingBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wrench style={{ width: 18, height: 18, color: '#64748b' }} />Habilidades
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {habilidades.map((h, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', borderRadius: 8, padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0' }}>
                                    <input style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', color: '#09355F', outline: 'none', width: `${Math.max(h.length || 1, 6)}ch` }} value={h} onChange={e => { const v = [...habilidades]; v[idx] = e.target.value; setHabilidades(v) }} placeholder="Habilidade" />
                                    {habilidades.length > 1 && <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }} onClick={() => setHabilidades(v => v.filter((_, i) => i !== idx))}><X size={12} /></button>}
                                </div>
                            ))}
                        </div>
                        <button type="button" style={addBtnStyle} onClick={() => setHabilidades(v => [...v, ''])}><Plus size={14} /> Adicionar Habilidade</button>
                    </div>

                    {/* ── Idiomas ── */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Globe style={{ width: 18, height: 18, color: '#06b6d4' }} />Idiomas</h2>
                        {idiomas.map((id, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '0.65rem' }}>
                                <div style={{ flex: 1 }}>
                                    {idx === 0 && <label style={labelStyle}>Idioma</label>}
                                    <input style={inputStyle} value={id.idioma} onChange={e => { const v = [...idiomas]; v[idx].idioma = e.target.value; setIdiomas(v) }} placeholder="Ex: Inglês" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    {idx === 0 && <label style={labelStyle}>Nível</label>}
                                    <select style={inputStyle} value={id.nivel} onChange={e => { const v = [...idiomas]; v[idx].nivel = e.target.value; setIdiomas(v) }}>
                                        <option value="">Selecionar...</option>
                                        {NIVEL_IDIOMA.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                    </select>
                                </div>
                                {idiomas.length > 1 && <button type="button" style={{ ...removeBtnStyle, marginBottom: 0 }} onClick={() => setIdiomas(v => v.filter((_, i) => i !== idx))}><X size={14} /></button>}
                            </div>
                        ))}
                        <button type="button" style={addBtnStyle} onClick={() => setIdiomas(v => [...v, { idioma: '', nivel: '' }])}><Plus size={14} /> Adicionar Idioma</button>
                    </div>

                    {/* ── Botão Submit ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingBottom: '2rem' }}>
                        <Link href="/admin/usuarios" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.5rem', borderRadius: 12, background: '#f1f5f9', color: '#64748b', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                            <ArrowLeft size={16} /> Cancelar
                        </Link>
                        <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: 12, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', boxShadow: loading ? 'none' : '0 4px 14px rgba(245,158,11,0.4)' }}>
                            {loading ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando...</> : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Modal PDF (opcional) ── */}
            {showPdfModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,53,95,0.55)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 24px 60px rgba(9,53,95,0.25)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw style={{ width: 20, height: 20, color: '#fff' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#09355F' }}>Re-extrair com IA</h3>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Envie um novo PDF para atualizar os dados</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowPdfModal(false); setPdfErro('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {pdfErro && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <AlertCircle size={14} />{pdfErro}
                                </div>
                            )}

                            {pdfStep === 'reading' ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <Loader2 style={{ width: 28, height: 28, color: '#d97706', animation: 'spin 0.8s linear infinite' }} />
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#09355F' }}>IA processando o currículo...</p>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Aguarde alguns segundos</p>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={pdfDragOver ? 'drop-zone-active' : ''}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); setPdfDragOver(true) }}
                                        onDragLeave={() => setPdfDragOver(false)}
                                        onDrop={e => { e.preventDefault(); setPdfDragOver(false); const f = e.dataTransfer.files[0]; if (f) handlePdfSelect(f) }}
                                        style={{ border: `2px dashed ${pdfFile ? '#d97706' : '#cbd5e1'}`, borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: pdfFile ? '#fffbeb' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfSelect(f) }} />
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: pdfFile ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {pdfFile ? <FileText style={{ width: 28, height: 28, color: '#fff' }} /> : <Upload style={{ width: 24, height: 24, color: '#94a3b8' }} />}
                                        </div>
                                        {pdfFile
                                            ? <><p style={{ fontWeight: 700, color: '#92400e', margin: 0 }}>{pdfFile.name}</p><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Clique para trocar o arquivo</p></>
                                            : <><p style={{ fontWeight: 600, color: '#475569', margin: 0 }}>Arraste o PDF ou clique para selecionar</p><p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>PDF até 10 MB</p></>
                                        }
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                                        <button type="button" onClick={() => { setShowPdfModal(false); setPdfErro('') }} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, background: '#f1f5f9', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                                            Cancelar
                                        </button>
                                        <button type="button" onClick={handleLerPDF} disabled={!pdfFile || pdfLoading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 12, background: (!pdfFile || pdfLoading) ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 800, border: 'none', cursor: (!pdfFile || pdfLoading) ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: pdfFile ? '0 4px 12px rgba(245,158,11,0.4)' : 'none' }}>
                                            {pdfLoading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Processando...</> : <><RefreshCw size={16} /> Re-extrair com IA</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showCategorizarModal && (
                <CategorizarModal
                    candidatoId={candidatoId}
                    onClose={() => setShowCategorizarModal(false)}
                    onSaved={() => setShowCategorizarModal(false)}
                />
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Save, Plus, X, Briefcase,
    DollarSign, FileText, Mail, ExternalLink, Star, Bot, Image as ImageIcon
} from 'lucide-react'
import { cadastrarVaga, editarVaga, type VagaFormData, buscarTodosTitulosVagas } from '@/actions/vagas'
import { extrairDadosVagaDeImagem } from '@/actions/openai'
import { salvarImagemVaga, vincularImagemVaga } from '@/actions/vaga_imagens'
import { buscarTodasEmpresasNomes, buscarEmpresaPorNome } from '@/actions/empresas'

interface VagaFormClientProps {
    initialData?: any;
    vagaId?: number;
    isEdit?: boolean;
}

export default function VagaFormClient({ initialData, vagaId, isEdit }: VagaFormClientProps) {
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')

    // ── Estado do Modal IA ──
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiFile, setAiFile] = useState<File | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState('')
    const [aiGerandoDescricao, setAiGerandoDescricao] = useState(false)

    // ── Estado de Imagem Salva ──
    const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
    const [aiRegistroId, setAiRegistroId] = useState<number | null>(null)
    const [showImagePreview, setShowImagePreview] = useState(false)

    const [sugestoesEmpresas, setSugestoesEmpresas] = useState<string[]>([])
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
    const [sugestoesTitulos, setSugestoesTitulos] = useState<string[]>([])
    const [mostrarSugestoesTitulos, setMostrarSugestoesTitulos] = useState(false)

    useEffect(() => {
        buscarTodasEmpresasNomes().then(res => setSugestoesEmpresas(res as string[]))
        buscarTodosTitulosVagas().then(res => setSugestoesTitulos(res as string[]))
    }, [])

    const [form, setForm] = useState({
        titulo: initialData?.titulo || '',
        descricao: initialData?.descricao || '',
        empresa: initialData?.empresa || '',
        local: initialData?.local || '',
        modalidade: (initialData?.modalidade || '') as VagaFormData['modalidade'],
        tipo_contrato: initialData?.tipo_contrato || '',
        nivel: initialData?.nivel || '',
        salario_min: initialData?.salario_min ? formatCurrency(String(initialData.salario_min)) : '',
        salario_max: initialData?.salario_max ? formatCurrency(String(initialData.salario_max)) : '',
        mostrar_salario: initialData ? initialData.mostrar_salario : true,
        salario_a_combinar: initialData ? initialData.salario_a_combinar : false,
        email_contato: initialData?.email_contato || '',
        telefone_contato: initialData?.telefone_contato ? formatPhoneInput(initialData.telefone_contato) : (initialData?.telefone ? formatPhoneInput(initialData.telefone) : ''),
        whatsapp_contato: initialData?.whatsapp_contato ? formatPhoneInput(initialData.whatsapp_contato) : (initialData?.whatsapp ? formatPhoneInput(initialData.whatsapp) : ''),
        link_externo: initialData?.link_externo || '',
        json_content: initialData?.json_content ? JSON.stringify(initialData.json_content, null, 2) : '',
        status: initialData?.status || 'ativa',
        destaque: initialData ? initialData.destaque : false,
    })

    const [responsabilidades, setResponsabilidades] = useState<string[]>(initialData?.responsabilidades?.length ? initialData.responsabilidades : [''])
    const [requisitos, setRequisitos] = useState<string[]>(initialData?.requisitos?.length ? initialData.requisitos : [''])
    const [diferenciais, setDiferenciais] = useState<string[]>(initialData?.diferenciais?.length ? initialData.diferenciais : [''])
    const [beneficios, setBeneficios] = useState<string[]>(initialData?.beneficios?.length ? initialData.beneficios : [''])

    function updateField(field: string, value: any) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function toTitleCase(str: string) {
        if (!str) return '';
        const preposicoes = ["a", "ante", "após", "até", "com", "contra", "de", "desde", "em", "entre", "para", "perante", "por", "sem", "sob", "sobre", "trás"];
        return str.toLowerCase().split(' ').map((word, index) => {
            if (preposicoes.includes(word) && index !== 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    function formatCurrency(value: string) {
        if (!value) return ''
        let v = value.replace(/\D/g, '')
        if (!v) return ''
        v = (Number(v) / 100).toFixed(2)
        v = v.replace('.', ',')
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        return 'R$ ' + v
    }

    function parseCurrencyToNumber(value: string) {
        if (!value) return ''
        return value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')
    }

    function formatPhoneInput(value: string) {
        if (!value) return ''
        let v = value.replace(/\D/g, '')
        if (v.length > 11) v = v.slice(0, 11)
        if (v.length <= 2) return v ? `(${v}` : ''
        if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
        if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
        return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
    }

    function addItem(setter: React.Dispatch<React.SetStateAction<string[]>>) {
        setter(prev => [...prev, ''])
    }

    function removeItem(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) {
        setter(prev => prev.filter((_, i) => i !== index))
    }

    function updateItem(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) {
        setter(prev => prev.map((item, i) => i === index ? value : item))
    }

    const formInicial = {
        titulo: '', descricao: '', empresa: '', local: '',
        modalidade: '' as VagaFormData['modalidade'],
        tipo_contrato: '', nivel: '',
        salario_min: '', salario_max: '',
        mostrar_salario: true, salario_a_combinar: false,
        email_contato: '', telefone_contato: '', whatsapp_contato: '',
        link_externo: '', json_content: '', status: 'ativa', destaque: false,
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')
        setSucesso('')

        if (!form.titulo.trim()) { setErro('Título é obrigatório.'); return }
        if (!form.empresa.trim()) { setErro('Empresa é obrigatória.'); return }
        if (!form.modalidade) { setErro('Modalidade é obrigatória.'); return }

        setLoading(true);
        try {
            const formData = {
                ...form,
                salario_min: parseCurrencyToNumber(form.salario_min),
                salario_max: parseCurrencyToNumber(form.salario_max),
                responsabilidades: responsabilidades.filter(r => r.trim()),
                requisitos: requisitos.filter(r => r.trim()),
                diferenciais: diferenciais.filter(r => r.trim()),
                beneficios: beneficios.filter(r => r.trim()),
            };

            const resultado = isEdit && vagaId
                ? await editarVaga(vagaId, formData)
                : await cadastrarVaga(formData);

            if (!resultado.success) {
                setLoading(false)
                setErro(resultado.error || 'Erro ao criar vaga.')
                return
            }

            // ── Vincular imagem à vaga recém-criada ──────────────────
            if (aiRegistroId && resultado.vagaId) {
                await vincularImagemVaga(aiRegistroId, resultado.vagaId).catch(() => null)
            }

            // ── Reset completo do formulário para novo cadastro ────────
            setForm(formInicial)
            setResponsabilidades([''])
            setRequisitos([''])
            setDiferenciais([''])
            setBeneficios([''])
            setAiImageUrl(null)
            setAiRegistroId(null)
            setSucesso(`Vaga "${formData.titulo}" cadastrada com sucesso! Pronto para nova vaga.`)
            setLoading(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
            setLoading(false)
            setErro('Erro de conexão. Tente novamente.')
        }
    }

    const submitAI = async () => {
        if (!aiFile) return
        setAiLoading(true)
        setAiError('')

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64Image = reader.result as string

            try {
                // ── Processar IA + Upload em paralelo ──────────────────
                const [response, uploadResult] = await Promise.all([
                    extrairDadosVagaDeImagem(base64Image),
                    salvarImagemVaga(base64Image, aiFile.name, null),
                ])

                // ── Salvar image URL para preview ──────────────────────
                if (uploadResult.success && uploadResult.url_publica) {
                    setAiImageUrl(uploadResult.url_publica)
                    if (uploadResult.registro_id) setAiRegistroId(uploadResult.registro_id)
                }

                if (!response.success) {
                    throw new Error(response.error || 'Erro ao processar imagem.')
                }

                if (response.data) {
                    const json = response.data

                    updateField('json_content', JSON.stringify(json, null, 2))

                    // ─── Campos Simples ───
                    if (json.titulo) updateField('titulo', toTitleCase(json.titulo))
                    if (json.empresa) updateField('empresa', toTitleCase(json.empresa))
                    if (json.local) updateField('local', json.local)
                    if (json.descricao) updateField('descricao', json.descricao)
                    if (json.telefone || json.telefone_contato) updateField('telefone_contato', formatPhoneInput(json.telefone || json.telefone_contato))
                    if (json.whatsapp || json.whatsapp_contato) updateField('whatsapp_contato', formatPhoneInput(json.whatsapp || json.whatsapp_contato))
                    
                    if (json.email_contato || json.email) {
                        updateField('email_contato', json.email_contato || json.email)
                    } else if (json.empresa) {
                        const nomeClean = json.empresa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
                        const hash = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
                        updateField('email_contato', `${nomeClean}${hash}@empregacaldas.online`);
                    }
                    if (json.link_externo || json.website) updateField('link_externo', json.link_externo || json.website)

                    // ─── Mapeamentos (Upper Case p/ keys seguras) ───
                    const modalidadeMap: Record<string, string> = { 'REMOTO': 'remoto', 'HIBRIDO': 'hibrido', 'PRESENCIAL': 'presencial' }
                    if (json.modalidade) updateField('modalidade', modalidadeMap[json.modalidade?.toUpperCase()] || 'presencial')

                    const contratoMap: Record<string, string> = { 'CLT': 'clt', 'PJ': 'pj', 'ESTAGIO': 'estagio', 'TEMPORARIO': 'temporario', 'FREELANCER': 'freelancer' }
                    if (json.tipo_contrato) updateField('tipo_contrato', contratoMap[json.tipo_contrato?.toUpperCase()] || 'clt')

                    const nivelMap: Record<string, string> = { 'ESTAGIO': 'estagio', 'JUNIOR': 'junior', 'PLENO': 'pleno', 'SENIOR': 'senior', 'GERENTE': 'gerente', 'DIRETOR': 'diretor' }
                    if (json.nivel) updateField('nivel', nivelMap[json.nivel?.toUpperCase()] || 'pleno')

                    if (json.configuracoes?.status) updateField('status', json.configuracoes.status.toLowerCase())

                    // ─── Remuneração ───
                    const rawMin = json.remuneracao?.minimo
                    const rawMax = json.remuneracao?.maximo
                    
                    if (!rawMin && !rawMax) {
                        updateField('salario_a_combinar', true)
                    } else {
                        updateField('salario_a_combinar', false)
                        updateField('mostrar_salario', true)
                        if (rawMin) updateField('salario_min', formatCurrency(String(rawMin).replace(/\./g, '')))
                        if (rawMax) updateField('salario_max', formatCurrency(String(rawMax).replace(/\./g, '')))
                    }

                    // ─── Arrays (Responsabilidades, Benefícios...) ───
                    if (Array.isArray(json.responsabilidades) && json.responsabilidades.length) {
                        setResponsabilidades(json.responsabilidades.filter((i: string) => i))
                    }
                    if (Array.isArray(json.requisitos) && json.requisitos.length) {
                        setRequisitos(json.requisitos.filter((i: string) => i))
                    }
                    if (Array.isArray(json.diferenciais) && json.diferenciais.length) {
                        setDiferenciais(json.diferenciais.filter((i: string) => i))
                    }
                    if (Array.isArray(json.beneficios) && json.beneficios.length) {
                        setBeneficios(json.beneficios.filter((i: string) => i))
                    }
                }

                setShowAIModal(false)
                setAiFile(null)
            } catch (err: any) {
                setAiError(err.message)
            } finally {
                setAiLoading(false)
            }
        }
        reader.readAsDataURL(aiFile)
    }

    // ── Estilo ─────────
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

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link href="/admin/vagas" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                        color: '#64748b', textDecoration: 'none', transition: 'background 0.18s',
                    }}>
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F' }}>Cadastrar Vaga</h1>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Preencha os dados da nova vaga</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Botão Ver Imagem — aparece após upload */}
                    {aiImageUrl && (
                        <button
                            type="button"
                            onClick={() => setShowImagePreview(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.6rem 1.1rem', borderRadius: 10,
                                background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #bfdbfe',
                                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(29, 78, 216, 0.07)'
                            }}
                        >
                            <ImageIcon style={{ width: 16, height: 16 }} />
                            <span>Ver Imagem</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowAIModal(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.1rem', borderRadius: 10,
                            background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0',
                            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(22, 101, 52, 0.05)'
                        }}
                    >
                        <Bot style={{ width: 16, height: 16 }} />
                        <span className="hidden sm:inline">Preencher com Imagem (IA)</span>
                    </button>
                </div>
            </div>

            {/* Erro */}
            {erro && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                    padding: '0.85rem 1.25rem', marginBottom: '1.25rem',
                    fontSize: '0.85rem', color: '#dc2626', fontWeight: 500,
                }}>
                    {erro}
                </div>
            )}

            {/* Sucesso */}
            {sucesso && (
                <div style={{
                    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12,
                    padding: '0.85rem 1.25rem', marginBottom: '1.25rem',
                    fontSize: '0.85rem', color: '#166534', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
                }}>
                    <span>✅ {sucesso}</span>
                    <a
                        href="/admin/vagas"
                        style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}
                    >
                        Ver lista de vagas →
                    </a>
                </div>
            )}

            {/* Modal IA */}
            {showAIModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: '2rem',
                        width: '100%', maxWidth: 460, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Loading overlay dentro do modal */}
                        {aiLoading && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', gap: '1rem', zIndex: 10, borderRadius: 16
                            }}>
                                <div style={{
                                    width: 44, height: 44,
                                    border: '4px solid #e2e8f0',
                                    borderTopColor: '#10a37f',
                                    borderRadius: '50%',
                                    animation: 'spin 0.7s linear infinite'
                                }} />
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', margin: 0 }}>Extraindo dados e salvando imagem...</p>
                                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Aguarde, ambas as operações rodam em paralelo.</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#09355F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bot style={{ width: 22, height: 22, color: '#10a37f' }} />
                                Ler de Imagem
                            </h2>
                            <button onClick={() => { setShowAIModal(false); setAiError(''); setAiFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X style={{ width: 20, height: 20, color: '#64748b' }} />
                            </button>
                        </div>

                        {aiError && (
                            <div style={{ padding: '0.75rem', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                                {aiError}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Anexo do Anúncio (Imagem)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setAiFile(e.target.files?.[0] || null)}
                                style={{
                                    width: '100%', padding: '0.5rem', border: '1.5px dashed #cbd5e1',
                                    borderRadius: 10, background: '#f8fafc', color: '#475569', fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        {/* Preview local da imagem selecionada */}
                        {aiFile && (
                            <div style={{ marginBottom: '1.25rem', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', padding: '0.5rem' }}>
                                <img
                                    src={URL.createObjectURL(aiFile)}
                                    alt="Preview"
                                    style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                                />
                            </div>
                        )}

                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#166534' }}>
                            <strong>ℹ️ O que acontece:</strong> A imagem é enviada para a IA extrair os dados e <strong>simultaneamente</strong> salva no Storage do Supabase. Após cadastrar a vaga, você poderá visualizá-la a qualquer momento.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => { setShowAIModal(false); setAiError(''); setAiFile(null); }}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={submitAI}
                                disabled={!aiFile || aiLoading}
                                style={{
                                    padding: '0.6rem 1.2rem', borderRadius: 8,
                                    background: aiLoading || !aiFile ? '#94a3b8' : '#10a37f',
                                    color: '#fff', border: 'none', fontWeight: 600, cursor: (aiLoading || !aiFile) ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                {aiLoading ? (
                                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                ) : (
                                    <Bot style={{ width: 14, height: 14 }} />
                                )}
                                {aiLoading ? 'Processando...' : 'Extrair Informações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Preview da Imagem Salva */}
            {showImagePreview && aiImageUrl && (
                <div
                    onClick={() => setShowImagePreview(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem', cursor: 'zoom-out'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: 16, padding: '1rem',
                            maxWidth: '90vw', maxHeight: '90vh',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            cursor: 'default'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ImageIcon style={{ width: 18, height: 18, color: '#1d4ed8' }} />
                                Imagem do Anúncio
                            </span>
                            <button
                                onClick={() => setShowImagePreview(false)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X style={{ width: 18, height: 18, color: '#475569' }} />
                            </button>
                        </div>
                        <img
                            src={aiImageUrl}
                            alt="Imagem do anúncio da vaga"
                            style={{
                                maxWidth: '80vw', maxHeight: '75vh',
                                borderRadius: 10, objectFit: 'contain',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Imagem salva no Supabase Storage • Clique fora para fechar</span>
                            <a
                                href={aiImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <ExternalLink style={{ width: 13, height: 13 }} /> Abrir original
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* ── Extrator de IA Result ── */}
                {form.json_content && (
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}><Bot style={{ width: 18, height: 18, color: '#10a37f' }} /> Extração via Inteligência Artificial</h2>
                        <details style={{ background: '#f8fafc', borderRadius: 10, padding: '0.8rem 1rem', border: '1px solid #e2e8f0' }}>
                            <summary style={{ fontWeight: 600, color: '#475569', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Ver JSON Bruto Retornado</summary>
                            <pre style={{ margin: '1rem 0 0', padding: '1.25rem', background: '#0f172a', color: '#f8fafc', borderRadius: 10, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.5 }}>
                                {form.json_content}
                            </pre>
                        </details>
                    </div>
                )}

                {/* ── Dados Principais ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Dados Principais</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Título da Vaga *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    style={inputStyle} placeholder="Ex: Desenvolvedor Front-End React"
                                    value={form.titulo} 
                                    onChange={e => {
                                        updateField('titulo', e.target.value)
                                        setMostrarSugestoesTitulos(true)
                                    }}
                                    onFocus={() => setMostrarSugestoesTitulos(true)}
                                    onBlur={() => setTimeout(() => setMostrarSugestoesTitulos(false), 200)}
                                />
                                {mostrarSugestoesTitulos && form.titulo.trim().length > 0 && (
                                    (() => {
                                        const search = form.titulo.toLowerCase()
                                        const filtradas = sugestoesTitulos.filter(t => t.toLowerCase().includes(search) && t.toLowerCase() !== search).slice(0, 5)
                                        if (filtradas.length === 0) return null;
                                        return (
                                            <ul style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                background: '#fff', border: '1.5px solid #e8edf5',
                                                borderRadius: '0 0 10px 10px', marginTop: '-4px',
                                                boxShadow: '0 4px 12px rgba(9,53,95,0.06)',
                                                maxHeight: 200, overflowY: 'auto',
                                                listStyle: 'none', padding: 0, margin: 0, zIndex: 11
                                            }}>
                                                {filtradas.map((titulo, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => {
                                                            updateField('titulo', titulo)
                                                            setMostrarSugestoesTitulos(false)
                                                        }}
                                                        style={{
                                                            padding: '0.65rem 0.85rem', cursor: 'pointer',
                                                            fontSize: '0.85rem', color: '#374151',
                                                            borderBottom: i < filtradas.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            background: '#fff'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        {titulo}
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    })()
                                )}
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Empresa *</label>
                                {form.empresa.trim() && (
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(form.empresa.trim())}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    >
                                        Buscar <ExternalLink style={{ width: 11, height: 11 }} />
                                    </a>
                                )}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    style={inputStyle} placeholder="Nome da empresa"
                                    value={form.empresa} 
                                    onChange={e => {
                                        updateField('empresa', e.target.value)
                                        setMostrarSugestoes(true)
                                    }}
                                    onFocus={() => setMostrarSugestoes(true)}
                                    onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                                />
                                {mostrarSugestoes && form.empresa.trim().length > 0 && (
                                    (() => {
                                        const search = form.empresa.toLowerCase()
                                        const filtradas = sugestoesEmpresas.filter(e => e.toLowerCase().includes(search) && e.toLowerCase() !== search).slice(0, 5)
                                        
                                        if (filtradas.length === 0) return null;
                                        
                                        return (
                                            <ul style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                background: '#fff', border: '1.5px solid #e8edf5',
                                                borderRadius: '0 0 10px 10px', marginTop: '-4px',
                                                boxShadow: '0 4px 12px rgba(9,53,95,0.06)',
                                                maxHeight: 200, overflowY: 'auto',
                                                listStyle: 'none', padding: 0, margin: 0, zIndex: 10
                                            }}>
                                                {filtradas.map((empresaString, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={async () => {
                                                            updateField('empresa', empresaString)
                                                            setMostrarSugestoes(false)
                                                            
                                                            // Auto-preencher contato
                                                            const dados = await buscarEmpresaPorNome(empresaString) as any
                                                            if (dados) {
                                                                if (dados.email_contato) updateField('email_contato', dados.email_contato)
                                                                if (dados.telefone) updateField('telefone_contato', formatPhoneInput(dados.telefone))
                                                                if (dados.whatsapp) updateField('whatsapp_contato', formatPhoneInput(dados.whatsapp))
                                                                if (dados.website) updateField('link_externo', dados.website)
                                                                if (dados.localizacao) updateField('local', dados.localizacao)
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '0.65rem 0.85rem', cursor: 'pointer',
                                                            fontSize: '0.85rem', color: '#374151',
                                                            borderBottom: i < filtradas.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            background: '#fff', transition: 'background 0.1s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        {empresaString}
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    })()
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Local</label>
                            <input
                                style={inputStyle} placeholder="Ex: São Paulo, SP"
                                value={form.local} onChange={e => updateField('local', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Modalidade *</label>
                            <select style={inputStyle} value={form.modalidade} onChange={e => updateField('modalidade', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option value="remoto">Remoto</option>
                                <option value="hibrido">Híbrido</option>
                                <option value="presencial">Presencial</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Tipo de Contrato</label>
                            <select style={inputStyle} value={form.tipo_contrato} onChange={e => updateField('tipo_contrato', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option value="clt">CLT</option>
                                <option value="pj">PJ</option>
                                <option value="estagio">Estágio</option>
                                <option value="temporario">Temporário</option>
                                <option value="freelancer">Freelancer</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Nível</label>
                            <select style={inputStyle} value={form.nivel} onChange={e => updateField('nivel', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option value="estagio">Estágio</option>
                                <option value="junior">Júnior</option>
                                <option value="pleno">Pleno</option>
                                <option value="senior">Sênior</option>
                                <option value="gerente">Gerente</option>
                                <option value="diretor">Diretor</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Descrição</label>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!form.titulo.trim()) { setErro('Preencha o Título da Vaga para gerar a descrição.'); return; }
                                        setAiGerandoDescricao(true);
                                        setErro('');
                                        const { gerarDescricaoComIA } = await import('@/actions/openai');
                                        const res = await gerarDescricaoComIA(form.titulo);
                                        setAiGerandoDescricao(false);
                                        if (res.success && res.data) {
                                            updateField('descricao', form.descricao ? form.descricao + '\n\n' + res.data : res.data);
                                        } else {
                                            setErro(res.error || 'Erro ao gerar descrição.');
                                        }
                                    }}
                                    disabled={aiGerandoDescricao || !form.titulo.trim()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.3rem 0.6rem', borderRadius: 6,
                                        background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
                                        fontSize: '0.75rem', fontWeight: 700, cursor: (aiGerandoDescricao || !form.titulo.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                        opacity: (!form.titulo.trim() && !aiGerandoDescricao) ? 0.6 : 1
                                    }}
                                >
                                    {aiGerandoDescricao ? (
                                        <div style={{ width: 12, height: 12, border: '2px solid rgba(22, 101, 52, 0.3)', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    ) : (
                                        <Bot style={{ width: 12, height: 12 }} />
                                    )}
                                    {aiGerandoDescricao ? 'Gerando...' : 'Gerar com IA'}
                                </button>
                            </div>
                            <textarea
                                style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
                                placeholder="Descreva a vaga, cultura da empresa, oportunidades..."
                                value={form.descricao} onChange={e => updateField('descricao', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Remuneração ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><DollarSign style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Remuneração</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Salário Mínimo (R$)</label>
                            <input
                                style={inputStyle} placeholder="Ex: R$ 3.000,00"
                                value={form.salario_min} onChange={e => updateField('salario_min', formatCurrency(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Salário Máximo (R$)</label>
                            <input
                                style={inputStyle} placeholder="Ex: R$ 5.000,00"
                                value={form.salario_max} onChange={e => updateField('salario_max', formatCurrency(e.target.value))}
                            />
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.mostrar_salario} onChange={e => updateField('mostrar_salario', e.target.checked)} />
                        Mostrar salário publicamente na vaga
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.salario_a_combinar} onChange={e => updateField('salario_a_combinar', e.target.checked)} />
                        Salário a combinar
                    </label>
                </div>

                {/* ── Contato ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Mail style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Contato</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>E-mail de contato</label>
                            <input
                                type="email" style={inputStyle} placeholder="rh@empresa.com"
                                value={form.email_contato} onChange={e => updateField('email_contato', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Link externo</label>
                            <input
                                style={inputStyle} placeholder="https://empresa.com/vaga"
                                value={form.link_externo} onChange={e => updateField('link_externo', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone Comercial</label>
                            <input
                                type="tel" style={inputStyle} placeholder="(00) 0000-0000"
                                value={form.telefone_contato} onChange={e => updateField('telefone_contato', formatPhoneInput(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                WhatsApp
                                {form.whatsapp_contato && form.whatsapp_contato.replace(/\D/g, '').length >= 10 && (
                                    <a 
                                        href={`https://wa.me/55${form.whatsapp_contato.replace(/\D/g, '')}`} 
                                        target="_blank" rel="noreferrer" 
                                        style={{ fontSize: '0.7rem', color: '#25D366', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    >
                                        <ExternalLink size={12} /> Chat
                                    </a>
                                )}
                            </label>
                            <input
                                type="tel" style={inputStyle} placeholder="(00) 90000-0000"
                                value={form.whatsapp_contato} onChange={e => updateField('whatsapp_contato', formatPhoneInput(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Itens dinâmicos ── */}
                {renderListSection('Responsabilidades', 'O que o profissional vai fazer...', responsabilidades, setResponsabilidades)}
                {renderListSection('Requisitos', 'Experiência com React, TypeScript...', requisitos, setRequisitos)}
                {renderListSection('Diferenciais', 'Conhecimento em AWS, Docker...', diferenciais, setDiferenciais)}
                {renderListSection('Benefícios', 'Vale-refeição, plano de saúde...', beneficios, setBeneficios)}

                {/* ── Configurações ── */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}><Star style={{ width: 18, height: 18, color: '#2AB9C0' }} /> Configurações</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select style={inputStyle} value={form.status} onChange={e => updateField('status', e.target.value)}>
                                <option value="ativa">Ativa</option>
                                <option value="rascunho">Rascunho</option>
                                <option value="pausada">Pausada</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.25rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.destaque} onChange={e => updateField('destaque', e.target.checked)} />
                                Vaga em destaque
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Botões ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <Link href="/admin/vagas" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.5rem', borderRadius: 10,
                        border: '1.5px solid #e2e8f0', background: '#fff',
                        color: '#64748b', fontSize: '0.875rem', fontWeight: 600,
                        textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.18s',
                    }}>
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 1.75rem', borderRadius: 10,
                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #09355F, #0d4a80)',
                            color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                            transition: 'all 0.18s',
                        }}
                    >
                        {loading ? (
                            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        ) : (
                            <Save style={{ width: 16, height: 16 }} />
                        )}
                        {loading ? 'Salvando...' : 'Cadastrar Vaga'}
                    </button>
                </div>
            </form>
        </div>
    )

    // ── Componente de lista dinâmica ──
    function renderListSection(
        titulo: string,
        placeholder: string,
        items: string[],
        setItems: React.Dispatch<React.SetStateAction<string[]>>
    ) {
        return (
            <div style={cardStyle}>
                <h2 style={sectionTitle}>
                    <FileText style={{ width: 18, height: 18, color: '#2AB9C0' }} /> {titulo}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                style={{ ...inputStyle, flex: 1 }}
                                placeholder={placeholder}
                                value={item}
                                onChange={e => updateItem(setItems, idx, e.target.value)}
                            />
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(setItems, idx)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 34, height: 34, borderRadius: 8, border: 'none',
                                        background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                                        flexShrink: 0, transition: 'background 0.18s',
                                    }}
                                    aria-label={`Remover ${titulo.toLowerCase()}`}
                                >
                                    <X style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addItem(setItems)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        marginTop: '0.65rem', padding: '0.45rem 0.85rem',
                        borderRadius: 8, border: '1.5px dashed #cbd5e1',
                        background: '#f8fafc', color: '#64748b',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.18s',
                    }}
                >
                    <Plus style={{ width: 14, height: 14 }} /> Adicionar {titulo.toLowerCase().slice(0, -1)}
                </button>
            </div>
        )
    }
}

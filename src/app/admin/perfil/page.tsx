'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Camera, User, Mail, Phone, MapPin, Building2, Globe,
    Save, FileText, Linkedin, Github, Calendar, Shield
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getMeuPerfilCompleto, salvarPerfil } from '@/actions/auth'
import BannerSpace from '@/components/publicidade/BannerSpace'

const formatTextCpf = (val: string) => {
    let v = String(val || '').replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
    if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
    if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
    return v
}

const formatTextTelefone = (val: string) => {
    let v = String(val || '').replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length === 11) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    if (v.length === 10) return v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4,5})(\d+)$/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d+)$/, '($1) $2')
    return v
}

const formatTextCep = (val: string) => {
    let v = String(val || '').replace(/\D/g, '').slice(0, 8)
    if (v.length > 5) return `${v.slice(0, 5)}-${v.slice(5)}`
    return v
}

// Dados mock do usuário
const MOCK_USER = {
    nome: 'Administrador',
    sobrenome: 'do Sistema',
    email: 'admin@portaljobs.com',
    telefone: '(11) 99999-1234',
    celular: '(11) 98765-4321',
    dataNascimento: '1990-05-15',
    cpf: '123.456.789-00',
    cargo: 'Administrador',
    bio: 'Administrador do Portal Jobs, responsável pela gestão da plataforma e acompanhamento de vagas, candidatos e empresas.',
    foto: '',
    // Endereço
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Sala 1205',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    // Redes sociais
    linkedin: 'https://linkedin.com/in/admin',
    github: 'https://github.com/admin',
    website: 'https://portaljobs.com',
}

export default function PerfilPage() {
    const [dados, setDados] = useState<any>(MOCK_USER)
    const [fotoPreview, setFotoPreview] = useState('')
    const [salvando, setSalvando] = useState(false)
    const [salvou, setSalvou] = useState(false)
    const [hasAd, setHasAd] = useState(true) // assume true until BannerSpace confirms otherwise
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        getMeuPerfilCompleto().then((res) => {
            if (res) {
                const c = (res as any).candidato_perfil || {}
                const end = (res as any).endereco || {}
                setDados({
                    nome: res.nome || '',
                    sobrenome: res.sobrenome || '',
                    email: res.email || '',
                    telefone: formatTextTelefone((res as any).telefone),
                    celular: formatTextTelefone((res as any).celular || c.whatsapp || ''),
                    dataNascimento: (res as any).data_nascimento || c.data_nascimento || '',
                    cpf: formatTextCpf((res as any).cpf || ''),
                    cargo: (res as any).tipo === 'admin' ? 'ADMIN' : ((res as any).tipo === 'empregador' ? 'EMPREGADOR' : (c.cargo_desejado || 'CANDIDATO')),
                    bio: c.resumo || '',
                    foto: (res as any).avatar_url || '',
                    cep: formatTextCep(end.cep || ''),
                    logradouro: end.logradouro || '',
                    numero: end.numero || '',
                    complemento: end.complemento || '',
                    bairro: end.bairro || '',
                    cidade: end.cidade || c.local?.split(' - ')[0] || '',
                    estado: end.estado || '',
                    linkedin: c.linkedin || '',
                    github: c.github || '',
                    website: c.portfolio || '',
                })
            }
        })
    }, [])

    function handleChange(campo: string, valor: string) {
        setDados((prev: any) => ({ ...prev, [campo]: valor }))
    }

    function handleCpfChange(val: string) {
        setDados((prev: any) => ({ ...prev, cpf: formatTextCpf(val) }))
    }

    function handleTelefoneChange(campo: 'telefone' | 'celular', val: string) {
        setDados((prev: any) => ({ ...prev, [campo]: formatTextTelefone(val) }))
    }

    async function handleCepChange(val: string) {
        let cepStr = val.replace(/\D/g, '')
        if (cepStr.length > 8) cepStr = cepStr.slice(0, 8)
        
        let formattedCep = cepStr
        if (cepStr.length > 5) {
            formattedCep = `${cepStr.slice(0, 5)}-${cepStr.slice(5)}`
        }

        setDados((prev: any) => ({ ...prev, cep: formattedCep }))

        if (cepStr.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cepStr}/json/`)
                const dt = await res.json()
                if (!dt.erro) {
                    setDados((prev: any) => ({
                        ...prev,
                        logradouro: dt.logradouro || prev.logradouro,
                        bairro: dt.bairro || prev.bairro,
                        cidade: dt.localidade || prev.cidade,
                        estado: dt.uf || prev.estado,
                    }))
                }
            } catch (e) {
                console.error("Erro ao buscar CEP", e)
            }
        }
    }

    function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setFotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function handleSalvar() {
        setSalvando(true)
        const res = await salvarPerfil({
            nome: dados.nome,
            sobrenome: dados.sobrenome,
            telefone: dados.telefone,
            celular: dados.celular,
            cpf: dados.cpf,
            data_nascimento: dados.dataNascimento,
            bio: dados.bio,
            linkedin: dados.linkedin,
            github: dados.github,
            website: dados.website,
            cep: dados.cep,
            logradouro: dados.logradouro,
            numero: dados.numero,
            complemento: dados.complemento,
            bairro: dados.bairro,
            cidade: dados.cidade,
            estado: dados.estado,
        })
        setSalvando(false)
        if (res.success) {
            setSalvou(true)
            setTimeout(() => setSalvou(false), 3000)
        } else {
            alert(res.error || 'Erro ao salvar. Tente novamente.')
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', height: 44, padding: '0 0.875rem',
        background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: 10,
        fontSize: '0.85rem', color: '#1a2332', outline: 'none',
        transition: 'border-color 0.18s',
    }

    const labelStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem',
    }

    const sectionStyle: React.CSSProperties = {
        background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5',
        overflow: 'hidden', marginBottom: '1.25rem',
    }

    const sectionHeaderStyle: React.CSSProperties = {
        padding: '1rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
    }

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0,
    }

    const gridStyle: React.CSSProperties = {
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem',
        padding: '1.25rem 1.5rem',
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Meu Perfil"
                subtitulo="Gerencie suas informações pessoais e preferências"
                acao={
                    <button
                        onClick={handleSalvar}
                        disabled={salvando}
                        className="btn-primary"
                        style={{
                            padding: '0.65rem 1.5rem', fontSize: '0.85rem', borderRadius: 10,
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            opacity: salvando ? 0.7 : 1,
                        }}
                    >
                        <Save style={{ width: 16, height: 16 }} />
                        {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                }
            />

            {/* Toast de sucesso */}
            {salvou && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 100,
                    background: '#16a34a', color: '#fff', padding: '0.75rem 1.25rem',
                    borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    animation: 'slideInRight 0.3s ease',
                }}>
                    ✓ Perfil atualizado com sucesso!
                </div>
            )}

            {/* ── Grid topo: Foto de Perfil + Publicidade ── */}
            <div style={{ display: 'grid', gridTemplateColumns: hasAd ? '1fr 1fr' : '1fr', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'stretch' }}>

                {/* Card Foto de Perfil */}
                <div style={{ ...sectionStyle, marginBottom: 0, height: '100%' }}>
                    <div style={{ ...sectionHeaderStyle }}>
                        <Camera style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                        <h2 style={sectionTitleStyle}>Foto de Perfil</h2>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Avatar preview */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: 110, height: 110, borderRadius: 18,
                                background: fotoPreview ? `url(${fotoPreview}) center/cover` : 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                border: '3px solid #e8edf5', flexShrink: 0,
                                transition: 'border-color 0.18s',
                            }}
                        >
                            {!fotoPreview && (
                                <span style={{ color: '#fff', fontWeight: 900, fontSize: '2rem' }}>
                                    {dados.nome[0]}{dados.sobrenome[0]}
                                </span>
                            )}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(0,0,0,0.4)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                            >
                                <Camera style={{ width: 28, height: 28, color: '#fff' }} />
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFotoChange}
                            style={{ display: 'none' }}
                        />

                        <div>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', marginBottom: '0.3rem' }}>
                                {dados.nome} {dados.sobrenome}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{dados.cargo}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '0.45rem 1rem', borderRadius: 8,
                                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                        background: '#09355F0a', border: '1.5px solid #09355F20',
                                        color: '#09355F', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                        transition: 'background 0.18s',
                                    }}
                                >
                                    <Camera style={{ width: 13, height: 13 }} /> Alterar foto
                                </button>
                                {fotoPreview && (
                                    <button
                                        onClick={() => setFotoPreview('')}
                                        style={{
                                            padding: '0.45rem 1rem', borderRadius: 8,
                                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                            background: '#fef2f2', border: '1.5px solid #fecaca',
                                            color: '#dc2626', transition: 'background 0.18s',
                                        }}
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                JPG, PNG ou GIF. Máximo 5MB.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Publicidade */}
                <BannerSpace
                    formato="native"
                    className="ad-perfil-sidebar"
                    style={{ height: '100%', minHeight: 0 }}
                    imageColWidth={280}
                    onNoAd={() => setHasAd(false)}
                />

            </div>

            {/* ── Dados Pessoais ── */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <User style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={sectionTitleStyle}>Dados Pessoais</h2>
                </div>
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}><User style={{ width: 12, height: 12 }} /> Nome</label>
                        <input style={inputStyle} value={dados.nome} onChange={e => handleChange('nome', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}><User style={{ width: 12, height: 12 }} /> Sobrenome</label>
                        <input style={inputStyle} value={dados.sobrenome} onChange={e => handleChange('sobrenome', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}><Mail style={{ width: 12, height: 12 }} /> E-mail</label>
                        <input style={inputStyle} type="email" value={dados.email} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}><Calendar style={{ width: 12, height: 12 }} /> Data de Nascimento</label>
                        <input style={inputStyle} type="date" value={dados.dataNascimento} onChange={e => handleChange('dataNascimento', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}><FileText style={{ width: 12, height: 12 }} /> CPF</label>
                        <input style={inputStyle} value={dados.cpf} onChange={e => handleCpfChange(e.target.value)} placeholder="000.000.000-00" maxLength={14} />
                    </div>
                    <div>
                        <label style={labelStyle}><Shield style={{ width: 12, height: 12 }} /> Cargo / Função</label>
                        <input style={inputStyle} value={dados.cargo} onChange={e => handleChange('cargo', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}><FileText style={{ width: 12, height: 12 }} /> Bio</label>
                        <textarea
                            value={dados.bio}
                            onChange={e => handleChange('bio', e.target.value)}
                            style={{
                                ...inputStyle, height: 90, padding: '0.75rem 0.875rem',
                                resize: 'vertical', fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Dados de Contato ── */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <Phone style={{ width: 18, height: 18, color: '#FBBF53' }} />
                    <h2 style={sectionTitleStyle}>Dados de Contato</h2>
                </div>
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}><Phone style={{ width: 12, height: 12 }} /> Telefone</label>
                        <input style={inputStyle} value={dados.telefone} onChange={e => handleTelefoneChange('telefone', e.target.value)} placeholder="(00) 0000-0000" maxLength={15} />
                    </div>
                    <div>
                        <label style={labelStyle}><Phone style={{ width: 12, height: 12 }} /> Celular</label>
                        <input style={inputStyle} value={dados.celular} onChange={e => handleTelefoneChange('celular', e.target.value)} placeholder="(00) 00000-0000" maxLength={15} />
                    </div>
                </div>
            </div>



            {/* ── Endereço ── */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <MapPin style={{ width: 18, height: 18, color: '#FE8341' }} />
                    <h2 style={sectionTitleStyle}>Endereço</h2>
                </div>
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}><MapPin style={{ width: 12, height: 12 }} /> CEP</label>
                        <input style={inputStyle} value={dados.cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} placeholder="00000-000" />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}><MapPin style={{ width: 12, height: 12 }} /> Logradouro</label>
                            <input style={inputStyle} value={dados.logradouro} onChange={e => handleChange('logradouro', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Número</label>
                            <input style={inputStyle} value={dados.numero} onChange={e => handleChange('numero', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Complemento</label>
                            <input style={inputStyle} value={dados.complemento} onChange={e => handleChange('complemento', e.target.value)} />
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Bairro</label>
                            <input style={inputStyle} value={dados.bairro} onChange={e => handleChange('bairro', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}><Building2 style={{ width: 12, height: 12 }} /> Cidade</label>
                            <input style={inputStyle} value={dados.cidade} onChange={e => handleChange('cidade', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Estado</label>
                            <select
                                value={dados.estado}
                                onChange={e => handleChange('estado', e.target.value)}
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                            >
                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>



            {/* ── Redes Sociais ── */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <Globe style={{ width: 18, height: 18, color: '#09355F' }} />
                    <h2 style={sectionTitleStyle}>Redes Sociais</h2>
                </div>
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}><Linkedin style={{ width: 12, height: 12 }} /> LinkedIn</label>
                        <input style={inputStyle} placeholder="https://linkedin.com/in/seu-perfil" value={dados.linkedin} onChange={e => handleChange('linkedin', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}><Github style={{ width: 12, height: 12 }} /> GitHub</label>
                        <input style={inputStyle} placeholder="https://github.com/seu-perfil" value={dados.github} onChange={e => handleChange('github', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}><Globe style={{ width: 12, height: 12 }} /> Website</label>
                        <input style={inputStyle} placeholder="https://seu-site.com" value={dados.website} onChange={e => handleChange('website', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Botão salvar mobile/bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
                <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    className="btn-primary"
                    style={{
                        padding: '0.75rem 2rem', fontSize: '0.88rem', borderRadius: 10,
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        opacity: salvando ? 0.7 : 1,
                    }}
                >
                    <Save style={{ width: 16, height: 16 }} />
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>


        </div>
    )
}

'use client'

import { useState } from 'react'
import {
    Mail, Phone, MapPin, Calendar, Clock, Briefcase,
    GraduationCap, FileText, Download, Globe, Linkedin, Github,
    Shield, Languages, DollarSign, User, Sun, Moon
} from 'lucide-react'

function getNivelIdiomaWidth(nivel: string | null) {
    if (!nivel) return '10%'
    const n = nivel.toLowerCase()
    if (n === 'nativo') return '100%'
    if (n === 'fluente') return '90%'
    if (n === 'avancado' || n === 'avançado') return '75%'
    if (n === 'intermediario' || n === 'intermediário') return '50%'
    if (n === 'basico' || n === 'básico') return '25%'
    return '10%'
}

function getDocIcon(tipo: string) {
    switch (tipo) {
        case 'pdf': return { color: '#dc2626', label: 'PDF' }
        case 'doc': return { color: '#1565c0', label: 'DOC' }
        case 'img': return { color: '#16a34a', label: 'IMG' }
        case 'zip': return { color: '#FBBF53', label: 'ZIP' }
        default: return { color: '#64748b', label: 'FILE' }
    }
}

// ── Tokens de tema ──
const light = {
    bg: '#f1f5f9',
    card: '#ffffff',
    cardBorder: '#e8edf5',
    headerBg: '#ffffff',
    title: '#09355F',
    subtitle: '#2AB9C0',
    text: '#374151',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    divider: '#f0f4f8',
    tagBg: '#f1f5f9',
    tagColor: '#475569',
    sectionHeaderBg: '#fafbfd',
    docBg: '#f8fafc',
}

const dark = {
    bg: '#0f172a',
    card: '#1e293b',
    cardBorder: '#334155',
    headerBg: '#1e293b',
    title: '#e2e8f0',
    subtitle: '#2AB9C0',
    text: '#cbd5e1',
    textMuted: '#94a3b8',
    textFaint: '#64748b',
    divider: '#334155',
    tagBg: '#0f172a',
    tagColor: '#cbd5e1',
    sectionHeaderBg: '#0f172a',
    docBg: '#0f172a',
}

export default function CurriculoPublicoClient({ candidato }: { candidato: any }) {
    const [isDark, setIsDark] = useState(false)
    const t = isDark ? dark : light

    const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
        <div style={{
            background: t.card, border: `1.5px solid ${t.cardBorder}`,
            borderRadius: 14, overflow: 'hidden', ...extra
        }}>
            {children}
        </div>
    )

    const section = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
        <div style={{ background: t.card, border: `1.5px solid ${t.cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
                padding: '0.85rem 1.5rem', background: t.sectionHeaderBg,
                borderBottom: `1.5px solid ${t.cardBorder}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
                {icon}
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: t.title }}>{title}</span>
            </div>
            {children}
        </div>
    )

    return (
        <div style={{ background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>

                {/* ── Header ── */}
                <div style={{
                    background: t.headerBg, border: `1.5px solid ${t.cardBorder}`,
                    borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.3s, border-color 0.3s',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: t.title, margin: 0, transition: 'color 0.3s' }}>
                            {candidato.nome}
                        </h1>
                        <p style={{ color: t.subtitle, fontWeight: 600, fontSize: '0.95rem', margin: '0.2rem 0 0' }}>
                            {candidato.cargo}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 42, height: 42, borderRadius: 10, cursor: 'pointer',
                            background: isDark ? '#334155' : '#f1f5f9',
                            border: `1.5px solid ${t.cardBorder}`,
                            color: isDark ? '#fbbf24' : '#64748b',
                            transition: 'all 0.25s',
                        }}
                    >
                        {isDark
                            ? <Sun style={{ width: 18, height: 18 }} />
                            : <Moon style={{ width: 18, height: 18 }} />
                        }
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.25rem', alignItems: 'start' }}>

                    {/* ── Sidebar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {card(
                            <>
                                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: 20, margin: '0 auto 1rem',
                                        background: 'linear-gradient(135deg, #2AB9C0, #09355F)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 900, fontSize: '1.5rem',
                                    }}>
                                        {candidato.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: t.title, marginBottom: '0.15rem', transition: 'color 0.3s' }}>{candidato.nome}</h2>
                                    <p style={{ fontSize: '0.82rem', color: t.subtitle, fontWeight: 600, marginBottom: '0.5rem' }}>{candidato.cargo}</p>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                        fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                                        color: '#16a34a', background: '#f0fdf4',
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                                        Perfil Verificado
                                    </span>
                                </div>

                                <div style={{ borderTop: `1px solid ${t.divider}`, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {[
                                        { icon: <Mail style={{ width: 14, height: 14, color: t.subtitle }} />, label: candidato.email },
                                        { icon: <Phone style={{ width: 14, height: 14, color: t.subtitle }} />, label: `Tel: ${candidato.telefone}` },
                                        { icon: <Phone style={{ width: 14, height: 14, color: t.subtitle }} />, label: `Whats: ${candidato.celular}` },
                                        { icon: <MapPin style={{ width: 14, height: 14, color: t.subtitle }} />, label: candidato.local },
                                        { icon: <Calendar style={{ width: 14, height: 14, color: t.subtitle }} />, label: `Nascimento: ${candidato.dataNascimento}` },
                                    ].map((row, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {row.icon}
                                            <span style={{ fontSize: '0.8rem', color: t.textMuted, transition: 'color 0.3s' }}>{row.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ borderTop: `1px solid ${t.divider}`, padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    {candidato.linkedin && (
                                        <a href={candidato.linkedin} target="_blank" rel="noopener noreferrer" style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                            padding: '0.5rem', borderRadius: 8, background: '#0077b514', color: '#0077b5',
                                            fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                        }}>
                                            <Linkedin style={{ width: 14, height: 14 }} /> LinkedIn
                                        </a>
                                    )}
                                    {candidato.github && (
                                        <a href={candidato.github} target="_blank" rel="noopener noreferrer" style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                            padding: '0.5rem', borderRadius: 8,
                                            background: isDark ? '#ffffff14' : '#24292e14',
                                            color: isDark ? '#e2e8f0' : '#24292e',
                                            fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                        }}>
                                            <Github style={{ width: 14, height: 14 }} /> GitHub
                                        </a>
                                    )}
                                </div>
                            </>
                        )}

                        {card(
                            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { icon: <Clock style={{ width: 15, height: 15, color: t.subtitle }} />, label: 'Experiência', value: candidato.experiencia },
                                    { icon: <DollarSign style={{ width: 15, height: 15, color: '#16a34a' }} />, label: 'Pretensão', value: candidato.pretensaoSalarial },
                                    { icon: <Shield style={{ width: 15, height: 15, color: '#FBBF53' }} />, label: 'Disponibilidade', value: candidato.disponibilidade },
                                ].map((row, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {row.icon}
                                            <span style={{ fontSize: '0.78rem', color: t.textMuted, fontWeight: 500, transition: 'color 0.3s' }}>{row.label}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.title, transition: 'color 0.3s' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {candidato.habilidades.length > 0 && section(
                            <Shield style={{ width: 16, height: 16, color: '#2AB9C0' }} />, 'Habilidades',
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {candidato.habilidades.map((h: string) => (
                                    <span key={h} style={{
                                        padding: '4px 10px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600,
                                        background: isDark ? '#334155' : '#f1f5f9',
                                        color: isDark ? '#cbd5e1' : '#475569',
                                        border: `1px solid ${t.cardBorder}`,
                                        transition: 'all 0.3s',
                                    }}>{h}</span>
                                ))}
                            </div>
                        )}

                        {candidato.idiomas.length > 0 && section(
                            <Languages style={{ width: 16, height: 16, color: '#FBBF53' }} />, 'Idiomas',
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {candidato.idiomas.map((i: any) => (
                                    <div key={i.idioma}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: t.title, textTransform: 'capitalize', transition: 'color 0.3s' }}>{i.idioma}</span>
                                            <span style={{ fontSize: '0.72rem', color: t.textMuted, textTransform: 'capitalize', transition: 'color 0.3s' }}>{i.nivel}</span>
                                        </div>
                                        <div style={{ height: 6, background: isDark ? '#334155' : '#f0f4f8', borderRadius: 9999, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: getNivelIdiomaWidth(i.nivel), background: 'linear-gradient(90deg, #2AB9C0, #09355F)', borderRadius: 9999 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Conteúdo Principal ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>
                        {section(
                            <User style={{ width: 18, height: 18, color: '#2AB9C0' }} />, 'Sobre',
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <p style={{ fontSize: '0.88rem', color: t.text, lineHeight: 1.7, margin: 0, transition: 'color 0.3s' }}>{candidato.bio}</p>
                            </div>
                        )}

                        {candidato.experiencias.length > 0 && section(
                            <Briefcase style={{ width: 18, height: 18, color: '#FE8341' }} />, 'Experiência Profissional',
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                {candidato.experiencias.map((exp: any, i: number) => (
                                    <div key={exp.id} style={{
                                        paddingBottom: i < candidato.experiencias.length - 1 ? '1.25rem' : 0,
                                        marginBottom: i < candidato.experiencias.length - 1 ? '1.25rem' : 0,
                                        borderBottom: i < candidato.experiencias.length - 1 ? `1px solid ${t.divider}` : 'none',
                                        position: 'relative', paddingLeft: '1.75rem',
                                    }}>
                                        <div style={{
                                            position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%',
                                            background: exp.atual ? '#2AB9C0' : (isDark ? '#475569' : '#e8edf5'),
                                            border: exp.atual ? '2px solid #2AB9C040' : `2px solid ${isDark ? '#64748b' : '#d1d5db'}`,
                                        }} />
                                        {i < candidato.experiencias.length - 1 && (
                                            <div style={{ position: 'absolute', left: 4, top: 18, width: 2, bottom: 0, background: isDark ? '#334155' : '#e8edf5' }} />
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: t.title, margin: 0, transition: 'color 0.3s' }}>{exp.cargo}</h3>
                                            {exp.atual && <span style={{ padding: '1px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700, background: '#e8f5e9', color: '#2e7d32' }}>Atual</span>}
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: '#2AB9C0', fontWeight: 600, margin: '0 0 0.15rem' }}>{exp.empresa}</p>
                                        <p style={{ fontSize: '0.75rem', color: t.textFaint, margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.3s' }}>
                                            <Calendar style={{ width: 11, height: 11 }} /> {exp.periodo}
                                        </p>
                                        <p style={{ fontSize: '0.82rem', color: t.text, lineHeight: 1.6, margin: 0, transition: 'color 0.3s' }}>{exp.descricao}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {candidato.formacoes.length > 0 && section(
                            <GraduationCap style={{ width: 18, height: 18, color: '#FBBF53' }} />, 'Formação Acadêmica',
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                {candidato.formacoes.map((f: any, i: number) => (
                                    <div key={f.id} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                        paddingBottom: i < candidato.formacoes.length - 1 ? '1rem' : 0,
                                        marginBottom: i < candidato.formacoes.length - 1 ? '1rem' : 0,
                                        borderBottom: i < candidato.formacoes.length - 1 ? `1px solid ${t.divider}` : 'none',
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: f.tipo === 'Certificação' ? '#FE834120' : '#FBBF5320',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <GraduationCap style={{ width: 18, height: 18, color: f.tipo === 'Certificação' ? '#FE8341' : '#FBBF53' }} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: t.title, margin: '0 0 0.15rem', transition: 'color 0.3s' }}>{f.curso}</h3>
                                            <p style={{ fontSize: '0.8rem', color: t.text, margin: '0 0 0.15rem', transition: 'color 0.3s' }}>{f.instituicao}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.72rem', color: t.textFaint, transition: 'color 0.3s' }}>{f.periodo}</span>
                                                <span style={{
                                                    padding: '1px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600,
                                                    background: f.tipo === 'Certificação' ? '#FE834114' : '#09355F0a',
                                                    color: f.tipo === 'Certificação' ? '#FE8341' : '#09355F',
                                                }}>{f.tipo}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {candidato.documentos.length > 0 && section(
                            <FileText style={{ width: 18, height: 18, color: '#dc2626' }} />, 'Documentos Anexados',
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {candidato.documentos.map((doc: any) => {
                                    const docStyle = getDocIcon(doc.tipo)
                                    return (
                                        <div key={doc.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 1rem', borderRadius: 10,
                                            background: t.docBg, border: `1px solid ${t.cardBorder}`,
                                            transition: 'background 0.3s',
                                        }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 8,
                                                background: `${docStyle.color}20`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', fontWeight: 900, color: docStyle.color, flexShrink: 0,
                                            }}>{docStyle.label}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: t.title, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.3s' }}>{doc.nome}</p>
                                                <p style={{ fontSize: '0.72rem', color: t.textFaint, margin: 0, transition: 'color 0.3s' }}>{doc.tamanho} · Enviado em {doc.dataUpload}</p>
                                            </div>
                                            {doc.url && (
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                                    background: 'none', border: `1.5px solid ${t.cardBorder}`, color: '#2AB9C0',
                                                    cursor: 'pointer', textDecoration: 'none', transition: 'border-color 0.3s',
                                                }}>
                                                    <Download style={{ width: 12, height: 12 }} /> Baixar
                                                </a>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <footer style={{ marginTop: '3rem', padding: '1.5rem', textAlign: 'center', borderTop: `2px dashed ${t.divider}`, transition: 'border-color 0.3s' }}>
                    <p style={{ fontSize: '0.85rem', color: t.textFaint, fontWeight: 600, transition: 'color 0.3s' }}>
                        Currículo gerado e hospedado no Portal de Empregos
                    </p>
                </footer>
            </div>
        </div>
    )
}

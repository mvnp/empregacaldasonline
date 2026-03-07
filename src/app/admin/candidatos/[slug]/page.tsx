'use client'

import { use } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Briefcase,
    GraduationCap, FileText, Download, Globe, Linkedin, Github,
    Shield, Languages, DollarSign, ExternalLink, User
} from 'lucide-react'
import { getCandidatoDetalhe } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function getStatusCandidaturaColor(status: string) {
    switch (status) {
        case 'aprovado': return { bg: '#e8f5e9', color: '#2e7d32', label: 'Aprovado' }
        case 'recusado': return { bg: '#ffebee', color: '#c62828', label: 'Recusado' }
        case 'entrevista': return { bg: '#e3f2fd', color: '#1565c0', label: 'Entrevista' }
        case 'em_analise': return { bg: '#fff3e0', color: '#e65100', label: 'Em Análise' }
        case 'pendente': return { bg: '#f3e8ff', color: '#7c3aed', label: 'Pendente' }
        default: return { bg: '#e8ecf5', color: '#09355F', label: status }
    }
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

function getNivelIdiomaWidth(nivel: string) {
    switch (nivel) {
        case 'Nativo': return '100%'
        case 'Fluente': return '90%'
        case 'Avançado': return '75%'
        case 'Intermediário': return '50%'
        case 'Básico': return '25%'
        default: return '10%'
    }
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

export default function CandidatoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const candidato = getCandidatoDetalhe(slug)

    if (!candidato) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Candidato não encontrado</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>O candidato solicitado não existe ou foi removido.</p>
                <Link href="/admin/candidatos" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Candidatos
                </Link>
            </div>
        )
    }

    return (
        <div>
            <AdminPageHeader
                titulo={candidato.nome}
                subtitulo={`${candidato.cargo} · ${candidato.local}`}
                acao={
                    <Link
                        href="/admin/candidatos"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                            color: '#09355F', background: '#09355F0a', border: '1.5px solid #09355F14',
                            textDecoration: 'none', transition: 'background 0.18s',
                        }}
                    >
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>
                }
            />

            {/* ── Layout: Sidebar + Content ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">

                {/* ── Sidebar: Perfil ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Card perfil */}
                    <div style={sectionStyle}>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 20, margin: '0 auto 1rem',
                                background: 'linear-gradient(135deg, #2AB9C0, #09355F)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 900, fontSize: '1.5rem',
                            }}>
                                {candidato.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', marginBottom: '0.15rem' }}>{candidato.nome}</h2>
                            <p style={{ fontSize: '0.82rem', color: '#2AB9C0', fontWeight: 600, marginBottom: '0.5rem' }}>{candidato.cargo}</p>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                                color: candidato.status === 'ativo' ? '#16a34a' : '#dc2626',
                                background: candidato.status === 'ativo' ? '#f0fdf4' : '#fef2f2',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: candidato.status === 'ativo' ? '#16a34a' : '#dc2626' }} />
                                {candidato.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid #f0f4f8', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <InfoRow icon={Mail} label={candidato.email} />
                            <InfoRow icon={Phone} label={candidato.telefone} />
                            <InfoRow icon={Phone} label={candidato.celular} />
                            <InfoRow icon={MapPin} label={`${candidato.logradouro}, ${candidato.numero} – ${candidato.bairro}, ${candidato.cidade}/${candidato.estado}`} />
                            <InfoRow icon={Calendar} label={`Nascimento: ${candidato.dataNascimento}`} />
                        </div>

                        {/* Redes sociais */}
                        <div style={{ borderTop: '1px solid #f0f4f8', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
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
                                    padding: '0.5rem', borderRadius: 8, background: '#24292e14', color: '#24292e',
                                    fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    <Github style={{ width: 14, height: 14 }} /> GitHub
                                </a>
                            )}
                            {candidato.website && (
                                <a href={candidato.website} target="_blank" rel="noopener noreferrer" style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                    padding: '0.5rem', borderRadius: 8, background: '#2AB9C014', color: '#2AB9C0',
                                    fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    <Globe style={{ width: 14, height: 14 }} /> Site
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Resumo rápido */}
                    <div style={sectionStyle}>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <MiniInfo icon={Clock} label="Experiência" value={candidato.experiencia} />
                            <MiniInfo icon={DollarSign} label="Pretensão" value={candidato.pretensaoSalarial} />
                            <MiniInfo icon={Shield} label="Disponibilidade" value={candidato.disponibilidade} />
                            <MiniInfo icon={Briefcase} label="Candidaturas" value={String(candidato.candidaturas)} />
                        </div>
                    </div>

                    {/* Habilidades */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Shield style={{ width: 16, height: 16, color: '#2AB9C0' }} />
                            <h3 style={{ ...sectionTitleStyle, fontSize: '0.88rem' }}>Habilidades</h3>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {candidato.habilidades.map(h => (
                                <span key={h} style={{
                                    padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600,
                                    background: '#09355F0a', color: '#09355F', border: '1px solid #09355F14',
                                }}>
                                    {h}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Idiomas */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Languages style={{ width: 16, height: 16, color: '#FBBF53' }} />
                            <h3 style={{ ...sectionTitleStyle, fontSize: '0.88rem' }}>Idiomas</h3>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {candidato.idiomas.map(i => (
                                <div key={i.idioma}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#09355F' }}>{i.idioma}</span>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{i.nivel}</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f0f4f8', borderRadius: 9999, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: getNivelIdiomaWidth(i.nivel), background: 'linear-gradient(90deg, #2AB9C0, #09355F)', borderRadius: 9999, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Conteúdo principal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Bio */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <User style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                            <h2 style={sectionTitleStyle}>Sobre</h2>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>{candidato.bio}</p>
                        </div>
                    </div>

                    {/* Experiência Profissional */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Briefcase style={{ width: 18, height: 18, color: '#FE8341' }} />
                            <h2 style={sectionTitleStyle}>Experiência Profissional</h2>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {candidato.experiencias.map((exp, i) => (
                                <div key={exp.id} style={{
                                    paddingBottom: i < candidato.experiencias.length - 1 ? '1.25rem' : 0,
                                    marginBottom: i < candidato.experiencias.length - 1 ? '1.25rem' : 0,
                                    borderBottom: i < candidato.experiencias.length - 1 ? '1px solid #f0f4f8' : 'none',
                                    position: 'relative', paddingLeft: '1.75rem',
                                }}>
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%',
                                        background: exp.atual ? '#2AB9C0' : '#e8edf5', border: exp.atual ? '2px solid #2AB9C014' : '2px solid #d1d5db',
                                    }} />
                                    {i < candidato.experiencias.length - 1 && (
                                        <div style={{ position: 'absolute', left: 4, top: 18, width: 2, bottom: 0, background: '#e8edf5' }} />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09355F', margin: 0 }}>{exp.cargo}</h3>
                                        {exp.atual && (
                                            <span style={{ padding: '1px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700, background: '#e8f5e9', color: '#2e7d32' }}>
                                                Atual
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: '#2AB9C0', fontWeight: 600, margin: '0 0 0.15rem' }}>{exp.empresa}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar style={{ width: 11, height: 11 }} /> {exp.periodo}
                                    </p>
                                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{exp.descricao}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formação Acadêmica */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <GraduationCap style={{ width: 18, height: 18, color: '#FBBF53' }} />
                            <h2 style={sectionTitleStyle}>Formação Acadêmica</h2>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {candidato.formacoes.map((f, i) => (
                                <div key={f.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                    paddingBottom: i < candidato.formacoes.length - 1 ? '1rem' : 0,
                                    marginBottom: i < candidato.formacoes.length - 1 ? '1rem' : 0,
                                    borderBottom: i < candidato.formacoes.length - 1 ? '1px solid #f0f4f8' : 'none',
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: f.tipo === 'Certificação' ? '#FE834114' : '#FBBF5314',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <GraduationCap style={{ width: 18, height: 18, color: f.tipo === 'Certificação' ? '#FE8341' : '#FBBF53' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#09355F', margin: '0 0 0.15rem' }}>{f.curso}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.15rem' }}>{f.instituicao}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{f.periodo}</span>
                                            <span style={{
                                                padding: '1px 8px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 600,
                                                background: f.tipo === 'Certificação' ? '#FE834114' : '#09355F0a', color: f.tipo === 'Certificação' ? '#FE8341' : '#09355F',
                                            }}>
                                                {f.tipo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Candidaturas */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <Briefcase style={{ width: 18, height: 18, color: '#09355F' }} />
                            <h2 style={sectionTitleStyle}>Candidaturas Recentes</h2>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                <thead>
                                    <tr style={{ background: '#fafbfd' }}>
                                        {['Vaga', 'Empresa', 'Data', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidato.candidaturasDetalhes.map((c, i) => {
                                        const statusStyle = getStatusCandidaturaColor(c.status)
                                        return (
                                            <tr key={i} style={{ borderBottom: i < candidato.candidaturasDetalhes.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                                <td style={{ padding: '0.875rem 1.5rem', fontWeight: 600, color: '#09355F' }}>{c.vaga}</td>
                                                <td style={{ padding: '0.875rem 1.5rem', color: '#475569' }}>{c.empresa}</td>
                                                <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{c.data}</td>
                                                <td style={{ padding: '0.875rem 1.5rem' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
                                                        background: statusStyle.bg, color: statusStyle.color,
                                                    }}>
                                                        {statusStyle.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Documentos Anexados */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <FileText style={{ width: 18, height: 18, color: '#dc2626' }} />
                            <h2 style={sectionTitleStyle}>Documentos Anexados</h2>
                            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{candidato.documentos.length} arquivo(s)</span>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {candidato.documentos.map(doc => {
                                const docStyle = getDocIcon(doc.tipo)
                                return (
                                    <div key={doc.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem 1rem', borderRadius: 10, background: '#f8fafc',
                                        border: '1px solid #e8edf5', transition: 'background 0.18s',
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 8,
                                            background: `${docStyle.color}14`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 900, color: docStyle.color, flexShrink: 0,
                                        }}>
                                            {docStyle.label}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nome}</p>
                                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{doc.tamanho} · Enviado em {doc.dataUpload}</p>
                                        </div>
                                        <button style={{
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                            background: 'none', border: '1.5px solid #e8edf5', color: '#2AB9C0', cursor: 'pointer',
                                            transition: 'border-color 0.18s',
                                        }}>
                                            <Download style={{ width: 12, height: 12 }} /> Baixar
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Componentes auxiliares ──
function InfoRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
            <Icon style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0, marginTop: 2 }} />
            <span style={{ wordBreak: 'break-word' }}>{label}</span>
        </div>
    )
}

function MiniInfo({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                <Icon style={{ width: 14, height: 14 }} /> {label}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09355F' }}>{value}</span>
        </div>
    )
}

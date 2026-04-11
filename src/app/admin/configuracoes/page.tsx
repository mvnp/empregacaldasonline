'use client'

import { useState, useEffect } from 'react'
import {
    Building2, Mail, CreditCard, Shield, ClipboardCheck, Bell,
    Globe, FileText, Save, Eye, EyeOff, Plus, Trash2, ToggleLeft,
    ToggleRight, Upload, AlertTriangle, Check, ChevronRight, Cpu, ChevronDown
} from 'lucide-react'

// ── Seções do menu ──
const SECOES = [
    { id: 'portal', label: 'Portal', icon: Building2 },
    { id: 'email', label: 'E-mail & SMTP', icon: Mail },
    { id: 'planos', label: 'Planos', icon: CreditCard },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'moderacao', label: 'Moderação', icon: ClipboardCheck },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seo', label: 'SEO & Integrações', icon: Globe },
    { id: 'termos', label: 'Termos & LGPD', icon: FileText },
    { id: 'openai', label: 'Open AI Setup', icon: Cpu },
]

// ── Estilos compartilhados ──
const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5',
    overflow: 'hidden', marginBottom: '1.25rem',
}
const cardHeaderStyle: React.CSSProperties = {
    padding: '1rem 1.5rem', borderBottom: '1.5px solid #e8edf5',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
}
const cardTitleStyle: React.CSSProperties = {
    fontSize: '0.95rem', fontWeight: 800, color: '#09355F', margin: 0,
}
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#09355F',
    marginBottom: '0.35rem',
}
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: 10,
    border: '1.5px solid #e8edf5', fontSize: '0.84rem', color: '#374151',
    outline: 'none', transition: 'border-color 0.2s', background: '#fafbfd',
}
const textareaStyle: React.CSSProperties = {
    ...inputStyle, minHeight: 80, resize: 'vertical' as const, fontFamily: 'inherit',
}
const hintStyle: React.CSSProperties = {
    fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem',
}
const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
    background: 'linear-gradient(135deg, #09355F, #0a4a80)', color: '#fff',
    border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
}
const btnSecondary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
    background: '#f0f2f5', color: '#64748b', border: '1.5px solid #e8edf5',
    cursor: 'pointer', transition: 'all 0.2s',
}

// ── Toggle componente ──
function Toggle({ ativo, label, desc }: { ativo: boolean; label: string; desc?: string }) {
    const [on, setOn] = useState(ativo)
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f0f4f8' }}>
            <div>
                <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#09355F', margin: 0 }}>{label}</p>
                {desc && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>{desc}</p>}
            </div>
            <button onClick={() => setOn(!on)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {on ? <ToggleRight style={{ width: 32, height: 32, color: '#2AB9C0' }} /> : <ToggleLeft style={{ width: 32, height: 32, color: '#cbd5e1' }} />}
            </button>
        </div>
    )
}

// ── Seção: Portal ──
function SecaoPortal() {
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Building2 style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Informações do Portal</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>Nome do Portal</label>
                            <input type="text" defaultValue="PortalJobs" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>URL Base</label>
                            <input type="text" defaultValue="https://portaljobs.com.br" style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Descrição</label>
                            <textarea defaultValue="O melhor portal de empregos do Brasil. Conectamos talentos às melhores oportunidades do mercado." style={textareaStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Fuso Horário</label>
                            <select style={inputStyle} defaultValue="America/Sao_Paulo">
                                <option value="America/Sao_Paulo">América/São Paulo (BRT)</option>
                                <option value="America/Manaus">América/Manaus (AMT)</option>
                                <option value="America/Belem">América/Belém (BRT)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Idioma Padrão</label>
                            <select style={inputStyle} defaultValue="pt-BR">
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en">English</option>
                                <option value="es">Español</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Upload style={{ width: 18, height: 18, color: '#FE8341' }} />
                    <h2 style={cardTitleStyle}>Logo & Favicon</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '2rem' }} className="admin-cards-grid">
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Logo Principal</label>
                        <div style={{
                            border: '2px dashed #e8edf5', borderRadius: 12, padding: '2rem',
                            textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                        }}>
                            <Upload style={{ width: 28, height: 28, color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Arraste ou clique para enviar</p>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>PNG, SVG – Máx. 2MB</p>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Favicon</label>
                        <div style={{
                            border: '2px dashed #e8edf5', borderRadius: 12, padding: '2rem',
                            textAlign: 'center', cursor: 'pointer',
                        }}>
                            <Upload style={{ width: 28, height: 28, color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Arraste ou clique para enviar</p>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>ICO, PNG – 32x32px</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Seção: E-mail & SMTP ──
function SecaoEmail() {
    const [showPass, setShowPass] = useState(false)
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Mail style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Configuração SMTP</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>Servidor SMTP</label>
                            <input type="text" defaultValue="smtp.gmail.com" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Porta</label>
                            <input type="number" defaultValue="587" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Usuário</label>
                            <input type="email" defaultValue="noreply@portaljobs.com.br" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPass ? 'text' : 'password'} defaultValue="••••••••••" style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {showPass ? <EyeOff style={{ width: 16, height: 16, color: '#94a3b8' }} /> : <Eye style={{ width: 16, height: 16, color: '#94a3b8' }} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Criptografia</label>
                            <select style={inputStyle} defaultValue="tls">
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="none">Nenhuma</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>E-mail Remetente</label>
                            <input type="email" defaultValue="noreply@portaljobs.com.br" style={inputStyle} />
                            <p style={hintStyle}>Nome exibido nos e-mails enviados</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <button style={btnSecondary}>
                            <Mail style={{ width: 14, height: 14 }} /> Enviar E-mail de Teste
                        </button>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <FileText style={{ width: 18, height: 18, color: '#FBBF53' }} />
                    <h2 style={cardTitleStyle}>Templates de E-mail</h2>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    {['Boas-vindas ao Candidato', 'Boas-vindas à Empresa', 'Nova Candidatura Recebida', 'Vaga Prestes a Expirar', 'Confirmação de Cadastro', 'Redefinição de Senha'].map((t, i) => (
                        <div key={t} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.85rem 1.5rem',
                            borderBottom: i < 5 ? '1px solid #f0f4f8' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2AB9C0' }} />
                                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#09355F' }}>{t}</span>
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: '#2AB9C0', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Editar <ChevronRight style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

// ── Seção: Planos ──
function SecaoPlanos() {
    const planos = [
        { nome: 'Gratuito', preco: 'R$ 0', cor: '#94a3b8', vagas: 2, destaque: false, recursos: ['2 vagas ativas', 'Painel básico', 'Suporte por e-mail'] },
        { nome: 'Profissional', preco: 'R$ 149/mês', cor: '#2AB9C0', vagas: 15, destaque: false, recursos: ['15 vagas ativas', 'Relatórios avançados', 'Destaque nas buscas', 'Suporte prioritário'] },
        { nome: 'Enterprise', preco: 'R$ 399/mês', cor: '#FE8341', vagas: -1, destaque: true, recursos: ['Vagas ilimitadas', 'API de integração', 'Relatórios customizados', 'Gerente de conta dedicado', 'SLA garantido'] },
    ]

    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <CreditCard style={{ width: 18, height: 18, color: '#FBBF53' }} />
                <h2 style={cardTitleStyle}>Planos de Empresa</h2>
                <button style={{ ...btnSecondary, marginLeft: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                    <Plus style={{ width: 13, height: 13 }} /> Novo Plano
                </button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="admin-cards-grid">
                    {planos.map(p => (
                        <div key={p.nome} style={{
                            borderRadius: 14, padding: '1.5rem',
                            border: p.destaque ? `2px solid ${p.cor}` : '1.5px solid #e8edf5',
                            background: p.destaque ? `${p.cor}08` : '#fafbfd',
                            position: 'relative',
                        }}>
                            {p.destaque && (
                                <span style={{
                                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                                    padding: '2px 12px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700,
                                    background: p.cor, color: '#fff',
                                }}>Popular</span>
                            )}
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: p.cor, margin: '0 0 0.25rem' }}>{p.nome}</h3>
                            <p style={{ fontSize: '1.3rem', fontWeight: 900, color: '#09355F', margin: '0 0 1rem' }}>{p.preco}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                {p.recursos.map(r => (
                                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                                        <Check style={{ width: 14, height: 14, color: p.cor }} /> {r}
                                    </div>
                                ))}
                            </div>
                            <button style={{ ...btnSecondary, width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.5rem' }}>
                                Editar Plano
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Seção: Segurança ──
function SecaoSeguranca() {
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Shield style={{ width: 18, height: 18, color: '#dc2626' }} />
                    <h2 style={cardTitleStyle}>Autenticação</h2>
                </div>
                <div style={{ padding: '1rem 1.5rem' }}>
                    <Toggle ativo={false} label="Autenticação de Dois Fatores (2FA)" desc="Exigir 2FA para todos os administradores" />
                    <Toggle ativo={true} label="Verificação de E-mail" desc="Exigir verificação de e-mail no cadastro" />
                    <Toggle ativo={false} label="Login com Google" desc="Permitir login via conta Google" />
                    <Toggle ativo={false} label="Login com LinkedIn" desc="Permitir login via conta LinkedIn" />
                </div>
            </div>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Shield style={{ width: 18, height: 18, color: '#FBBF53' }} />
                    <h2 style={cardTitleStyle}>Política de Senhas</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>Tamanho Mínimo</label>
                            <input type="number" defaultValue="8" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Expiração da Sessão (horas)</label>
                            <input type="number" defaultValue="24" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tentativas de Login (antes do bloqueio)</label>
                            <input type="number" defaultValue="5" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tempo de Bloqueio (minutos)</label>
                            <input type="number" defaultValue="30" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <Toggle ativo={true} label="Exigir letra maiúscula" />
                        <Toggle ativo={true} label="Exigir número" />
                        <Toggle ativo={false} label="Exigir caractere especial" />
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Seção: Moderação ──
function SecaoModeracao() {
    const [palavras, setPalavras] = useState(['spam', 'fraude', 'pirâmide', 'esquema'])
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <ClipboardCheck style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Aprovação de Conteúdo</h2>
                </div>
                <div style={{ padding: '1rem 1.5rem' }}>
                    <Toggle ativo={false} label="Aprovar vagas automaticamente" desc="Vagas serão publicadas sem revisão manual" />
                    <Toggle ativo={true} label="Aprovar empresas automaticamente" desc="Empresas podem publicar vagas imediatamente após cadastro" />
                    <Toggle ativo={true} label="Permitir candidaturas sem currículo completo" desc="Candidatos podem se aplicar sem preencher todo o currículo" />
                    <Toggle ativo={false} label="Revisão de conteúdo por IA" desc="Usar IA para detectar conteúdo inadequado em vagas" />
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <AlertTriangle style={{ width: 18, height: 18, color: '#dc2626' }} />
                    <h2 style={cardTitleStyle}>Palavras Bloqueadas</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>Vagas contendo estas palavras serão automaticamente bloqueadas para revisão.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                        {palavras.map(p => (
                            <span key={p} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '4px 10px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600,
                                background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2',
                            }}>
                                {p}
                                <button onClick={() => setPalavras(palavras.filter(x => x !== p))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    <Trash2 style={{ width: 11, height: 11, color: '#c62828' }} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="Adicionar palavra..." style={{ ...inputStyle, flex: 1 }} />
                        <button style={{ ...btnSecondary, whiteSpace: 'nowrap' }}>
                            <Plus style={{ width: 13, height: 13 }} /> Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Seção: Notificações ──
function SecaoNotificacoes() {
    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <Bell style={{ width: 18, height: 18, color: '#FBBF53' }} />
                <h2 style={cardTitleStyle}>Notificações por E-mail</h2>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>Para Administradores</h3>
                <Toggle ativo={true} label="Nova empresa cadastrada" desc="Receber notificação quando uma empresa se cadastrar" />
                <Toggle ativo={true} label="Nova vaga publicada" desc="Receber notificação quando vagas forem publicadas" />
                <Toggle ativo={false} label="Vaga expirada" desc="Aviso quando uma vaga atingir a data de expiração" />
                <Toggle ativo={true} label="Relatório semanal" desc="Resumo semanal com métricas do portal" />

                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>Para Empresas</h3>
                <Toggle ativo={true} label="Nova candidatura recebida" desc="Empresa recebe e-mail quando houver nova candidatura" />
                <Toggle ativo={true} label="Vaga prestes a expirar" desc="Aviso 3 dias antes da expiração" />
                <Toggle ativo={false} label="Resumo semanal de candidaturas" desc="Resumo semanal das candidaturas recebidas" />

                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>Para Candidatos</h3>
                <Toggle ativo={true} label="Candidatura confirmada" desc="Confirmação quando o candidato se aplicar a uma vaga" />
                <Toggle ativo={true} label="Status da candidatura alterado" desc="Aviso quando o status mudar (aprovado, recusado, entrevista)" />
                <Toggle ativo={false} label="Novas vagas no perfil" desc="Sugestão de vagas compatíveis com o perfil" />
            </div>
        </div>
    )
}

// ── Seção: SEO & Integrações ──
function SecaoSEO() {
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Globe style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>SEO & Meta Tags</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Título da Página (Title Tag)</label>
                            <input type="text" defaultValue="PortalJobs | Encontre sua vaga ideal" style={inputStyle} />
                            <p style={hintStyle}>Recomendado: 50-60 caracteres</p>
                        </div>
                        <div>
                            <label style={labelStyle}>Meta Description</label>
                            <textarea defaultValue="Portal de empregos líder no Brasil. Milhares de vagas nas melhores empresas. Cadastre seu currículo gratuitamente." style={textareaStyle} />
                            <p style={hintStyle}>Recomendado: 150-160 caracteres</p>
                        </div>
                        <div>
                            <label style={labelStyle}>Palavras-chave</label>
                            <input type="text" defaultValue="empregos, vagas, trabalho, currículo, carreiras" style={inputStyle} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Globe style={{ width: 18, height: 18, color: '#FE8341' }} />
                    <h2 style={cardTitleStyle}>Integrações</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>Google Analytics ID</label>
                            <input type="text" defaultValue="G-XXXXXXXXXX" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Google Tag Manager</label>
                            <input type="text" defaultValue="GTM-XXXXXXX" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Facebook Pixel ID</label>
                            <input type="text" placeholder="ID do Pixel" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Webhook URL (Candidaturas)</label>
                            <input type="text" placeholder="https://..." style={inputStyle} />
                            <p style={hintStyle}>Enviar notificação via webhook quando houver nova candidatura</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <Toggle ativo={false} label="Integração com LinkedIn Jobs" desc="Publicar vagas automaticamente no LinkedIn" />
                        <Toggle ativo={false} label="Integração com Indeed" desc="Publicar vagas automaticamente no Indeed" />
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Seção: Termos & LGPD ──
function SecaoTermos() {
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <FileText style={{ width: 18, height: 18, color: '#09355F' }} />
                    <h2 style={cardTitleStyle}>Termos de Uso</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <label style={labelStyle}>Conteúdo dos Termos de Uso</label>
                    <textarea
                        defaultValue="1. ACEITAÇÃO DOS TERMOS&#10;&#10;Ao utilizar o PortalJobs, você concorda com estes Termos de Uso. Se você não concordar com algum destes termos, não utilize nosso serviço.&#10;&#10;2. DESCRIÇÃO DO SERVIÇO&#10;&#10;O PortalJobs é uma plataforma online que conecta candidatos a empresas que estão contratando..."
                        style={{ ...textareaStyle, minHeight: 180, fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                    <p style={hintStyle}>Última atualização: 01/01/2026</p>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Shield style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Privacidade & LGPD</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <label style={labelStyle}>Política de Privacidade</label>
                    <textarea
                        defaultValue="A sua privacidade é importante para nós. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD)..."
                        style={{ ...textareaStyle, minHeight: 140 }}
                    />
                    <div style={{ marginTop: '1rem' }}>
                        <Toggle ativo={true} label="Banner de Cookies" desc="Exibir banner de consentimento de cookies para visitantes" />
                        <Toggle ativo={true} label="Consentimento explícito de dados" desc="Solicitar consentimento antes de coletar dados pessoais" />
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={labelStyle}>Retenção de Dados (dias)</label>
                            <div style={{ display: 'flex', gap: '1rem', maxWidth: 400 }} className="admin-cards-grid">
                                <div style={{ flex: 1 }}>
                                    <input type="number" defaultValue="365" style={inputStyle} />
                                    <p style={hintStyle}>Candidatos inativos</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="number" defaultValue="730" style={inputStyle} />
                                    <p style={hintStyle}>Dados de candidaturas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const AI_MODELS = [
    { id: 'gpt-5-nano', name: 'GPT-5 nano', desc: 'Mais barato de todos os modelos', tier: 'Budget', in: 0.05, out: 0.40, vision: true },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 nano', desc: 'Classificação e extração em alta escala', tier: 'Budget', in: 0.10, out: 0.40, vision: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', desc: 'Rápido e acessível para tarefas leves', tier: 'Budget', in: 0.15, out: 0.60, vision: true },
    { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', desc: 'Mais barato da família 5.4', tier: 'Budget', in: 0.20, out: 1.25, vision: false },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', desc: 'Custo-eficiente da série 5', tier: 'Mid-range', in: 0.25, out: 2.00, vision: true },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', desc: 'Versão menor e mais rápida do 4.1', tier: 'Mid-range', in: 0.40, out: 1.60, vision: true },
    { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', desc: 'Mini da família 5.4', tier: 'Budget', in: 0.75, out: 4.50, vision: false },
    { id: 'o3-mini', name: 'o3-mini', desc: 'Raciocínio com menor custo que o3', tier: 'Reasoning', in: 1.10, out: 4.40, vision: false },
    { id: 'o4-mini', name: 'o4-mini', desc: 'Raciocínio compacto, forte em STEM', tier: 'Reasoning', in: 1.10, out: 4.40, vision: true },
    { id: 'gpt-5.1', name: 'GPT-5.1', desc: 'Contexto de 400K tokens', tier: 'Premium', in: 1.25, out: 10.00, vision: true },
    { id: 'gpt-5', name: 'GPT-5', desc: 'Flagship com contexto de 1M tokens', tier: 'Premium', in: 1.25, out: 10.00, vision: true },
    { id: 'gpt-5.2', name: 'GPT-5.2', desc: 'Raciocínio avançado e multimodal', tier: 'Premium', in: 1.75, out: 14.00, vision: true },
    { id: 'gpt-5.3', name: 'GPT-5.3', desc: 'Alta capacidade, melhorias em raciocínio', tier: 'Premium', in: 1.75, out: 14.00, vision: true },
    { id: 'gpt-4.1', name: 'GPT-4.1', desc: 'Contexto de 1M token, forte em instruções', tier: 'Premium', in: 2.00, out: 8.00, vision: true },
    { id: 'o3', name: 'o3', desc: 'Melhor modelo de raciocínio disponível', tier: 'Reasoning', in: 2.00, out: 8.00, vision: true },
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'Multimodal: texto, visão e áudio', tier: 'Premium', in: 2.50, out: 10.00, vision: true },
    { id: 'gpt-5.4', name: 'GPT-5.4', desc: 'Mais capaz da família 5.4', tier: 'Premium', in: 2.50, out: 15.00, vision: true },
    { id: 'gpt-5-pro', name: 'GPT-5 Pro', desc: 'Enterprise com raciocínio estendido', tier: 'Premium', in: 15.00, out: 120.00, vision: true },
    { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', desc: 'Enterprise com raciocínio estendido', tier: 'Premium', in: 21.00, out: 168.00, vision: true },
    { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro', desc: 'Versão enterprise com raciocínio estendido', tier: 'Premium', in: 30.00, out: 180.00, vision: true },
];

const getTierStyles = (tier: string) => {
    switch(tier) {
        case 'Premium': return { bg: '#dbeafe', color: '#1d4ed8' };
        case 'Reasoning': return { bg: '#f3e8ff', color: '#7e22ce' };
        case 'Mid-range': return { bg: '#dcfce7', color: '#15803d' };
        case 'Budget': 
        default: return { bg: '#f1f5f9', color: '#475569' };
    }
}

function ModelSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const selected = AI_MODELS.find(m => m.id === value) || AI_MODELS[0];
    const sTier = getTierStyles(selected.tier);

    return (
        <div style={{ position: 'relative', width: '100%', zIndex: open ? 50 : 1 }}>
            <div 
                onClick={() => setOpen(!open)}
                style={{
                    ...inputStyle, 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    cursor: 'pointer', background: '#fff',
                    borderColor: open ? '#2AB9C0' : '#e8edf5',
                    boxShadow: open ? '0 0 0 3px rgba(42, 185, 192, 0.15)' : 'none',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: '#09355F' }}>{selected.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: 8 }}>
                        Input: <strong style={{ color: '#09355F' }}>${selected.in.toFixed(2)}</strong> <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> Output: <strong style={{ color: '#09355F' }}>${selected.out.toFixed(2)}</strong>
                    </span>
                    <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: sTier.bg, color: sTier.color
                    }}>
                        {selected.tier}
                    </span>
                </div>
                <ChevronDown style={{ width: 18, height: 18, color: open ? '#2AB9C0' : '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
            </div>

            {open && (
                <>
                    <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); }} 
                    />
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0, 
                        background: '#fff', borderRadius: 14, border: '1px solid #e8edf5', 
                        boxShadow: '0 12px 32px rgba(9, 53, 95, 0.12)', zIndex: 10,
                        maxHeight: '400px', overflowY: 'auto'
                    }}>
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: 'minmax(220px, 2.5fr) 100px 100px 100px 80px', 
                            padding: '0.85rem 1.25rem', borderBottom: '2px solid #f1f5f9',
                            fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
                            position: 'sticky', top: 0, background: '#fdfdfe', zIndex: 2
                        }}>
                            <div>Modelo</div>
                            <div>Tier</div>
                            <div>Input /1M</div>
                            <div>Output /1M</div>
                            <div style={{ textAlign: 'center' }}>Visão</div>
                        </div>

                        {AI_MODELS.map(m => {
                            const tStyles = getTierStyles(m.tier);
                            return (
                                <div 
                                    key={m.id}
                                    onClick={() => { onChange(m.id); setOpen(false); }}
                                    style={{
                                        display: 'grid', gridTemplateColumns: 'minmax(220px, 2.5fr) 100px 100px 100px 80px', alignItems: 'center',
                                        padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        background: value === m.id ? '#f0f9ff' : '#fff'
                                    }}
                                    onMouseEnter={e => {
                                        if (value !== m.id) e.currentTarget.style.background = '#f8fafc'
                                    }}
                                    onMouseLeave={e => {
                                        if (value !== m.id) e.currentTarget.style.background = '#fff'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#09355F', fontSize: '0.9rem', marginBottom: '0.15rem' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.desc}</div>
                                    </div>
                                    <div>
                                        <span style={{ 
                                            display: 'inline-block',
                                            padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                            background: tStyles.bg, color: tStyles.color
                                        }}>
                                            {m.tier}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                        ${m.in.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                        ${m.out.toFixed(2)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {m.vision ? <Check style={{ width: 16, height: 16, color: '#10b981' }} /> : <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 700 }}>—</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Seção: Open AI Setup ──
function SecaoOpenAI() {
    const [apiKey, setApiKey] = useState('')
    const [model, setModel] = useState('gpt-4o')
    const [title, setTitle] = useState('Leitor de Vagas (IA)')
    const [prompt, setPrompt] = useState('Extraia as informações desta imagem de anúncio de vaga de emprego e retorne um objeto JSON com as seguintes chaves: "titulo" (Título da Vaga) e "descricao" (Descrição da Vaga contendo responsabilidades, requisitos, etc.). Em caso de indisponibilidade não preencha.')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        import('@/actions/openai').then((mod) => {
            mod.lerConfiguracaoOpenAI().then((config) => {
                if (config) {
                    setApiKey(config.openai_token)
                    setModel(config.model)
                    if (config.title) setTitle(config.title)
                    if (config.prompt) setPrompt(config.prompt)
                }
                setLoading(false)
            })
        })
    }, [])

    const saveSettings = async () => {
        setSaving(true)
        setMsg('')
        const { salvarConfiguracaoOpenAI } = await import('@/actions/openai')
        const result = await salvarConfiguracaoOpenAI({ openai_token: apiKey, model, title, prompt })
        setSaving(false)

        if (result.success) {
            setMsg('Configurações salvas de forma segura no banco de dados!')
            setTimeout(() => setMsg(''), 3000)
        } else {
            setMsg('Erro ao salvar: ' + result.error)
        }
    }

    if (loading) {
        return (
            <div style={cardStyle}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Carregando configurações da IA...</div>
            </div>
        )
    }

    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <Cpu style={{ width: 18, height: 18, color: '#10a37f' }} />
                <h2 style={cardTitleStyle}>Integração Open AI</h2>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="admin-cards-grid">
                    <div>
                        <label style={labelStyle}>API Key da Open AI</label>
                        <input 
                            type="password" 
                            value={apiKey} 
                            onChange={e => setApiKey(e.target.value)} 
                            style={inputStyle} 
                            placeholder="sk-..." 
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Modelo</label>
                        <ModelSelect value={model} onChange={setModel} />
                    </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="admin-cards-grid">
                    <div>
                        <label style={labelStyle}>Título da Tarefa</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            style={inputStyle} 
                            placeholder="Ex: Leitura de Empregos Varejo..." 
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Prompt Base (Instruções para a IA)</label>
                        <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            style={{ ...textareaStyle, minHeight: 100 }} 
                            placeholder="Descreva exatamente o que a IA deve procurar no arquivo e o formato esperado (JSON)." 
                        />
                    </div>
                </div>
                
                {msg && (
                    <div style={{ 
                        marginTop: '1rem', padding: '0.75rem', borderRadius: 8, fontSize: '0.82rem',
                        background: msg.includes('Erro') ? '#fef2f2' : '#f0fdf4', 
                        color: msg.includes('Erro') ? '#dc2626' : '#166534',
                        border: `1px solid ${msg.includes('Erro') ? '#fecaca' : '#bbf7d0'}`
                    }}>
                        {msg}
                    </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                    <button style={btnSecondary} onClick={saveSettings} disabled={saving}>
                        <Save style={{ width: 14, height: 14 }} /> {saving ? 'Salvando...' : 'Salvar no Banco de Dados'}
                    </button>
                    <p style={hintStyle}>
                        A chave da API fica protegida no banco de dados para uso na leitura de imagens ao cadastrar vagas.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── Componente principal ──
export default function ConfiguracoesPage() {
    const [secaoAtiva, setSecaoAtiva] = useState('portal')
    const [salvo, setSalvo] = useState(false)

    const renderSecao = () => {
        switch (secaoAtiva) {
            case 'portal': return <SecaoPortal />
            case 'email': return <SecaoEmail />
            case 'planos': return <SecaoPlanos />
            case 'seguranca': return <SecaoSeguranca />
            case 'moderacao': return <SecaoModeracao />
            case 'notificacoes': return <SecaoNotificacoes />
            case 'seo': return <SecaoSEO />
            case 'termos': return <SecaoTermos />
            case 'openai': return <SecaoOpenAI />
            default: return <SecaoPortal />
        }
    }

    const handleSalvar = () => {
        setSalvo(true)
        setTimeout(() => setSalvo(false), 2500)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#09355F', margin: '0 0 0.15rem' }}>Configurações</h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Gerencie todas as configurações do portal</p>
                </div>
                <button onClick={handleSalvar} style={btnPrimary}>
                    {salvo ? <Check style={{ width: 15, height: 15 }} /> : <Save style={{ width: 15, height: 15 }} />}
                    {salvo ? 'Salvo!' : 'Salvar Alterações'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">
                {/* Sidebar menu */}
                <div style={{
                    ...cardStyle, marginBottom: 0, position: 'sticky', top: '1rem',
                }}>
                    <div style={{ padding: '0.5rem' }}>
                        {SECOES.map(s => {
                            const Icon = s.icon
                            const ativo = secaoAtiva === s.id
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSecaoAtiva(s.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                                        padding: '0.7rem 1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                                        border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                        background: ativo ? '#09355F0a' : 'transparent',
                                        color: ativo ? '#09355F' : '#64748b',
                                    }}
                                >
                                    <Icon style={{ width: 16, height: 16, color: ativo ? '#2AB9C0' : '#94a3b8' }} />
                                    {s.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Conteúdo da seção */}
                <div>{renderSecao()}</div>
            </div>
        </div>
    )
}

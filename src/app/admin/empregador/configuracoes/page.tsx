'use client'

import { useState } from 'react'
import {
    Building2, Bell, Shield, CreditCard, Save, Check, Eye, EyeOff,
    ToggleLeft, ToggleRight, Upload, Globe, Linkedin, MapPin, FileText,
    Mail, Phone, ChevronRight, Briefcase, Users, Calendar
} from 'lucide-react'

const SECOES = [
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'plano', label: 'Meu Plano', icon: CreditCard },
]

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
    outline: 'none', background: '#fafbfd',
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
    border: 'none', cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
    background: '#f0f2f5', color: '#64748b', border: '1.5px solid #e8edf5', cursor: 'pointer',
}

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

// ── Empresa ──
function SecaoEmpresa() {
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Building2 style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Dados da Empresa</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>Nome da Empresa</label>
                            <input type="text" defaultValue="TechBrasil Ltda." style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>CNPJ</label>
                            <input type="text" defaultValue="11.103.207/0001-11" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Setor/Indústria</label>
                            <select style={inputStyle} defaultValue="tecnologia">
                                <option value="tecnologia">Tecnologia</option>
                                <option value="saude">Saúde</option>
                                <option value="financeiro">Financeiro</option>
                                <option value="educacao">Educação</option>
                                <option value="varejo">Varejo</option>
                                <option value="industria">Indústria</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Número de Funcionários</label>
                            <select style={inputStyle} defaultValue="1-10">
                                <option value="1-10">1–10</option>
                                <option value="11-50">11–50</option>
                                <option value="51-200">51–200</option>
                                <option value="201-500">201–500</option>
                                <option value="500+">500+</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Descrição da Empresa</label>
                            <textarea defaultValue="Somos uma empresa líder em soluções digitais, comprometida em transformar o mercado brasileiro de tecnologia com inovação e excelência." style={textareaStyle} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <MapPin style={{ width: 18, height: 18, color: '#FE8341' }} />
                    <h2 style={cardTitleStyle}>Endereço e Contato</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="admin-cards-grid">
                        <div>
                            <label style={labelStyle}>E-mail Corporativo</label>
                            <input type="email" defaultValue="rh@techbrasilltda.com.br" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone</label>
                            <input type="tel" defaultValue="(12) 3001-4002" style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Endereço</label>
                            <input type="text" defaultValue="Av. Brasil, 111 – Jardins, São Paulo, SP" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Website</label>
                            <input type="url" defaultValue="https://techbrasilltda.com.br" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>LinkedIn</label>
                            <input type="url" defaultValue="https://linkedin.com/company/techbrasil" style={inputStyle} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Upload style={{ width: 18, height: 18, color: '#FBBF53' }} />
                    <h2 style={cardTitleStyle}>Logo da Empresa</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{
                        border: '2px dashed #e8edf5', borderRadius: 12, padding: '2.5rem',
                        textAlign: 'center', cursor: 'pointer',
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16, margin: '0 auto 0.75rem',
                            background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Building2 style={{ width: 28, height: 28, color: '#fff' }} />
                        </div>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 0.2rem' }}>Arraste ou clique para alterar o logo</p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>PNG, JPG, SVG – Máx. 2MB – Recomendado: 200x200px</p>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Notificações ──
function SecaoNotificacoes() {
    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <Bell style={{ width: 18, height: 18, color: '#FBBF53' }} />
                <h2 style={cardTitleStyle}>Preferências de Notificação</h2>
            </div>
            <div style={{ padding: '1rem 1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>Candidaturas</h3>
                <Toggle ativo={true} label="Nova candidatura recebida" desc="Receber e-mail quando um candidato se aplicar a uma vaga" />
                <Toggle ativo={true} label="Candidato visualizou a vaga" desc="Saber quando candidatos visualizam suas vagas" />
                <Toggle ativo={false} label="Resumo diário de candidaturas" desc="Receber um resumo diário por e-mail" />
                <Toggle ativo={true} label="Resumo semanal" desc="Resumo semanal com métricas das suas vagas" />

                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>Vagas</h3>
                <Toggle ativo={true} label="Vaga prestes a expirar" desc="Aviso 3 dias antes da data de expiração" />
                <Toggle ativo={true} label="Vaga expirada" desc="Notificação quando uma vaga expirar" />
                <Toggle ativo={false} label="Sugestões de melhoria na vaga" desc="Dicas para melhorar a descrição e atrair mais candidatos" />

                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>Sistema</h3>
                <Toggle ativo={true} label="Atualizações do portal" desc="Novidades e atualizações da plataforma" />
                <Toggle ativo={false} label="Promoções e ofertas" desc="Promoções de upgrade de plano" />
            </div>
        </div>
    )
}

// ── Segurança ──
function SecaoSeguranca() {
    const [showPass, setShowPass] = useState(false)
    return (
        <>
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Shield style={{ width: 18, height: 18, color: '#dc2626' }} />
                    <h2 style={cardTitleStyle}>Alterar Senha</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
                        <div>
                            <label style={labelStyle}>Senha Atual</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {showPass ? <EyeOff style={{ width: 16, height: 16, color: '#94a3b8' }} /> : <Eye style={{ width: 16, height: 16, color: '#94a3b8' }} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Nova Senha</label>
                            <input type="password" placeholder="••••••••" style={inputStyle} />
                            <p style={hintStyle}>Mínimo 8 caracteres, incluindo letra maiúscula e número</p>
                        </div>
                        <div>
                            <label style={labelStyle}>Confirmar Nova Senha</label>
                            <input type="password" placeholder="••••••••" style={inputStyle} />
                        </div>
                        <button style={{ ...btnPrimary, alignSelf: 'flex-start' }}>
                            <Shield style={{ width: 14, height: 14 }} /> Alterar Senha
                        </button>
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Shield style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                    <h2 style={cardTitleStyle}>Segurança da Conta</h2>
                </div>
                <div style={{ padding: '1rem 1.5rem' }}>
                    <Toggle ativo={false} label="Autenticação de Dois Fatores (2FA)" desc="Adicionar uma camada extra de segurança ao login" />
                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Sessões Ativas</h3>
                        {[
                            { device: 'Chrome – Windows 11', local: 'São Paulo, SP', data: 'Agora (sessão atual)' },
                            { device: 'Safari – iPhone 15', local: 'São Paulo, SP', data: '05/03/2026 às 14:32' },
                        ].map((s, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem 0', borderBottom: i === 0 ? '1px solid #f0f4f8' : 'none',
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F', margin: 0 }}>{s.device}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.1rem 0 0' }}>
                                        {s.local} · {s.data}
                                    </p>
                                </div>
                                {i === 0 ? (
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#16a34a', padding: '2px 8px', borderRadius: 9999, background: '#f0fdf4' }}>Atual</span>
                                ) : (
                                    <button style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Encerrar</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Plano ──
function SecaoPlano() {
    return (
        <>
            {/* Plano atual */}
            <div style={{ ...cardStyle, border: '2px solid #2AB9C0' }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #2AB9C0, #09355F)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <CreditCard style={{ width: 26, height: 26, color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', margin: 0 }}>Plano Profissional</h2>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: '#2AB9C014', color: '#2AB9C0' }}>Ativo</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>R$ 149,00/mês · Renovação em 15/04/2026</p>
                    </div>
                    <button style={{ ...btnSecondary, whiteSpace: 'nowrap' }}>
                        Gerenciar Assinatura
                    </button>
                </div>
            </div>

            {/* Uso */}
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <Briefcase style={{ width: 18, height: 18, color: '#FE8341' }} />
                    <h2 style={cardTitleStyle}>Uso do Plano</h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { label: 'Vagas Ativas', usado: 8, total: 15, color: '#2AB9C0' },
                        { label: 'Destaques Ativos', usado: 2, total: 5, color: '#FBBF53' },
                        { label: 'Buscas de Candidatos', usado: 45, total: 100, color: '#FE8341' },
                    ].map(u => (
                        <div key={u.label}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#09355F' }}>{u.label}</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: u.color }}>{u.usado}/{u.total}</span>
                            </div>
                            <div style={{ height: 8, background: '#f0f4f8', borderRadius: 9999 }}>
                                <div style={{ height: '100%', width: `${(u.usado / u.total) * 100}%`, background: u.color, borderRadius: 9999, transition: 'width 0.4s ease' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upgrade */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #FE834108, #FBBF5308)' }}>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, margin: '0 auto 0.75rem',
                        background: 'linear-gradient(135deg, #FBBF53, #FE8341)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CreditCard style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.25rem' }}>Upgrade para Enterprise</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                        Vagas ilimitadas, API de integração, gerente de conta dedicado e muito mais.
                    </p>
                    <button style={{ ...btnPrimary, background: 'linear-gradient(135deg, #FBBF53, #FE8341)' }}>
                        <CreditCard style={{ width: 14, height: 14 }} /> Ver Planos Enterprise — R$ 399/mês
                    </button>
                </div>
            </div>

            {/* Histórico de faturas */}
            <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <FileText style={{ width: 18, height: 18, color: '#09355F' }} />
                    <h2 style={cardTitleStyle}>Histórico de Faturas</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                            <tr style={{ background: '#fafbfd' }}>
                                {['Data', 'Descrição', 'Valor', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { data: '01/03/2026', desc: 'Plano Profissional – Março', valor: 'R$ 149,00', status: 'Pago' },
                                { data: '01/02/2026', desc: 'Plano Profissional – Fevereiro', valor: 'R$ 149,00', status: 'Pago' },
                                { data: '01/01/2026', desc: 'Plano Profissional – Janeiro', valor: 'R$ 149,00', status: 'Pago' },
                                { data: '01/12/2025', desc: 'Upgrade para Profissional', valor: 'R$ 149,00', status: 'Pago' },
                            ].map((f, i) => (
                                <tr key={i} style={{ borderBottom: i < 3 ? '1px solid #f0f4f8' : 'none' }}>
                                    <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{f.data}</td>
                                    <td style={{ padding: '0.875rem 1.5rem', fontWeight: 600, color: '#09355F' }}>{f.desc}</td>
                                    <td style={{ padding: '0.875rem 1.5rem', fontWeight: 700, color: '#09355F' }}>{f.valor}</td>
                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                        <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: '#e8f5e9', color: '#2e7d32' }}>{f.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default function EmpregadorConfiguracoesPage() {
    const [secaoAtiva, setSecaoAtiva] = useState('empresa')
    const [salvo, setSalvo] = useState(false)

    const renderSecao = () => {
        switch (secaoAtiva) {
            case 'empresa': return <SecaoEmpresa />
            case 'notificacoes': return <SecaoNotificacoes />
            case 'seguranca': return <SecaoSeguranca />
            case 'plano': return <SecaoPlano />
            default: return <SecaoEmpresa />
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
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Gerencie as configurações da sua empresa</p>
                </div>
                <button onClick={handleSalvar} style={btnPrimary}>
                    {salvo ? <Check style={{ width: 15, height: 15 }} /> : <Save style={{ width: 15, height: 15 }} />}
                    {salvo ? 'Salvo!' : 'Salvar Alterações'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">
                <div style={{ ...cardStyle, marginBottom: 0, position: 'sticky', top: '1rem' }}>
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

                <div>{renderSecao()}</div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import AuthPanel from '@/components/AuthPanel'
import { cadastrarCandidato } from '@/actions/auth'

const AREAS = ['Tecnologia', 'Marketing', 'Vendas', 'Saúde', 'Educação', 'Engenharia', 'Administração', 'Jurídico', 'Design', 'Outra']

// ── Máscara de telefone ────────────────────────────────────────
function mascaraTelefone(valor: string): string {
    const nums = valor.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 10) {
        // (00) 0000-0000
        return nums
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
    }
    // (00) 00000-0000
    return nums
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function CadastroCandidatoPage() {
    const [form, setForm] = useState({
        nome: '', sobrenome: '', email: '', telefone: '',
        area: 'Outra', senha: '', confirmarSenha: '',
    })
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [aceito, setAceito] = useState(true)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    function set(campo: string, valor: string) {
        setForm(f => ({ ...f, [campo]: valor }))
    }

    function handleTelefone(e: React.ChangeEvent<HTMLInputElement>) {
        set('telefone', mascaraTelefone(e.target.value))
    }

    // Senha: confirmarSenha sempre espelha a senha
    function handleSenha(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value
        setForm(f => ({ ...f, senha: v, confirmarSenha: v }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErro('')

        if (!form.nome || !form.email || !form.senha) { setErro('Preencha todos os campos obrigatórios.'); return }
        if (form.senha.length < 8) { setErro('A senha deve ter no mínimo 8 caracteres.'); return }
        if (!aceito) { setErro('Você precisa aceitar os Termos de Uso.'); return }

        setLoading(true)
        const resultado = await cadastrarCandidato({
            nome: form.nome,
            sobrenome: form.sobrenome,
            email: form.email,
            telefone: form.telefone,
            area: form.area,
            senha: form.senha,
        })

        if (!resultado.success) {
            setLoading(false)
            setErro(resultado.error || 'Erro ao criar conta.')
            return
        }

        window.location.href = resultado.redirectTo || '/admin/candidato'
    }

    if (sucesso) {
        return (
            <div className="auth-layout">
                <div className="auth-panel-left"><AuthPanel variant="candidato" /></div>
                <div className="auth-right">
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                        <div style={{ width: 68, height: 68, background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <CheckCircle2 style={{ width: 34, height: 34, color: '#10b981' }} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09355F', marginBottom: '0.5rem' }}>Conta criada!</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                            Bem-vindo, <strong style={{ color: '#09355F' }}>{form.nome}</strong>! Seu perfil foi criado com sucesso. Agora você pode explorar as vagas disponíveis.
                        </p>
                        <Link href="/vagas" className="auth-submit" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Ver vagas disponíveis →
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-layout">

            {/* ── Esquerda ── */}
            <div className="auth-panel-left">
                <AuthPanel variant="candidato" />
            </div>

            {/* ── Direita ── */}
            <div className="auth-right">
                <div className="auth-card" style={{ maxWidth: 520 }}>

                    {/* Voltar */}
                    <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
                    </Link>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 44, height: 44, background: 'rgba(42,185,192,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User style={{ width: 22, height: 22, color: '#2AB9C0' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#09355F', lineHeight: 1.2 }}>Novo Candidato</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Crie sua conta. É grátis e leva menos de 2 minutos</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Nome */}
                        <div>
                            <label className="auth-label" htmlFor="nome">Nome *</label>
                            <input id="nome" type="text" className="auth-input" placeholder="João" value={form.nome} onChange={e => set('nome', e.target.value)} />
                        </div>

                        {/* Sobrenome */}
                        <div>
                            <label className="auth-label" htmlFor="sobrenome">Sobrenome</label>
                            <input id="sobrenome" type="text" className="auth-input" placeholder="Silva" value={form.sobrenome} onChange={e => set('sobrenome', e.target.value)} />
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="auth-label" htmlFor="email-cand">E-mail *</label>
                            <input id="email-cand" type="email" className="auth-input" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="auth-label" htmlFor="telefone">Telefone</label>
                            <input
                                id="telefone"
                                type="tel"
                                className="auth-input"
                                placeholder="(11) 99999-9999"
                                value={form.telefone}
                                onChange={handleTelefone}
                                inputMode="numeric"
                                maxLength={15}
                            />
                        </div>

                        {/* Área de interesse — oculta, valor fixo "Outra" */}
                        <input type="hidden" name="area" value="Outra" />

                        {/* Senha */}
                        <div>
                            <label className="auth-label" htmlFor="senha-cand">
                                Senha * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(mín. 8 caracteres)</span>
                            </label>
                            <div className="auth-input-wrapper">
                                <input
                                    id="senha-cand"
                                    type={mostrarSenha ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={form.senha}
                                    onChange={handleSenha}
                                />
                                <button type="button" className="auth-input-toggle" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label="Mostrar senha">
                                    {mostrarSenha ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar senha — oculto, sempre idêntico */}
                        <input type="hidden" name="confirmarSenha" value={form.senha} />

                        {/* Termos */}
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.83rem', color: '#475569', lineHeight: 1.5 }}>
                            <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} style={{ marginTop: 2, flexShrink: 0, accentColor: '#09355F' }} />
                            <span>
                                Aceito os{' '}
                                <Link href="/termos" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Termos de Uso</Link>
                                {' '}e a{' '}
                                <Link href="/privacidade" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Política de Privacidade</Link>
                            </span>
                        </label>

                        {/* Erro */}
                        {erro && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.83rem', color: '#dc2626' }}>
                                {erro}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #2AB9C0, #0d8a90)' }}>
                            {loading
                                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : 'Criar conta gratuita →'
                            }
                        </button>

                    </form>

                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', marginTop: '1.25rem' }}>
                        Já tem conta?{' '}
                        <Link href="/login" style={{ color: '#09355F', fontWeight: 700, textDecoration: 'none' }}>Fazer login</Link>
                    </p>

                </div>
            </div>
        </div>
    )
}

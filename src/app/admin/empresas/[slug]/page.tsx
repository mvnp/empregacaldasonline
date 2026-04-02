import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Calendar, Users,
    Mail, Phone, Globe, Linkedin, Award, Gift,
    Shield
} from 'lucide-react'
import { getStatusColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DetailSection from '@/components/admin/DetailSection'
import DetailInfoRow from '@/components/admin/DetailInfoRow'
import DetailMiniInfo from '@/components/admin/DetailMiniInfo'
import BackButton from '@/components/admin/BackButton'
import TagBadge from '@/components/admin/TagBadge'
import { FileText } from 'lucide-react'
import { buscarEmpresa } from '@/actions/empresas'

export const dynamic = 'force-dynamic'

function getPlanoStyle(plano: string) {
    const p = (plano || '').toLowerCase()
    switch (p) {
        case 'enterprise': return { bg: 'linear-gradient(135deg, #FBBF53, #FE8341)', color: '#fff', label: 'Enterprise' }
        case 'profissional': return { bg: 'linear-gradient(135deg, #2AB9C0, #09355F)', color: '#fff', label: 'Profissional' }
        default: return { bg: '#f0f4f8', color: '#64748b', label: 'Gratuito' }
    }
}

export default async function EmpresaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const id = parseInt(slug, 10)

    if (isNaN(id)) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Empresa inválida</h2>
                <Link href="/admin/empresas" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Empresas
                </Link>
            </div>
        )
    }

    const empresaDb = await buscarEmpresa(id)

    if (!empresaDb) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Empresa não encontrada</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>A empresa solicitada não existe ou foi removida.</p>
                <Link href="/admin/empresas" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Empresas
                </Link>
            </div>
        )
    }

    const vagasAtivasTotais = (empresaDb.vagas || []).filter((v: any) => v.status === 'aberta' || v.status === 'ativa').length

    const empresa = {
        id: empresaDb.id,
        nome: empresaDb.nome_fantasia,
        setor: empresaDb.setor || 'Não informado',
        local: empresaDb.local || 'Não informado',
        plano: empresaDb.plano || 'Gratuito',
        status: empresaDb.status as 'ativa' | 'inativa',
        email: empresaDb.email_contato || 'Sem e-mail',
        telefone: empresaDb.telefone || 'Sem telefone',
        endereco: [
            `${empresaDb.logradouro || ''}, ${empresaDb.numero || ''}`,
            empresaDb.bairro || '',
            (empresaDb.cidade && empresaDb.estado) ? `${empresaDb.cidade}/${empresaDb.estado}` : empresaDb.local
        ].filter(Boolean).join(' - '),
        cnpj: empresaDb.cnpj || '00.000.000/0000-00',
        fundacao: empresaDb.fundacao_ano || 2000,
        website: empresaDb.website,
        linkedin: empresaDb.linkedin,
        vagasAtivas: vagasAtivasTotais,
        totalFuncionarios: empresaDb.tamanho_empresa || '1-10',
        dataCadastro: empresaDb.created_at.split('T')[0],
        tecnologiasUsadas: (empresaDb.tecnologias || []).map((t: any) => t.texto),
        beneficiosOferecidos: (empresaDb.beneficios || []).map((b: any) => b.texto),
        descricao: empresaDb.descricao || 'Nenhuma descrição fornecida.',
        vagasPublicadas: (empresaDb.vagas || []).map((v: any) => ({
            id: v.id,
            titulo: v.titulo,
            modalidade: v.modalidade || 'Remoto',
            candidaturas: (v.candidaturas || []).length,
            status: v.status
        }))
    }

    const planoStyle = getPlanoStyle(empresa.plano)

    // Ajuste p/ layout da view original "ativo"
    const statusLabel = empresa.status === 'ativa' || empresa.status === ('ativo' as any) ? 'Ativa' : 'Inativa'
    const statusIsActive = statusLabel === 'Ativa'

    return (
        <div>
            <AdminPageHeader
                titulo={empresa.nome}
                subtitulo={`${empresa.setor} · ${empresa.local}`}
                acao={<BackButton href="/admin/empresas" />}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">

                {/* ── Sidebar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <DetailSection semHeader>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 20, margin: '0 auto 1rem',
                                background: empresa.plano === 'enterprise' ? 'linear-gradient(135deg, #FBBF53, #FE8341)' : empresa.plano === 'profissional' ? 'linear-gradient(135deg, #09355F, #2AB9C0)' : '#e8edf5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Building2 style={{ width: 36, height: 36, color: empresa.plano.toLowerCase() === 'gratuito' ? '#64748b' : '#fff' }} />
                            </div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', marginBottom: '0.15rem' }}>{empresa.nome}</h2>
                            <p style={{ fontSize: '0.82rem', color: '#FE8341', fontWeight: 600, marginBottom: '0.5rem' }}>{empresa.setor}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '3px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700,
                                    background: planoStyle.bg, color: planoStyle.color,
                                }}>
                                    {planoStyle.label}
                                </span>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                                    color: statusIsActive ? '#16a34a' : '#dc2626',
                                    background: statusIsActive ? '#f0fdf4' : '#fef2f2',
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusIsActive ? '#16a34a' : '#dc2626' }} />
                                    {statusLabel}
                                </span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f0f4f8', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <DetailInfoRow icon={Mail} label={empresa.email} />
                            <DetailInfoRow icon={Phone} label={empresa.telefone} />
                            {empresa.endereco.length > 5 && <DetailInfoRow icon={MapPin} label={empresa.endereco} />}
                            <DetailInfoRow icon={FileText} label={`CNPJ: ${empresa.cnpj}`} />
                            <DetailInfoRow icon={Calendar} label={`Fundada em ${empresa.fundacao}`} />
                        </div>

                        <div style={{ borderTop: '1px solid #f0f4f8', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                            {empresa.website && (
                                <a href={empresa.website} target="_blank" rel="noopener noreferrer" style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                    padding: '0.5rem', borderRadius: 8, background: '#2AB9C014', color: '#2AB9C0',
                                    fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    <Globe style={{ width: 14, height: 14 }} /> Website
                                </a>
                            )}
                            {empresa.linkedin && (
                                <a href={empresa.linkedin} target="_blank" rel="noopener noreferrer" style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                    padding: '0.5rem', borderRadius: 8, background: '#0077b514', color: '#0077b5',
                                    fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    <Linkedin style={{ width: 14, height: 14 }} /> LinkedIn
                                </a>
                            )}
                        </div>
                    </DetailSection>

                    <DetailSection semHeader>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <DetailMiniInfo icon={Briefcase} label="Vagas Ativas" value={String(empresa.vagasAtivas)} />
                            <DetailMiniInfo icon={Users} label="Funcionários" value={empresa.totalFuncionarios} />
                            <DetailMiniInfo icon={Award} label="Plano" value={planoStyle.label} />
                            <DetailMiniInfo icon={Calendar} label="Cadastro" value={empresa.dataCadastro} />
                        </div>
                    </DetailSection>

                    {empresa.tecnologiasUsadas.length > 0 && (
                        <DetailSection icon={() => <Shield style={{ width: 16, height: 16, color: '#2AB9C0' }} />} titulo="Tecnologias">
                            <TagBadge items={empresa.tecnologiasUsadas} />
                        </DetailSection>
                    )}

                    {empresa.beneficiosOferecidos.length > 0 && (
                        <DetailSection icon={() => <Gift style={{ width: 16, height: 16, color: '#FBBF53' }} />} titulo="Benefícios">
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {empresa.beneficiosOferecidos.map((b: string) => (
                                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#374151' }}>
                                        <Gift style={{ width: 13, height: 13, color: '#FBBF53' }} /> {b}
                                    </div>
                                ))}
                            </div>
                        </DetailSection>
                    )}
                </div>

                {/* ── Conteúdo principal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <DetailSection icon={() => <Building2 style={{ width: 18, height: 18, color: '#FE8341' }} />} titulo="Sobre a Empresa">
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {empresa.descricao.split('\n').map((p: string, i: number) => (
                                <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7, margin: i > 0 ? '0.75rem 0 0' : 0 }}>{p}</p>
                            ))}
                        </div>
                    </DetailSection>

                    {/* Números */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="admin-stats-grid">
                        {[
                            { value: String(empresa.vagasAtivas), label: 'Vagas Ativas', color: '#2AB9C0' },
                            { value: empresa.totalFuncionarios, label: 'Funcionários', color: '#FBBF53' },
                            { value: empresa.vagasPublicadas.reduce((a: number, v: any) => a + v.candidaturas, 0).toString(), label: 'Candidaturas', color: '#FE8341' },
                            { value: String(empresa.fundacao), label: 'Fundação', color: '#09355F' },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: '#fff', borderRadius: 14, padding: '1.25rem', textAlign: 'center',
                                border: '1.5px solid #e8edf5',
                            }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '0.3rem' }}>{s.value}</p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Vagas publicadas */}
                    <DetailSection icon={() => <Briefcase style={{ width: 18, height: 18, color: '#2AB9C0' }} />} titulo={`Vagas Publicadas (${empresa.vagasPublicadas.length})`}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                <thead>
                                    <tr style={{ background: '#fafbfd' }}>
                                        {['Vaga', 'Modalidade', 'Candidaturas', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {empresa.vagasPublicadas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Nenhuma vaga ativa publicada no momento.</td>
                                        </tr>
                                    ) : (
                                        empresa.vagasPublicadas.map((v: any, i: number) => {
                                            const statusStyle = getStatusColor(v.status)
                                            return (
                                                <tr key={v.id} style={{ borderBottom: i < empresa.vagasPublicadas.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <span style={{ fontWeight: 600, color: '#09355F' }}>{v.titulo}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0' }}>{v.modalidade}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Users style={{ width: 13, height: 13, color: '#94a3b8' }} />
                                                            <span style={{ fontWeight: 700, color: '#09355F' }}>{v.candidaturas}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>{v.status}</span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DetailSection>
                </div>
            </div>
        </div>
    )
}

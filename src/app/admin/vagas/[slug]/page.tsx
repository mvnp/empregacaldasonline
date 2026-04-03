import Link from 'next/link'
import {
    MapPin, Building2, Briefcase, Calendar, Users,
    Clock, DollarSign, CheckCircle2, Star, Gift, FileText,
    ExternalLink, Eye
} from 'lucide-react'
import { getStatusColor, getStatusCandidaturaColor } from '@/data/admin'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DetailSection from '@/components/admin/DetailSection'
import DetailMiniInfo from '@/components/admin/DetailMiniInfo'
import BackButton from '@/components/admin/BackButton'
import { buscarVaga } from '@/actions/vagas'

export const dynamic = 'force-dynamic'

export default async function VagaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const id = parseInt(slug, 10)

    if (isNaN(id)) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Vaga inválida</h2>
                <Link href="/admin/vagas" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Vagas
                </Link>
            </div>
        )
    }

    const vagaDb = await buscarVaga(id)

    if (!vagaDb) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.5rem' }}>Vaga não encontrada</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>A vaga com ID {id} não existe no banco de dados.</p>
                <Link href="/admin/vagas" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Voltar para Vagas
                </Link>
            </div>
        )
    }

    // Map DB to Layout
    const dataObj = new Date(vagaDb.created_at)
    const dia = String(dataObj.getDate()).padStart(2, '0')
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
    const ano = dataObj.getFullYear()

    const vaga = {
        titulo: vagaDb.titulo,
        empresa: vagaDb.empresa,
        local: vagaDb.local || 'Local não informado',
        modalidade: vagaDb.modalidade,
        nivel: vagaDb.nivel,
        status: vagaDb.status as 'ativa' | 'pausada' | 'expirada',
        descricao: vagaDb.descricao || 'Sem descrição.',
        responsabilidades: vagaDb.responsabilidades || [],
        requisitos: vagaDb.requisitos || [],
        diferenciais: vagaDb.diferenciais || [],
        beneficios: vagaDb.beneficios || [],
        salario: vagaDb.salario_min ? `R$ ${vagaDb.salario_min}` : 'A combinar',
        regime: vagaDb.tipo_contrato || 'CLT',
        horario: vagaDb.modalidade === 'remoto' ? 'Flexível' : 'Horário Comercial',
        telefone: vagaDb.telefone || null,
        whatsapp: vagaDb.whatsapp || null,
        dataPublicacao: `${ano}-${mes}-${dia}`,
        candidaturas: (vagaDb.candidaturas || []).length,
        candidatosRecentes: (vagaDb.candidaturas || [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((c: any) => ({
                id: c.candidato?.id,
                nome: c.candidato?.nome_completo || 'Desconhecido',
                cargo: c.candidato?.cargo_desejado || 'Não informado',
                data: c.created_at.split('T')[0],
                status: c.status
            })),
        empresa_id: vagaDb.empresa_id // Link para empresa
    }

    const statusStyle = getStatusColor(vaga.status)

    return (
        <div>
            <AdminPageHeader
                titulo={vaga.titulo}
                subtitulo={`${vaga.empresa} · ${vaga.local}`}
                acao={<BackButton href="/admin/vagas" />}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }} className="admin-main-grid">

                {/* ── Conteúdo principal ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Header card */}
                    <DetailSection semHeader>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: 'linear-gradient(135deg, #09355F14, #2AB9C014)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Briefcase style={{ width: 24, height: 24, color: '#2AB9C0' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09355F', margin: '0 0 0.2rem' }}>{vaga.titulo}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#475569' }}>
                                            <Building2 style={{ width: 13, height: 13 }} /> {vaga.empresa}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#475569' }}>
                                            <MapPin style={{ width: 13, height: 13 }} /> {vaga.local}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0', textTransform: 'capitalize' }}>{vaga.modalidade}</span>
                                {vaga.nivel && <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#f3e8ff', color: '#7c3aed', textTransform: 'capitalize' }}>{vaga.nivel}</span>}
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>{vaga.status}</span>
                                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, background: '#09355F0a', color: '#09355F', textTransform: 'uppercase' }}>{vaga.regime}</span>
                            </div>
                        </div>
                    </DetailSection>

                    <DetailSection icon={() => <FileText style={{ width: 18, height: 18, color: '#2AB9C0' }} />} titulo="Descrição da Vaga">
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {vaga.descricao.split('\n').map((p: string, i: number) => (
                                <p key={i} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7, margin: i > 0 ? '0.75rem 0 0' : 0 }}>{p}</p>
                            ))}
                        </div>
                    </DetailSection>

                    {vaga.responsabilidades && vaga.responsabilidades.length > 0 && (
                        <DetailSection icon={() => <CheckCircle2 style={{ width: 18, height: 18, color: '#16a34a' }} />} titulo="Responsabilidades">
                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {vaga.responsabilidades.map((r: string, i: number) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                            <CheckCircle2 style={{ width: 14, height: 14, color: '#16a34a', flexShrink: 0, marginTop: 3 }} /> {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </DetailSection>
                    )}

                    {/* Requisitos + Diferenciais */}
                    {(vaga.requisitos.length > 0 || vaga.diferenciais.length > 0) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="admin-cards-grid">
                            {vaga.requisitos.length > 0 && (
                                <DetailSection icon={() => <Star style={{ width: 18, height: 18, color: '#FE8341' }} />} titulo="Requisitos">
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {vaga.requisitos.map((r: string, i: number) => (
                                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: '#374151' }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE8341', flexShrink: 0, marginTop: 7 }} /> {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </DetailSection>
                            )}
                            {vaga.diferenciais.length > 0 && (
                                <DetailSection icon={() => <Star style={{ width: 18, height: 18, color: '#FBBF53' }} />} titulo="Diferenciais">
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {vaga.diferenciais.map((d: string, i: number) => (
                                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: '#374151' }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF53', flexShrink: 0, marginTop: 7 }} /> {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </DetailSection>
                            )}
                        </div>
                    )}

                    {/* Candidatos */}
                    <DetailSection icon={() => <Users style={{ width: 18, height: 18, color: '#09355F' }} />} titulo={`Candidatos (${vaga.candidaturas})`}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                <thead>
                                    <tr style={{ background: '#fafbfd' }}>
                                        {['Candidato', 'Cargo Atual', 'Data', 'Status', ''].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e8edf5' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaga.candidatosRecentes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Nenhum candidato recente.</td>
                                        </tr>
                                    ) : (
                                        vaga.candidatosRecentes.map((c: any, i: number) => {
                                            const st = getStatusCandidaturaColor(c.status)
                                            return (
                                                <tr key={c.id} style={{ borderBottom: i < vaga.candidatosRecentes.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{
                                                                width: 30, height: 30, borderRadius: 8,
                                                                background: 'linear-gradient(135deg, #2AB9C014, #09355F14)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.7rem', fontWeight: 800, color: '#09355F',
                                                            }}>
                                                                {c.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                                            </div>
                                                            <span style={{ fontWeight: 600, color: '#09355F' }}>{c.nome}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.5rem', color: '#475569' }}>{c.cargo}</td>
                                                    <td style={{ padding: '0.875rem 1.5rem', color: '#64748b' }}>{c.data}</td>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.5rem' }}>
                                                        <Link href={`/admin/candidatos/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none' }}>
                                                            <Eye style={{ width: 12, height: 12 }} /> Ver
                                                        </Link>
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

                {/* ── Sidebar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <DetailSection semHeader>
                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <DetailMiniInfo icon={DollarSign} label="Salário" value={vaga.salario} />
                            <DetailMiniInfo icon={Briefcase} label="Regime" value={vaga.regime.toUpperCase()} />
                            <DetailMiniInfo icon={Clock} label="Horário" value={vaga.horario} />
                            <DetailMiniInfo icon={MapPin} label="Modalidade" value={vaga.modalidade} />
                            {vaga.telefone && <DetailMiniInfo icon={MapPin} label="Telefone" value={vaga.telefone} />}
                            {vaga.whatsapp && <DetailMiniInfo icon={MapPin} label="WhatsApp" value={vaga.whatsapp} />}
                            <DetailMiniInfo icon={Calendar} label="Publicada em" value={vaga.dataPublicacao} />
                            <DetailMiniInfo icon={Users} label="Candidaturas" value={String(vaga.candidaturas)} />
                        </div>
                    </DetailSection>

                    {vaga.beneficios && vaga.beneficios.length > 0 && (
                        <DetailSection icon={() => <Gift style={{ width: 16, height: 16, color: '#FBBF53' }} />} titulo="Benefícios">
                            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {vaga.beneficios.map((b: string) => (
                                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#374151' }}>
                                        <Gift style={{ width: 13, height: 13, color: '#FBBF53' }} /> {b}
                                    </div>
                                ))}
                            </div>
                        </DetailSection>
                    )}

                    <DetailSection icon={() => <Building2 style={{ width: 16, height: 16, color: '#FE8341' }} />} titulo="Sobre a Empresa">
                        <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: 12, margin: '0 auto 0.75rem',
                                background: 'linear-gradient(135deg, #09355F, #2AB9C0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Building2 style={{ width: 22, height: 22, color: '#fff' }} />
                            </div>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', margin: '0 0 0.2rem' }}>{vaga.empresa}</h4>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem' }}>{vaga.local}</p>
                            {vaga.empresa_id && (
                                <Link href={`/admin/empresas/${vaga.empresa_id}`} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                    fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', textDecoration: 'none',
                                }}>
                                    <ExternalLink style={{ width: 12, height: 12 }} /> Ver empresa
                                </Link>
                            )}
                        </div>
                    </DetailSection>
                </div>
            </div>
        </div>
    )
}

import { FileText, Plus, Edit, Briefcase, Eye, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { buscarMeuUserId, buscarUsuariosCandidato, listarMeusCurriculos } from '@/actions/candidatos'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ListarCurriculosCandidato() {
    const userId = await buscarMeuUserId()
    const curriculos = userId ? await listarMeusCurriculos(userId) : []

    return (
        <div>
            <AdminPageHeader 
                titulo="Meus Currículos" 
                subtitulo="Crie e gerencie versões do seu currículo para se candidatar às vagas."
                acao={
                    <Link href="/admin/candidato/cadastrar-curriculos" style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        padding: '0.65rem 1.25rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #2AB9C0, #1b9ca3)',
                        color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 4px 15px rgba(42,185,192,0.25)',
                    }}>
                        <Plus style={{ width: 16, height: 16 }} /> Cadastrar Currículo
                    </Link>
                }
            />

            {curriculos.length === 0 ? (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: 16, textAlign: 'center', border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 64, height: 64, background: '#f8fafc', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <FileText style={{ width: 32, height: 32, color: '#94a3b8' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Nenhum currículo cadastrado</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 2rem' }}>
                        Adicione o seu primeiro currículo para poder se candidatar às melhores vagas da plataforma.
                    </p>
                    <Link href="/admin/candidato/cadastrar-curriculos" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1.75rem', borderRadius: 12,
                        background: '#09355F', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 4px 15px rgba(9,53,95,0.2)'
                    }}>
                        <Plus style={{ width: 16, height: 16 }} /> Criar Meu Primeiro Currículo
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {curriculos.map((c: any) => (
                        <div key={c.id} style={{ 
                            background: '#fff', padding: '1.5rem', borderRadius: 16, 
                            border: '1px solid #e8edf5', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09355F', marginBottom: '0.25rem' }}>
                                        {c.cargo_desejado || 'Currículo Padrão'}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Briefcase style={{ width: 14, height: 14 }} /> 
                                        {c.experiencias?.length ? `${c.experiencias.length} experiência(s)` : 'Sem experiências adic.'}
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '1.25rem', flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <User style={{ width: 14, height: 14 }} /> {c.nome_completo}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Calendar style={{ width: 14, height: 14 }} /> 
                                    Criado em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link href={`/admin/candidato/ver-curriculo/${c.id}`} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    flex: 1, padding: '0.75rem', borderRadius: 10,
                                    background: '#f1f5f9', color: '#334155', fontSize: '0.85rem', fontWeight: 700,
                                    textDecoration: 'none', transition: 'background 0.2s'
                                }}>
                                    <Eye style={{ width: 16, height: 16 }} /> Visualizar
                                </Link>
                                <Link href={`/admin/candidato/editar-curriculo/${c.id}`} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    flex: 1, padding: '0.75rem', borderRadius: 10,
                                    background: 'rgba(42, 185, 192, 0.1)', color: '#2AB9C0', fontSize: '0.85rem', fontWeight: 700,
                                    textDecoration: 'none', transition: 'background 0.2s'
                                }}>
                                    <Edit style={{ width: 16, height: 16 }} /> Editar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

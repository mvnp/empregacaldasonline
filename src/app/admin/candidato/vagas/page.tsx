'use client'

import { useState, useEffect } from 'react'
import { listarVagasPublicas, type VagaPublica } from '@/actions/vagas'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import { Briefcase, MapPin, DollarSign, Building2, ArrowRight } from 'lucide-react'

export default function VagasCandidatoPage() {
    const [vagas, setVagas] = useState<VagaPublica[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        carregarVagas(1)
    }, [])

    async function carregarVagas(pageNumber: number) {
        if (pageNumber === 1) setLoading(true)
        else setLoadingMore(true)
        
        try {
            const data = await listarVagasPublicas({ page: pageNumber, perPage: 25 })
            
            if (pageNumber === 1) {
                setVagas(data.vagas)
            } else {
                setVagas(prev => [...prev, ...data.vagas])
            }
            
            setHasMore(data.page < data.totalPages)
        } catch (e) {
            console.error('Erro ao carregar vagas', e)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    function handleLoadMore() {
        if (!hasMore || loadingMore) return
        const nextPage = page + 1
        setPage(nextPage)
        carregarVagas(nextPage)
    }

    return (
        <div>
            <AdminPageHeader titulo="Vagas Disponíveis" subtitulo="Encontre a oportunidade ideal para sua carreira" />

            {loading ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>Carregando vagas...</div>
            ) : vagas.length === 0 ? (
                <div style={{ background: '#fff', padding: '3rem', borderRadius: 14, textAlign: 'center', color: '#64748b' }}>
                    <Briefcase style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhuma vaga disponível no momento.</p>
                </div>
            ) : (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {vagas.map((v) => (
                        <div key={v.id} style={{
                            background: '#fff', borderRadius: 14, padding: '1.5rem',
                            border: '1.5px solid #e8edf5', display: 'flex', flexDirection: 'column',
                            gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', marginBottom: '0.3rem' }}>
                                    {v.titulo}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem' }}>
                                    <Building2 style={{ width: 14, height: 14 }} /> {v.empresa}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ padding: '0.25rem 0.6rem', background: '#e3f2fd', color: '#1565c0', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>
                                    {v.modalidade.charAt(0).toUpperCase() + v.modalidade.slice(1)}
                                </span>
                                {v.nivel && (
                                    <span style={{ padding: '0.25rem 0.6rem', background: '#f3e8ff', color: '#7e22ce', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>
                                        {v.nivel}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin style={{ width: 14, height: 14 }} /> {v.local || 'Não informado'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <DollarSign style={{ width: 14, height: 14 }} /> {v.salario_a_combinar ? 'A combinar' : (v.salario_min ? `A partir de R$ ${v.salario_min}` : 'Confidencial')}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Publicada em {new Date(v.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <Link href={`/admin/candidato/vagas/${v.id}`} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.4rem 0.8rem', background: '#2AB9C0', color: '#fff',
                                    borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none'
                                }}>
                                    Ver Detalhes <ArrowRight style={{ width: 14, height: 14 }} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                
                {hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={handleLoadMore} disabled={loadingMore} style={{
                            padding: '0.75rem 1.75rem',
                            borderRadius: '8px',
                            background: '#fff',
                            border: '1.5px solid #cbd5e1',
                            color: '#475569',
                            fontWeight: 700,
                            cursor: loadingMore ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}>
                            {loadingMore ? 'Carregando Mágica...' : 'Carregar mais vagas'}
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    )
}

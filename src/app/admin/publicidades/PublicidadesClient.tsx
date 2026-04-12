'use client'

import React from 'react'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { Plus, Megaphone, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react'

export default function PublicidadesClient({ publicidades }: { publicidades: any[] }) {
    return (
        <div>
            <AdminPageHeader
                titulo="Gestão de Publicidades"
                subtitulo={`${publicidades.length} campanhas ativas/pausadas`}
                acao={
                    <Link
                        href="/admin/publicidades/cadastrar"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.25rem', borderRadius: 10,
                            background: 'linear-gradient(135deg, #FE8341, #FBBF53)',
                            color: '#fff', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none',
                            boxShadow: '0 4px 15px rgba(254,131,65,0.3)'
                        }}
                    >
                        <Plus size={16} /> Nova Campanha
                    </Link>
                }
            />

            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {publicidades.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <Megaphone size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Nenhuma publicidade rodando.</p>
                        <p style={{ fontSize: '0.85rem' }}>Cadastre a primeira campanha para preencher os banners do portal.</p>
                    </div>
                ) : (
                    publicidades.map(pub => {
                        const empresa = pub.empresas || {}
                        const nomeEmpresa = empresa.nome_fantasia || empresa.razao_social || 'Desconhecida'
                        const isAtiva = new Date(pub.data_inicio) <= new Date() && new Date(pub.data_fim) >= new Date() && pub.status === 'ativo'
                        
                        return (
                            <div key={pub.id} style={{
                                background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem',
                                border: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: isAtiva ? '#dcfce7' : '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isAtiva ? '#16a34a' : '#64748b'
                                }}>
                                    <Megaphone size={22} />
                                </div>
                                <div style={{ flex: 1, minWidth: 250 }}>
                                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800, color: '#09355F' }}>
                                        {nomeEmpresa}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={14} /> 
                                            {new Date(pub.data_inicio).toLocaleDateString('pt-BR')} até {new Date(pub.data_fim).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <DollarSign size={14} /> 
                                            R$ {pub.orcamento_real.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <ImageIcon size={14} /> 
                                            {(pub.imagens || []).length} formatos
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '0.35rem' }}>
                                        <a href={pub.link_destino} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#0ea5e9', textDecoration: 'none' }}>
                                            {pub.link_destino}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                        <span style={{ 
                                            padding: '0.35rem 0.75rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700,
                                            background: isAtiva ? '#dcfce7' : '#f1f5f9',
                                            color: isAtiva ? '#16a34a' : '#64748b'
                                        }}>
                                            {isAtiva ? 'Rodando' : 'Inativa/Pausada'}
                                        </span>
                                        <Link 
                                            href={`/admin/publicidades/${pub.id}`}
                                            style={{
                                                fontSize: '0.75rem', fontWeight: 700, color: '#09355F', textDecoration: 'none',
                                                padding: '0.35rem 0.75rem', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            Editar Campanha
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

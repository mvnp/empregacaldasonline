'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Star, Calendar, FileText } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import FilterSearchInput from '@/components/admin/FilterSearchInput'

interface PostMap {
    id: string
    title: string
    slug: string
    category: string
    author: string
    publishedAt: string
    featured: boolean
    readingTime: number
}

interface Props {
    posts: PostMap[]
}

export default function BlogAdminClient({ posts: initialPosts }: Props) {
    const [posts, setPosts] = useState(initialPosts)
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este artigo?')) return
        setPosts(posts.filter(p => p.id !== id))
    }

    return (
        <div>
            <AdminPageHeader
                titulo="Artigos do Blog"
                subtitulo={`${filtered.length} artigos encontrados`}
                acao={
                    <Link href="/admin/blog/novo" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.6rem 1.25rem', borderRadius: 10,
                        background: 'linear-gradient(135deg, #09355F, #0d4a80)',
                        color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(9,53,95,0.25)',
                        transition: 'all 0.18s'
                    }}>
                        <Plus size={16} /> Novo Artigo
                    </Link>
                }
            />

            <AdminFilterBar onBuscar={() => {}}>
                <FilterSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por título..." />
            </AdminFilterBar>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.map(post => (
                    <div key={post.id} style={{
                        background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
                        border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)',
                        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 11,
                            background: 'linear-gradient(135deg, #09355F14, #2AB9C014)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            position: 'relative'
                        }}>
                            <FileText style={{ width: 20, height: 20, color: '#2AB9C0' }} />
                            {post.featured && (
                                <div style={{ position: 'absolute', top: -5, right: -5 }}>
                                    <Star size={14} fill="#FBBF53" color="#FBBF53" />
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#09355F', marginBottom: '0.2rem' }}>{post.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    {post.author}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600, background: '#e3f2fd', color: '#1565c0' }}>
                                {post.category}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                <Calendar style={{ width: 12, height: 12 }} /> {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                            </span>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <Link href={`/admin/blog/${post.id}`} style={{
                                    background: '#f1f5f9', border: 'none', borderRadius: 8,
                                    padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#64748b',
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    <Edit2 style={{ width: 14, height: 14 }} />
                                </Link>
                                <button onClick={() => handleDelete(post.id)} style={{
                                    background: '#fef2f2', border: 'none', borderRadius: 8,
                                    padding: '0.3rem 0.5rem', cursor: 'pointer', color: '#ef4444',
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    <Trash2 style={{ width: 14, height: 14 }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, Star, ArrowRight } from 'lucide-react'
import { BlogPost, formatarDataBlog, getCategoriaColor } from '@/data/blog'

interface BlogCardProps {
    post: BlogPost
    grande?: boolean
}

export default function BlogCard({ post, grande = false }: BlogCardProps) {
    const corCategoria = getCategoriaColor(post.categoria)

    if (grande) {
        return (
            <Link href={`/blog/${post.slug}`} className="blog-card-grande" style={{ textDecoration: 'none', display: 'block' }}>
                <article style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8edf5', overflow: 'hidden', boxShadow: '0 4px 20px rgba(9,53,95,0.07)' }}>
                    {/* Imagem */}
                    <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                        <Image src={post.imagemCapa} alt={post.titulo} fill style={{ objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,53,95,0.6) 0%, transparent 60%)' }} />
                        {post.destaque && (
                            <span style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#FBBF53', color: '#09355F', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800 }}>
                                <Star style={{ width: 10, height: 10 }} /> Destaque
                            </span>
                        )}
                        <span style={{ position: 'absolute', bottom: 14, left: 14, padding: '4px 12px', background: corCategoria, color: '#fff', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700 }}>
                            {post.categoria}
                        </span>
                    </div>
                    {/* Conteúdo */}
                    <div style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', lineHeight: 1.3, marginBottom: '0.75rem' }}>{post.titulo}</h2>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.25rem' }}>{post.resumo}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: corCategoria, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>{post.autor.avatar}</div>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{post.autor.nome}</span>
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    <Clock style={{ width: 13, height: 13 }} /> {post.tempoLeitura} min
                                </span>
                            </div>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{formatarDataBlog(post.dataPublicacao)}</span>
                        </div>
                    </div>
                </article>
            </Link>
        )
    }

    // Card compacto horizontal
    return (
        <Link href={`/blog/${post.slug}`} className="blog-card-compacto" style={{ textDecoration: 'none', display: 'block' }}>
            <article style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden', display: 'flex', boxShadow: '0 2px 10px rgba(9,53,95,0.05)' }}>
                {/* Thumbnail */}
                <div style={{ width: 180, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    <Image src={post.imagemCapa} alt={post.titulo} fill style={{ objectFit: 'cover' }} />
                </div>
                {/* Info */}
                <div style={{ padding: '1.25rem', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ display: 'inline-block', padding: '2px 10px', background: `${corCategoria}18`, color: corCategoria, borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {post.categoria}
                        </span>
                        <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#09355F', lineHeight: 1.35, marginBottom: '0.4rem' }}>{post.titulo}</h3>
                        <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.resumo}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <Calendar style={{ width: 12, height: 12 }} /> {formatarDataBlog(post.dataPublicacao)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <Clock style={{ width: 12, height: 12 }} /> {post.tempoLeitura} min
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#2AB9C0', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            Ler mais <ArrowRight style={{ width: 12, height: 12 }} />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

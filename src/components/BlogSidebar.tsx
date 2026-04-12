'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Clock, ChevronRight, Tag, Megaphone, ArrowRight } from 'lucide-react'
import { formatarDataBlog, getCategoriaColor } from '@/data/blog'
import BannerSpace from '@/components/publicidade/BannerSpace'

interface CategoriaSidebar {
    nome: string
    contagem: number
}

interface PostSidebar {
    id: string
    slug: string
    titulo: string
    imagemCapa: string
    tempoLeitura: number
}

interface BlogSidebarProps {
    slugAtual?: string
    categorias: CategoriaSidebar[]
    recentes: PostSidebar[]
}

export default function BlogSidebar({ slugAtual, categorias, recentes }: BlogSidebarProps) {
    const postsRecentes = recentes.filter(p => p.slug !== slugAtual).slice(0, 4)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Buscar ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F', margin: 0 }}>Pesquisar</h3>
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Buscar artigos..."
                            className="input-filter"
                            style={{ paddingLeft: '2.5rem', height: 42 }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Artigos Recentes ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F', margin: 0 }}>Artigos Recentes</h3>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    {postsRecentes.map((post, i) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="sidebar-post-link"
                            style={{ borderBottom: i < postsRecentes.length - 1 ? '1px solid #f0f4f8' : 'none' }}
                        >
                            {/* Thumbnail */}
                            <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#e8edf5' }}>
                                <Image src={post.imagemCapa} alt={post.titulo} fill style={{ objectFit: 'cover' }} />
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#09355F', lineHeight: 1.35, marginBottom: '0.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {post.titulo}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <Clock style={{ width: 11, height: 11 }} />
                                    {post.tempoLeitura} min de leitura
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1.5px solid #e8edf5' }}>
                    <Link href="/blog" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, color: '#09355F', textDecoration: 'none' }}>
                        Ver todos os artigos <ChevronRight style={{ width: 14, height: 14 }} />
                    </Link>
                </div>
            </div>

            {/* ── Categorias ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F', margin: 0 }}>Categorias</h3>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                    {categorias.map((cat, i) => (
                        <Link
                            key={cat.nome}
                            href={`/blog?categoria=${encodeURIComponent(cat.nome)}`}
                            className="sidebar-cat-link"
                            style={{ borderBottom: i < categorias.length - 1 ? '1px solid #f0f4f8' : 'none' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoriaColor(cat.nome), flexShrink: 0 }} />
                                <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{cat.nome}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: getCategoriaColor(cat.nome), borderRadius: 9999, padding: '1px 8px' }}>
                                {cat.contagem}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Anuncie Aqui (Slot Publicidade) ── */}
            <BannerSpace 
                formato="rectangle"
                slotFallback={
                    <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #FE8341, #FBBF53)', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

                        <div style={{ position: 'relative' }}>
                            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                                <Megaphone style={{ width: 22, height: 22, color: '#fff' }} />
                            </div>
                            <h4 style={{ color: '#09355F', fontWeight: 900, fontSize: '1rem', marginBottom: '0.4rem' }}>Anuncie Aqui</h4>
                            <p style={{ fontSize: '0.8rem', color: '#1c405f', lineHeight: 1.55, marginBottom: '1.1rem', opacity: 0.85 }}>
                                Alcance profissionais qualificados que buscam oportunidades de crescimento.
                            </p>
                            <Link
                                href="/admin/publicidades/cadastrar"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', background: '#09355F', color: '#FBBF53', borderRadius: 9, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                            >
                                Saiba mais <ArrowRight style={{ width: 14, height: 14 }} />
                            </Link>
                        </div>
                    </div>
                }
            />

            {/* ── Tags populares ── */}
            <div className="sidebar-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid #e8edf5' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09355F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Tag style={{ width: 14, height: 14 }} /> Tags
                    </h3>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['carreira', 'currículo', 'entrevista', 'salário', 'remote work', 'IA', 'tecnologia', 'RH', 'liderança'].map(tag => (
                        <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="sidebar-tag-link">
                            #{tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Banner Small Rectangle Abaixo de Tags (Slot J4) ── */}
            <BannerSpace formato="rectangle" />

        </div>
    )
}

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Clock, Calendar, ChevronRight,
    Tag, ArrowLeft, Share2, Linkedin, Twitter, Link2,
    BookOpen,
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSidebar from '@/components/BlogSidebar'
import BlogCard from '@/components/BlogCard'

import { createAdminClient } from '@/lib/supabase'
import { formatarDataBlog, getCategoriaColor } from '@/data/blog'

const parseImageUrl = (raw: string | undefined | null) => {
    if (!raw) return '/blog-placeholder.png';
    let mapped = raw.replace(/\\/g, '/'); // normaliza barras do windows
    
    // Se a string contiver 'public/' na frente, remover pois o next.js não serve a pasta public com esse nome na URL!
    if (mapped.startsWith('/public/')) {
        mapped = mapped.replace('/public/', '/');
    } else if (mapped.startsWith('public/')) {
        mapped = mapped.replace('public/', '/');
    } else if (!mapped.startsWith('http') && !mapped.startsWith('/')) {
        mapped = `/${mapped}`;
    }
    return mapped;
}

// ─────────────────────────────────────────────────────────────
// Metadata para SEO
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = createAdminClient()
    const { data: post } = await (supabase as any).from('blog_posts').select('title, excerpt').eq('slug', slug).single() as any
    if (!post) return { title: 'Artigo não encontrado' }
    return {
        title: `${post.title} — Blog PortalJobs`,
        description: post.excerpt,
    }
}

// ─────────────────────────────────────────────────────────────
// Sub-componente: botão de compartilhamento
// ─────────────────────────────────────────────────────────────
function ShareButton({ children, href, bg, color = '#fff' }: {
    children: React.ReactNode
    href: string
    bg: string
    color?: string
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', background: bg, color, borderRadius: 8,
                fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}
        >
            {children}
        </a>
    )
}

// ─────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────
export default async function BlogSinglePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = createAdminClient()

    // Busca o post
    const { data: rawPost } = await supabase
        .from('blog_posts')
        .select(`
            *,
            blog_post_images(url),
            blog_post_categories(blog_categories(id, name))
        `)
        .eq('slug', slug)
        .single() as any
        
    if (!rawPost) notFound()

    const catName = rawPost.blog_post_categories?.[0]?.blog_categories?.name || 'Geral'
    const catId = rawPost.blog_post_categories?.[0]?.blog_categories?.id

    const post = {
        id: rawPost.id,
        slug: rawPost.slug,
        titulo: rawPost.title,
        resumo: rawPost.excerpt,
        conteudo: rawPost.content,
        imagemCapa: parseImageUrl(rawPost.blog_post_images?.[0]?.url),
        categoria: catName,
        tags: rawPost.tags || [],
        autor: {
            nome: rawPost.author_name || 'Desconhecido',
            cargo: rawPost.author_role || '',
            avatar: rawPost.author_avatar || 'U'
        },
        dataPublicacao: rawPost.published_at || rawPost.created_at,
        tempoLeitura: rawPost.reading_time || 5,
    }

    const corCategoria = getCategoriaColor(post.categoria)

    // Busca dados da sidebar (categorias + recentes)
    const { data: catData } = await (supabase as any).from('blog_categories').select(`name, blog_post_categories(count)`) as any
    const { data: recData } = await supabase
        .from('blog_posts')
        .select(`id, slug, title, published_at, reading_time, blog_post_images(url)`)
        .order('published_at', { ascending: false })
        .limit(4) as any

    // Posts relacionados da mesma categoria
    let relatedPostsRaw: any[] = [];
    if (catId) {
        const { data: relData } = await supabase
            .from('blog_posts')
            .select(`*, blog_post_images(url), blog_post_categories!inner(category_id, blog_categories(name))`)
            .eq('blog_post_categories.category_id', catId)
            .neq('slug', slug) // Exclui o próprio post atual
            .order('published_at', { ascending: false })
            .limit(2) as any
        relatedPostsRaw = relData || []
    }

    const mapPostRel = (p: any) => ({
        id: p.id,
        slug: p.slug,
        titulo: p.title,
        resumo: p.excerpt,
        conteudo: p.content,
        imagemCapa: parseImageUrl(p.blog_post_images?.[0]?.url),
        categoria: p.blog_post_categories?.[0]?.blog_categories?.name || 'Geral',
        tags: p.tags || [],
        autor: {
            nome: p.author_name || 'Desconhecido',
            cargo: p.author_role || '',
            avatar: p.author_avatar || 'U'
        },
        dataPublicacao: p.published_at || p.created_at,
        tempoLeitura: p.reading_time || 5,
        destaque: p.featured || false
    });

    const categoriasSidebar = (catData || []).map((c: any) => ({
        nome: c.name,
        contagem: c.blog_post_categories?.[0]?.count || 0
    }))

    const recentesSidebar = (recData || []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        titulo: p.title,
        imagemCapa: parseImageUrl(p.blog_post_images?.[0]?.url),
        tempoLeitura: p.reading_time || 5
    }))

    const postsRelacionados = relatedPostsRaw.map(mapPostRel)

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Navbar variant="solid" />

            {/* ── Cabeçalho do artigo ── */}
            <div style={{ background: '#09355F' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 0' }}>

                    {/* Breadcrumb */}
                    <nav className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
                        <Link href="/">Início</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <Link href="/blog">Blog</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <span className="breadcrumb-current">{post.categoria}</span>
                    </nav>

                    {/* Badge categoria */}
                    <span style={{ display: 'inline-block', padding: '4px 14px', background: corCategoria, color: '#fff', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                        {post.categoria}
                    </span>

                    {/* Título */}
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, maxWidth: 820, marginBottom: '1.25rem' }}>
                        {post.titulo}
                    </h1>

                    {/* Meta: autor, data, tempo, share rápido */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', paddingBottom: '2rem' }}>
                        {/* Autor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FBBF53', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09355F', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                                {post.autor.avatar}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{post.autor.nome}</p>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{post.autor.cargo}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
                            <Calendar style={{ width: 14, height: 14 }} />
                            {formatarDataBlog(post.dataPublicacao)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
                            <Clock style={{ width: 14, height: 14 }} />
                            {post.tempoLeitura} min de leitura
                        </div>

                        {/* Share header */}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Share2 style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)' }} />
                            {[
                                { icon: Linkedin, href: '#', bg: '#0077B5' },
                                { icon: Twitter, href: '#', bg: '#1DA1F2' },
                            ].map(({ icon: Icon, href, bg }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                                    style={{ width: 30, height: 30, background: bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                                    <Icon style={{ width: 14, height: 14 }} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Featured Image ── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', marginTop: '2rem' }}>
                <div style={{ position: 'relative', height: 420, borderRadius: '0 0 20px 20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(9,53,95,0.2)' }}>
                    <Image
                        src={post.imagemCapa}
                        alt={post.titulo}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,53,95,0.15) 0%, transparent 50%)' }} />
                </div>
            </div>

            {/* ── Conteúdo principal ── */}
            <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>
                <div className="content-sidebar-grid">

                    {/* Coluna principal */}
                    <div>

                        {/* Lead / resumo */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(9,53,95,0.03), rgba(42,185,192,0.04))', border: '1.5px solid rgba(42,185,192,0.2)', borderLeft: '4px solid #2AB9C0', borderRadius: '0 12px 12px 0', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <BookOpen style={{ width: 20, height: 20, color: '#2AB9C0', flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: '1.05rem', color: '#374151', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                                    {post.resumo}
                                </p>
                            </div>
                        </div>

                        {/* Corpo do artigo - Renderização HTML */}
                        <article style={{ marginBottom: '2.5rem' }}>
                            <style>{`
                                .blog-dynamic-content h2 { font-size: 1.4rem; font-weight: 800; color: #09355F; margin-top: 1.75rem; margin-bottom: 0.875rem; padding-bottom: 0.4rem; border-bottom: 2px solid #FBBF53; display: inline-block; }
                                .blog-dynamic-content h3 { font-size: 1.2rem; font-weight: 700; color: #09355F; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                                .blog-dynamic-content p { font-size: 0.975rem; color: #374151; line-height: 1.8; margin-bottom: 1.1rem; }
                                .blog-dynamic-content ul, .blog-dynamic-content ol { margin-left: 1.5rem; margin-bottom: 1.1rem; }
                                .blog-dynamic-content li { font-size: 0.975rem; color: #374151; line-height: 1.8; margin-bottom: 0.4rem; }
                                .blog-dynamic-content a { color: #2AB9C0; text-decoration: underline; font-weight: 500; }
                                .blog-dynamic-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
                                .blog-dynamic-content blockquote { border-left: 4px solid #e8edf5; padding-left: 1rem; color: #64748b; font-style: italic; margin-left: 0; margin-bottom: 1.1rem; }
                            `}</style>
                            <div className="blog-dynamic-content" dangerouslySetInnerHTML={{ __html: post.conteudo }} />
                        </article>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 0', borderTop: '1.5px solid #e8edf5', marginBottom: '1.5rem' }}>
                                <Tag style={{ width: 15, height: 15, color: '#94a3b8' }} />
                                {post.tags.map((tag: string) => (
                                    <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}
                                        style={{ padding: '4px 12px', background: '#f0f4f8', color: '#475569', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', border: '1.5px solid transparent' }}>
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* ── Bloco de compartilhamento ── */}
                        <div style={{ background: '#09355F', borderRadius: 16, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ color: '#FBBF53', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Gostou do artigo?</p>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>Compartilhe com quem precisa ver isso!</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <ShareButton href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} — https://portaljobs.com.br/blog/${post.slug}`)}`} bg="#25D366">
                                    <Share2 style={{ width: 14, height: 14 }} /> WhatsApp
                                </ShareButton>
                                <ShareButton href="#" bg="#0077B5">
                                    <Linkedin style={{ width: 14, height: 14 }} /> LinkedIn
                                </ShareButton>
                                <ShareButton href="#" bg="#1DA1F2">
                                    <Twitter style={{ width: 14, height: 14 }} /> Twitter
                                </ShareButton>
                                <ShareButton href="#" bg="rgba(255,255,255,0.1)" color="#fff">
                                    <Link2 style={{ width: 14, height: 14 }} /> Copiar link
                                </ShareButton>
                            </div>
                        </div>

                        {/* ── Autor box ── */}
                        <div style={{ background: '#fff', border: '1.5px solid #e8edf5', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(9,53,95,0.05)', marginBottom: '2.5rem' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: corCategoria, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.4rem', flexShrink: 0 }}>
                                {post.autor.avatar}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#09355F' }}>{post.autor.nome}</p>
                                    {post.autor.cargo && (
                                        <span style={{ padding: '2px 8px', background: `${corCategoria}18`, color: corCategoria, borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                                            {post.autor.cargo}
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                                    Especialista com ampla experiência e desenvolvimento de carreira.
                                    Contribui regularmente com dicas e insights no blog.
                                </p>
                            </div>
                        </div>

                        {/* ── Posts relacionados ── */}
                        {postsRelacionados.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', whiteSpace: 'nowrap' }}>Continue lendo</h2>
                                    <div style={{ flex: 1, height: 1, background: '#e8edf5' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                                    {postsRelacionados.map((p: any) => (
                                        <BlogCard key={p.id} post={p} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Voltar */}
                        <div style={{ paddingTop: '1.5rem', borderTop: '1.5px solid #e8edf5' }}>
                            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>
                                <ArrowLeft style={{ width: 16, height: 16 }} /> Voltar para o Blog
                            </Link>
                        </div>

                    </div>

                    {/* ── Sidebar ── */}
                    <aside style={{ position: 'sticky', top: '1.25rem' }}>
                        <BlogSidebar 
                            slugAtual={post.slug} 
                            categorias={categoriasSidebar} 
                            recentes={recentesSidebar} 
                        />
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    )
}

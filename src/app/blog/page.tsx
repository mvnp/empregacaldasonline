import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSidebar from '@/components/BlogSidebar'
import BlogCard from '@/components/BlogCard'
import BannerSpace from '@/components/publicidade/BannerSpace'
import { createAdminClient } from '@/lib/supabase'
import { getCategoriaColor } from '@/data/blog'

export const metadata = {
    title: 'Blog — Dicas de Carreira e Mercado de Trabalho',
    description: 'Artigos sobre carreira, currículo, entrevistas e tendências do mercado. Conteúdo para quem quer crescer profissionalmente.',
}

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
    const pageSize = 5;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createAdminClient();

    // Fetch featured post
    const { data: destaques, error: errorDestaque } = await supabase
        .from('blog_posts')
        .select(`
            *,
            blog_post_images(url),
            blog_post_categories(blog_categories(name))
        `)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1);

    if (errorDestaque) {
        console.error("Erro Destaque:", errorDestaque)
    }

    let destaqueRaw = (destaques as any[])?.[0];

    // Fetch other posts with pagination
    let listQuery = supabase
        .from('blog_posts')
        .select(`
            *,
            blog_post_images(url),
            blog_post_categories(blog_categories(name))
        `, { count: 'exact' });

    if (destaqueRaw) {
        listQuery = listQuery.neq('id', destaqueRaw.id);
    }

    const { data: pagePosts, count, error: errorList } = await listQuery
        .order('published_at', { ascending: false })
        .range(from, to);

    if (errorList) {
        console.error("Erro Listagem:", errorList)
    }

    let isFallbackDestaque = false;
    // Se não achou destaque explicitly da primeira busca
    if (!destaqueRaw && pagePosts && pagePosts.length > 0) {
        destaqueRaw = pagePosts[0];
        isFallbackDestaque = true;
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 1;

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

    const mapPost = (p: any) => ({
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

    const postDestaque = destaqueRaw ? mapPost(destaqueRaw) : null;
    let demaisPostsRaw = pagePosts || [];
    if (isFallbackDestaque) {
        demaisPostsRaw = demaisPostsRaw.slice(1);
    }
    const demaisPosts = demaisPostsRaw.map(mapPost);

        // ... fetch para sidebar (categorias e recentes) ... //
        const { data: catData } = await supabase
            .from('blog_categories')
            .select(`name, blog_post_categories(count)`)

        const { data: recData } = await supabase
            .from('blog_posts')
            .select(`
                id, slug, title, published_at, reading_time,
                blog_post_images(url)
            `)
            .order('published_at', { ascending: false })
            .limit(4)

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

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Navbar variant="solid" />

            {/* ── Banner da página ── */}
            <div style={{ background: '#09355F', padding: '3rem 0 3.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
                    <nav className="breadcrumb" style={{ marginBottom: '1.25rem' }}>
                        <Link href="/">Início</Link>
                        <span className="breadcrumb-sep"><ChevronRight style={{ width: 13, height: 13 }} /></span>
                        <span className="breadcrumb-current">Blog</span>
                    </nav>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
                        Blog & <span style={{ color: '#FBBF53' }}>Carreira</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', maxWidth: 520 }}>
                        Dicas, tendências e estratégias para impulsionar sua carreira e se destacar no mercado de trabalho.
                    </p>
                </div>
            </div>

            {/* ── Conteúdo principal ── */}
            <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>
                <div className="content-sidebar-grid">

                    {/* Coluna esquerda */}
                    <div>
                        {postDestaque && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <BlogCard post={postDestaque} grande />
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', whiteSpace: 'nowrap' }}>Mais artigos</h2>
                            <div style={{ flex: 1, height: 1, background: '#e8edf5' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {demaisPosts.map((post: any, i: number) => (
                                <React.Fragment key={post.id}>
                                    <BlogCard post={post} />
                                    {i === 1 && <BannerSpace formato="native" className="ad-native-blog" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Banner Leaderboard acima da paginação */}
                        <BannerSpace formato="leaderboard" style={{ margin: '2rem 0 0' }} />

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', paddingTop: '2rem' }}>
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const p = i + 1;
                                    // limit pagination buttons to 5 around current page
                                    if (p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)) {
                                        return (
                                            <Link key={p} href={`/blog?page=${p}`}>
                                                <button className={`page-btn ${p === page ? 'active' : ''}`}>{p}</button>
                                            </Link>
                                        );
                                    } else if (p === page - 3 || p === page + 3) {
                                        return <span key={p} style={{ padding: '0.5rem' }}>...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar direita */}
                    <aside>
                        <BlogSidebar 
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

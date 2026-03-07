import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSidebar from '@/components/BlogSidebar'
import BlogCard from '@/components/BlogCard'

import { BLOG_POSTS } from '@/data/blog'

export const metadata = {
    title: 'Blog — Dicas de Carreira e Mercado de Trabalho',
    description: 'Artigos sobre carreira, currículo, entrevistas e tendências do mercado. Conteúdo para quem quer crescer profissionalmente.',
}

export default function BlogListPage() {
    const [postDestaque, ...demaisPosts] = BLOG_POSTS

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

                    {/* Coluna esquerda */}
                    <div>
                        {/* Post destaque — card grande */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <BlogCard post={postDestaque} grande />
                        </div>

                        {/* Divisor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09355F', whiteSpace: 'nowrap' }}>Mais artigos</h2>
                            <div style={{ flex: 1, height: 1, background: '#e8edf5' }} />
                        </div>

                        {/* Lista compacta */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {demaisPosts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>

                        {/* Paginação */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', paddingTop: '2rem' }}>
                            {[1, 2, 3].map(p => (
                                <button key={p} className={`page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar direita */}
                    <aside style={{ position: 'sticky', top: '1.25rem' }}>
                        <BlogSidebar />
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    )
}

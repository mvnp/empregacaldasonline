import { createAdminClient } from '@/lib/supabase'
import BlogAdminClient from './BlogAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
    const supabase = createAdminClient()

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select(`
            id,
            title,
            slug,
            published_at,
            reading_time,
            featured,
            author_name,
            blog_post_categories(blog_categories(name))
        `)
        .order('published_at', { ascending: false })

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Erro ao buscar posts: {error.message} <br/> {JSON.stringify(error)}</div>
    }

    const mappedPosts = ((posts as any[]) || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.blog_post_categories?.[0]?.blog_categories?.name || 'Geral',
        author: p.author_name || 'Desconhecido',
        publishedAt: p.published_at,
        featured: p.featured,
        readingTime: p.reading_time
    }))

    return <BlogAdminClient posts={mappedPosts} />
}

import { createAdminClient } from '@/lib/supabase'
import BlogFormClient from './BlogFormClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminBlogFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const isNew = id === 'novo'

    let post = null
    let categories = []

    const supabase = createAdminClient()

    // Fetch categories for select
    const { data: cats } = await supabase.from('blog_categories').select('id, name').order('name')
    categories = cats || []

    if (!isNew) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                blog_post_images(url),
                blog_post_categories(category_id)
            `)
            .eq('id', id)
            .single()

        if (!error && data) {
            const d = data as any;
            post = {
                id: d.id,
                title: d.title,
                slug: d.slug,
                excerpt: d.excerpt,
                content: d.content,
                tags: d.tags?.join(', ') || '',
                authorName: d.author_name || '',
                authorRole: d.author_role || '',
                readingTime: d.reading_time || 5,
                featured: d.featured || false,
                imageUrl: d.blog_post_images?.[0]?.url || '',
                categoryId: d.blog_post_categories?.[0]?.category_id || ''
            }
        } else {
            redirect('/admin/blog')
        }
    }

    return <BlogFormClient data={post} categories={categories} />
}

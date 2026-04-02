'use server'

import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

// Salva o arquivo de imagem localmente e retorna o caminho
async function salvarImagemLocal(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Pegar extensão original
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `blog_${Date.now()}_${crypto.randomUUID().split('-')[0]}.${ext}`

    // Certificar de que a pasta existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog')
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    return `/uploads/blog/${fileName}`
}

export async function salvarPostBlog(formData: FormData) {
    try {
        const admin = createAdminClient()

        const id = formData.get('id') as string | null
        const isNew = !id || id === 'novo'

        const title = formData.get('title') as string
        const slug = formData.get('slug') as string
        const categoryId = formData.get('categoryId') as string
        const excerpt = formData.get('excerpt') as string
        const content = formData.get('content') as string
        const tagsRaw = formData.get('tags') as string
        const authorName = formData.get('authorName') as string
        const authorRole = formData.get('authorRole') as string
        const readingTime = parseInt(formData.get('readingTime') as string) || 5
        const featured = formData.get('featured') === 'true'
        
        let imageUrl = formData.get('imageUrl') as string // URL existente
        const imgFile = formData.get('imagemArquivo') as File | null

        // 1. Upload da Nova Imagem (se houver)
        if (imgFile && imgFile.size > 0 && imgFile.name !== 'undefined') {
            imageUrl = await salvarImagemLocal(imgFile)
        }

        // 2. Tratar array de tags
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)

        let postId = id

        // 3. Salvar na Tabela blog_posts
        const postPayload = {
            title,
            slug,
            excerpt,
            content,
            tags,
            author_name: authorName,
            author_role: authorRole,
            reading_time: readingTime,
            featured
        }

        if (isNew) {
            const { data, error } = await admin.from('blog_posts').insert({
                ...postPayload,
                published_at: new Date().toISOString()
            } as any).select('id').single() as any

            if (error) throw error
            postId = data.id
        } else {
            const { error } = await admin.from('blog_posts').update(postPayload as any).eq('id', postId as string)
            if (error) throw error
        }

        // 4. Salvar Relacionamento Categoria (Limpa a antiga e substitui)
        if (postId && categoryId) {
            await admin.from('blog_post_categories').delete().eq('post_id', postId as string)
            await admin.from('blog_post_categories').insert({ post_id: postId, category_id: categoryId } as any)
        }

        // 5. Salvar / Atualizar Imagem
        if (postId && imageUrl) {
            // Verifica se a imagem já existe no banco
            const { data: bpi } = await admin.from('blog_post_images').select('id').eq('post_id', postId as string).single() as any
            if (bpi) {
                await admin.from('blog_post_images').update({ url: imageUrl } as any).eq('id', bpi.id)
            } else {
                await admin.from('blog_post_images').insert({ post_id: postId, url: imageUrl, featured: true } as any)
            }
        }

        revalidatePath('/blog')
        revalidatePath('/admin/blog')

        return { success: true, postId }
    } catch (error: any) {
        console.error("Erro em salvarPostBlog:", error)
        return { success: false, error: error.message }
    }
}

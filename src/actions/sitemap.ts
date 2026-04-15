'use server'

import { revalidatePath } from 'next/cache'

export async function gerarSitemapAction() {
    try {
        // Agora que usamos uma rota dinâmica (/sitemap.xml/route.ts),
        // não precisamos mais gravar um arquivo físico.
        // Basta disparar a revalidação do cache para garantir que a rota mostre dados novos.
        
        revalidatePath('/sitemap.xml')
        revalidatePath('/')
        revalidatePath('/vagas')

        return { success: true, message: 'Cache do Sitemap atualizado! Acesse seu-site.com/sitemap.xml para ver.' }
    } catch (error: any) {
        console.error('Erro ao atualizar sitemap:', error)
        return { success: false, error: error.message }
    }
}

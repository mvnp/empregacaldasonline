'use server'

import { createAdminClient } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function gerarSitemapAction() {
    try {
        const admin = createAdminClient()
        
        // 1. Buscar Vagas
        const { data: vagas, error: vError } = await admin
            .from('vagas')
            .select('id, updated_at')
            .eq('status', 'ativa')
            .order('updated_at', { ascending: false })

        if (vError) throw new Error('Erro ao buscar vagas: ' + vError.message)

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://empregacaldas.online'
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/vagas</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>`

        // Add Vagas
        vagas?.forEach(vaga => {
            xml += `
  <url>
    <loc>${baseUrl}/vagas/${vaga.id}</loc>
    <lastmod>${new Date(vaga.updated_at || new Date()).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`
        })

        xml += `
</urlset>`

        const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml')
        fs.writeFileSync(publicPath, xml, 'utf8')

        return { success: true, message: 'Sitemap gerado com sucesso em ' + new Date().toLocaleTimeString() }
    } catch (error: any) {
        console.error('Erro ao gerar sitemap:', error)
        return { success: false, error: error.message }
    }
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const revalidate = 21600 // Revalida a cada 6 horas (mesma lógica solicitada)

export async function GET() {
    try {
        const admin = createAdminClient()
        
        // 1. Buscar Vagas
        const { data: vagas } = await admin
            .from('vagas')
            .select('id, updated_at')
            .eq('status', 'ativa')
            .order('updated_at', { ascending: false }) as { data: any[] | null }

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
        vagas?.forEach((vaga: any) => {
            xml += `
  <url>
    <loc>${baseUrl}/vagas/${vaga.id}</loc>
    <lastmod>${new Date(vaga.updated_at || new Date()).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`
        })

        xml += `
</urlset>`

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600'
            }
        })
    } catch (error: any) {
        console.error('Erro ao servir sitemap:', error)
        return new NextResponse('Erro ao gerar sitemap', { status: 500 })
    }
}

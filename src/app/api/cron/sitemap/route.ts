import { NextResponse } from 'next/server'
import { gerarSitemapAction } from '@/actions/sitemap'

// Esta rota pode ser chamada por um serviço de cron externo (ex: GitHub Actions, Vercel Cron, ou node-cron no próprio server)
export async function GET(request: Request) {
    // Opcional: Verificar uma chave de API simples para evitar abusos
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    // Se quiser segurança descomente abaixo e coloque no .env SITEMAP_CRON_KEY
    // if (key !== process.env.SITEMAP_CRON_KEY) {
    //     return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const result = await gerarSitemapAction()
    
    if (result.success) {
        return NextResponse.json({ message: 'Sitemap gerado automaticamente', time: new Date().toISOString() })
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 })
    }
}

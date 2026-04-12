import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const formato = searchParams.get('formato')
    if (!formato) return NextResponse.json({ error: 'Formato missing' }, { status: 400 })

    const supabase = createAdminClient()

    // Check Global Config
    const { data: configData } = await supabase
        .from('portal_config')
        .select('valor')
        .eq('chave', 'publicidade_global')
        .single()

    const isActiveGlobal = (configData as any)?.valor?.ativo !== false
    if (!isActiveGlobal) return NextResponse.json({ active: false, debug: { error: 'Global inactive', configData } })

    // Fetch Active Ads matching the format
    const { data: adsData, error } = await supabase.from('empresa_pub_imagens')
        .select(`
            id,
            arquivo_url,
            pub:empresa_pubs!inner(
                id,
                empresa_id,
                empresas ( nome_fantasia ),
                link_destino,
                status,
                data_inicio,
                data_fim
            )
        `)
        .eq('formato', formato)
        .eq('pub.status', 'ativo')

    if (error || !adsData || adsData.length === 0) {
        return NextResponse.json({ active: false, debug: { error: 'No active pub records from DB', dbError: error, adsDataLength: adsData?.length } })
    }

    const now = new Date();
    const activeAds = adsData.filter((ad: any) => {
        if (!ad.pub) return false;
        const inicio = new Date(ad.pub.data_inicio);
        const fim = new Date(ad.pub.data_fim);
        // Ajustar 'fim' para o final do dia
        fim.setHours(23, 59, 59, 999);
        
        return now >= inicio && now <= fim;
    });

    if (activeAds.length === 0) return NextResponse.json({ active: false, debug: { error: 'No active ads after date filtering', now, adsData } })

    const randomIndex = Math.floor(Math.random() * activeAds.length)
    const ad = activeAds[randomIndex]

    return NextResponse.json({ active: true, ad })
}

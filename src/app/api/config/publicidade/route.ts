import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'

// Get Status
export async function GET() {
    try {
        const admin = await requireAdmin()
        const { data, error } = await (admin.from('portal_config') as any)
            .select('valor')
            .eq('chave', 'publicidade_global')
            .single()

        if (!error && data?.valor) {
            return NextResponse.json(data.valor)
        }
    } catch (e) {
        // Ignora erro e cai no default
    }
    return NextResponse.json({ ativo: true })
}

// Set Status
export async function POST(req: Request) {
    try {
        const admin = await requireAdmin()
        const { ativo } = await req.json()
        
        const { error } = await (admin.from('portal_config') as any)
            .upsert(
                { chave: 'publicidade_global', valor: { ativo }, updated_at: new Date().toISOString() },
                { onConflict: 'chave' }
            )

        if (error) throw error
        return NextResponse.json({ success: true, ativo })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Erro ao salvar' }, { status: 500 })
    }
}

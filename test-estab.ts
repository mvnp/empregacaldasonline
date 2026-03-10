import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
    const { data: cols } = await supabase.from('_estabelecimentos').select('cnae_fiscal_principal').limit(5).not('cnae_fiscal_principal', 'is', null)
    console.log(cols)
}
test()

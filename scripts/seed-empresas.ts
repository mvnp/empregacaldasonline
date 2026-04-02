import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const SETORES = ['Tecnologia', 'Saúde', 'Finanças', 'Educação', 'Varejo', 'Logística']
const TAMANHOS = ['1-10', '11-50', '51-200', '201-500', '500+']
const TECNOLOGIAS = ['TypeScript', 'Python', 'AWS', 'Figma', 'MongoDB', 'React', 'Node.js', 'Go', 'Docker']
const BENEFICIOS = ['Vale Transporte', 'Vale Refeição', 'Plano Odontológico', 'Plano de Saúde', 'Day Off no Aniversário', 'PLR', 'Auxílio Home Office', 'Gympass']

function sample(arr: any[], count: number) {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, count)
}

async function seed() {
    console.log(`\n🌱 Iniciando seed de Empresas...`)

    // 1. Obter todas as vagas para capturar as empresas listadas em formato de texto.
    const { data: vagas, error: vagasErr } = await supabase.from('vagas').select('id, empresa, local')
    if (vagasErr || !vagas) {
        console.error('❌ Falha ao buscar vagas:', vagasErr?.message)
        process.exit(1)
    }

    // Criar um Set único das empresas ativas baseadas na coluna de texto antiga 'empresa'
    const mapaEmpresas = new Map<string, string>() // NOME -> LOCAL
    for (const v of vagas) {
        if (!mapaEmpresas.has(v.empresa) && v.empresa) {
            mapaEmpresas.set(v.empresa, v.local || 'Local não informado')
        }
    }

    const nomesEmpresasDuplicadas = Array.from(mapaEmpresas.keys())
    console.log(`👉 Encontradas ${nomesEmpresasDuplicadas.length} empresas únicas (texto) registradas nas vagas.`)

    const runId = Date.now().toString().slice(-4)

    let num = 1
    for (const [nomeOriginal, local] of mapaEmpresas.entries()) {
        const slug = nomeOriginal.toLowerCase().replace(/[^a-z0-9]/g, '')
        const email = `rh@${slug}${runId}.com.br`

        // A. Criar auth user
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: { nome: nomeOriginal, tipo: 'empregador' }
        })

        if (authErr || !authUser?.user) {
            console.error(`❌ Erro auth para ${email}:`, authErr?.message)
            continue
        }

        const authId = authUser.user.id

        // B. Criar em public.users
        const ddd = 10 + (num % 80)
        const fone = `(12) 3001-${Math.floor(1000 + Math.random() * 8999)}`
        
        const { data: publicUser, error: pubErr } = await supabase.from('users').insert({
            auth_id: authId,
            tipo: 'empregador',
            nome: nomeOriginal,
            email,
            telefone: fone,
            status: 'ativo'
        }).select('id').single()

        if (pubErr || !publicUser) {
            console.error(`❌ Erro public.users para ${email}:`, pubErr?.message)
            continue
        }

        const userId = publicUser.id

        // C. Criar a Empresa Real!
        const fundacao = 2000 + Math.floor(Math.random() * 20)
        const cnpj = `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`
        
        const setor = SETORES[num % SETORES.length]
        const tamanho = TAMANHOS[num % TAMANHOS.length]
        
        const descricao = `A ${nomeOriginal} é uma empresa líder no setor de ${setor}, com sede em ${local}. Com um time de ${tamanho} colaboradores, trabalhamos com as mais modernas tecnologias para entregar soluções inovadoras ao mercado. Nosso objetivo é transformar o futuro através de produtos e serviços de alta qualidade.`

        const { data: empresaDb, error: empErr } = await supabase.from('empresas').insert({
            user_id: userId,
            nome_fantasia: nomeOriginal,
            razao_social: `${nomeOriginal} S.A.`,
            cnpj,
            setor,
            tamanho_empresa: tamanho,
            fundacao_ano: fundacao,
            descricao,
            local,
            logradouro: 'Avenida Brasil',
            numero: String(Math.floor(100 + Math.random() * 900)),
            bairro: 'Jardins',
            email_contato: email,
            telefone: fone,
            website: `https://www.${slug}.com.br`,
            linkedin: `https://linkedin.com/company/${slug}`,
            status: num % 7 === 0 ? 'inativa' : 'ativa' 
        }).select('id').single()

        if (empErr || !empresaDb) {
            console.error(`❌ Erro criar empresa ${nomeOriginal}:`, empErr?.message)
            continue
        }

        const eId = empresaDb.id

        // D. Inserir Tecnologias (Relacionamento N:N / 1:N mock)
        const tecs = sample(TECNOLOGIAS, 4).map((t, idx) => ({ empresa_id: eId, texto: t, ordem: idx }))
        await supabase.from('empresa_tecnologias').insert(tecs)

        // E. Inserir Benefícios
        const bens = sample(BENEFICIOS, 4).map((b, idx) => ({ empresa_id: eId, texto: b, ordem: idx }))
        await supabase.from('empresa_beneficios').insert(bens)

        // F. ATUALIZAR AS VAGAS CRIADAS ANTERIORMENTE COM ESSE NOVO ID
        const { error: updErr } = await supabase.from('vagas')
            .update({ empresa_id: eId })
            .eq('empresa', nomeOriginal) // linka via texto existente

        if (updErr) {
            console.error(`⚠️ Erro ao atualizar empresa_id nas vagas da ${nomeOriginal}:`, updErr.message)
        }
        
        console.log(`✅ [${num}/${nomesEmpresasDuplicadas.length}] Empresa "${nomeOriginal}" migrada e atribuída às vagas!`)
        num++
    }
    
    console.log('\n🎉 Seed de empresas concluído com sucesso e todas as Vagas foram atualizadas com o ID de Empresa relacional!\n')
}

seed().catch(console.error)

/**
 * seed-candidatos.ts
 * Insere 80 candidatos mock no banco Supabase.
 */

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

const _NOMES = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Lima', 'Fernanda Rocha', 'Lucas Souza', 'Carla Mendes', 'Rafael Alves', 'Beatriz Ferreira', 'Gabriel Martins', 'Juliana Oliveira', 'Marcos Ribeiro', 'Patricia Gomes', 'Thiago Barbosa', 'Camila Nascimento', 'Bruno Pereira', 'Larissa Cardoso', 'Felipe Araújo', 'Amanda Duarte', 'Roberto Vieira', 'Isabela Moreira', 'Diego Castro', 'Letícia Correia', 'André Teixeira', 'Vanessa Pinto', 'Gustavo Lopes', 'Renata Dias', 'Eduardo Nunes', 'Daniela Freitas', 'Matheus Santos', 'Cristina Reis', 'Leonardo Azevedo', 'Priscila Melo', 'Rodrigo Monteiro', 'Aline Campos', 'Victor Hugo', 'Sabrina Costa', 'Henrique Lima', 'Natália Souza', 'Caio Fernandes']
const _CARGOS = ['Desenvolvedor Front-End', 'Desenvolvedor Back-End', 'Full-Stack Developer', 'UX Designer', 'Product Manager', 'Analista de Dados', 'DevOps Engineer', 'QA Analyst', 'Scrum Master', 'Tech Lead', 'Designer Gráfico', 'Analista de Marketing', 'Gerente de Projetos', 'Arquiteto de Software', 'Analista de RH']
const _CIDADES = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Florianópolis, SC', 'Porto Alegre, RS', 'Brasília, DF', 'Recife, PE', 'Salvador, BA', 'Campinas, SP']
const _EXPERIENCIAS = ['1 ano', '2 anos', '3 anos', '4 anos', '5 anos', '6+ anos', '8+ anos', '10+ anos']
const _HABILIDADES_POOL = ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Figma', 'SQL', 'MongoDB', 'Git', 'Scrum', 'Next.js', 'Tailwind', 'GraphQL', 'Kubernetes', 'Go', 'Vue.js', 'Angular', 'PostgreSQL']

async function seed() {
    console.log(`\n🌱 Iniciando seed de 80 candidatos...`)
    
    // Sufixo aleatório para garantir e-mails únicos a cada execução
    const runId = Date.now().toString().slice(-4)

    for (let i = 0; i < 80; i++) {
        const nomeIdx = i % _NOMES.length
        const variant = Math.floor(i / _NOMES.length)
        const nomeCompleto = _NOMES[nomeIdx] + (variant > 0 ? ` ${variant}` : '')
        
        const partes = nomeCompleto.split(' ')
        const nome = partes[0]
        const sobrenome = partes.slice(1).join(' ')
        const email = `candidato_${runId}_${i+1}@mock.com`
        
        // 1. Criar usuário na tabela auth.users do Supabase
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: { nome, sobrenome }
        })

        if (authErr || !authUser?.user) {
            console.error(`❌ Erro auth para ${email}:`, authErr?.message)
            continue
        }

        const authId = authUser.user.id

        // 2. Criar registro na tabela public.users
        const ddd = 10 + (i % 80)
        const numTelefone = `9${Math.floor(8000 + Math.random()*1999)}-${Math.floor(1000 + Math.random()*8999)}`

        const { data: publicUser, error: pubErr } = await supabase.from('users').insert({
            auth_id: authId,
            tipo: 'candidato',
            nome,
            sobrenome,
            email,
            telefone: `(${ddd}) ${numTelefone}`,
            status: 'ativo'
        }).select('id').single()

        if (pubErr || !publicUser) {
            console.error(`❌ Erro public.users para ${email}:`, pubErr?.message)
            continue
        }

        const userId = publicUser.id

        // 3. Criar registro na tabela candidatos
        const cargo = _CARGOS[i % _CARGOS.length]
        const local = _CIDADES[i % _CIDADES.length]
        const experiencia = _EXPERIENCIAS[i % _EXPERIENCIAS.length]
        
        const anoNasc = 1980 + (i % 20)
        const mesNasc = String(1 + (i % 12)).padStart(2, '0')
        const diaNasc = String(1 + (i % 28)).padStart(2, '0')
        
        const salarioBase = 3000 + (Math.floor(i / 10) * 1000)

        const { data: candRow, error: candErr } = await supabase.from('candidatos').insert({
            user_id: userId,
            nome_completo: nomeCompleto,
            cargo_desejado: cargo,
            resumo: `Profissional ${cargo} com ${experiencia} de experiência no mercado de tecnologia. Apaixonado por criar soluções inovadoras e colaborar com equipes multidisciplinares.`,
            local,
            data_nascimento: `${anoNasc}-${mesNasc}-${diaNasc}`,
            email,
            telefone: `(15) 3004-${1000 + i}`,
            whatsapp: `(15) 98004-${2000 + i}`,
            linkedin: `https://linkedin.com/in/${nomeCompleto.toLowerCase().replace(/ /g, '-')}`,
            github: `https://github.com/${nome.toLowerCase()}${sobrenome.toLowerCase().replace(/ /g, '')}`,
            disponivel: i % 10 !== 0,
            pretensao_min: salarioBase,
            pretensao_max: salarioBase + 3000,
            status: 'ativo'
        }).select('id').single()

        if (candErr || !candRow) {
            console.error(`❌ Erro candidatos para ${email}:`, candErr?.message)
            continue
        }

        const candId = candRow.id

        // 4. Inserir itens relacionais (habilidades, experiências, formações, idiomas e documentos)
        
        // a) Habilidades
        const habilidades = [
            { candidato_id: candId, texto: _HABILIDADES_POOL[(i * 3) % _HABILIDADES_POOL.length], ordem: 0 },
            { candidato_id: candId, texto: _HABILIDADES_POOL[(i * 3 + 1) % _HABILIDADES_POOL.length], ordem: 1 },
            { candidato_id: candId, texto: _HABILIDADES_POOL[(i * 3 + 2) % _HABILIDADES_POOL.length], ordem: 2 }
        ]
        const p1 = supabase.from('candidato_habilidades').insert(habilidades)
        
        // b) Experiências
        const p2 = supabase.from('candidato_experiencias').insert([
            {
                candidato_id: candId,
                cargo: cargo,
                empresa: ['TechBrasil Ltda.', 'StartupX', 'Grupo Expansão', 'DataCorp', 'CloudTech', 'InnovateBR'][i % 6],
                descricao: 'Desenvolvimento e manutenção da plataforma principal, participando de code reviews e plannings diárias.',
                data_inicio: '2023-01-10',
                em_andamento: true,
                ordem: 0
            },
            {
                candidato_id: candId,
                cargo: `${cargo} Júnior`,
                empresa: 'MaxSoft',
                descricao: 'Desenvolvimento de interfaces responsivas e integração com APIs REST. Participação em code reviews e implementação de testes unitários e de integração.',
                data_inicio: '2021-03-15',
                data_fim: '2023-01-05',
                em_andamento: false,
                ordem: 1
            }
        ])

        // c) Formações
        const p3 = supabase.from('candidato_formacoes').insert([
            {
                candidato_id: candId,
                curso: ['Administração', 'Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação', 'Design Gráfico'][i % 5],
                instituicao: ['PUC-SP', 'USP', 'UFMG', 'UFRJ', 'FIAP'][i % 5],
                grau: 'Graduação',
                data_inicio: '2014-02-01',
                data_fim: '2018-12-15',
                em_andamento: false,
                ordem: 0
            },
            {
                candidato_id: candId,
                curso: 'Cloud Computing',
                instituicao: 'MIT OpenCourseWare',
                grau: 'Pós-Graduação',
                data_inicio: '2019-01-10',
                data_fim: '2020-05-20',
                em_andamento: false,
                ordem: 1
            },
            {
                candidato_id: candId,
                curso: 'Kubernetes Administrator',
                instituicao: 'CNCF',
                grau: 'Certificação',
                data_inicio: '2024-01-01',
                data_fim: '2024-01-01', // Pode representar a data de conclusão
                em_andamento: false,
                ordem: 2
            }
        ])

        // d) Idiomas
        const p4 = supabase.from('candidato_idiomas').insert([
            { candidato_id: candId, idioma: 'Português', nivel: 'nativo', ordem: 0 },
            { candidato_id: candId, idioma: 'Inglês', nivel: ['intermediario', 'avancado', 'fluente'][i % 3], ordem: 1 }
        ])

        // e) Documentos
        const slugNome = nomeCompleto.toLowerCase().replace(/ /g, '_')
        const p5 = supabase.from('candidato_documentos').insert([
            { candidato_id: candId, titulo: `curriculo_${slugNome}.pdf`, tipo: 'pdf', url: 'mock_url', ordem: 0 },
            { candidato_id: candId, titulo: 'certificado_graduacao.pdf', tipo: 'pdf', url: 'mock_url', ordem: 1 },
            { candidato_id: candId, titulo: 'portfolio.pdf', tipo: 'pdf', url: 'mock_url', ordem: 2 },
            { candidato_id: candId, titulo: 'certificados_cursos.zip', tipo: 'zip', url: 'mock_url', ordem: 3 }
        ])

        const resAll = await Promise.all([p1, p2, p3, p4, p5])
        for(let j=0; j<resAll.length; j++) {
            if (resAll[j].error) console.error(`   ⚠️ erro em itens relacionais [${j}]: ${resAll[j].error?.message}`)
        }

        console.log(`✅ [${i + 1}/80] Candidato "${nomeCompleto}" inserido com sucesso.`)
    }

    console.log('\n🎉 Seed de candidatos concluído com sucesso!\n')
}

seed().catch(console.error)

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────
export interface BlogPost {
    id: string
    slug: string
    titulo: string
    resumo: string
    conteudo: string          // Texto completo (blocos separados por \n\n)
    imagemCapa: string        // Caminho público da imagem
    categoria: string
    tags: string[]
    autor: AutorPost
    dataPublicacao: string    // ISO date
    tempoLeitura: number      // Em minutos
    destaque: boolean
}

export interface AutorPost {
    nome: string
    cargo: string
    avatar: string            // Inicial ou URL futura
}

// ─────────────────────────────────────────────────────────────
// Categorias do blog
// ─────────────────────────────────────────────────────────────
export const BLOG_CATEGORIAS = [
    { nome: 'Carreira', contagem: 12 },
    { nome: 'Currículo', contagem: 8 },
    { nome: 'Entrevista', contagem: 6 },
    { nome: 'Mercado de Trabalho', contagem: 9 },
    { nome: 'Dicas & Tendências', contagem: 5 },
]

// ─────────────────────────────────────────────────────────────
// Mock: posts do blog
// ─────────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'como-fazer-curriculo-perfeito',
        titulo: 'Como fazer um currículo que chama atenção dos recrutadores',
        resumo: 'Descubra as estratégias que os profissionais de RH usam para selecionar candidatos e como montar um currículo que passa pelas triagens automáticas e chega às mãos de quem decide.',
        conteudo: `O currículo é o seu cartão de visitas no mercado de trabalho. Em média, um recrutador leva apenas 7 segundos para decidir se vai continuar lendo ou passar para o próximo candidato. Por isso, cada detalhe conta.

Antes de começar a escrever, você precisa entender para quem está escrevendo. Pesquise a empresa, leia a descrição da vaga com atenção e identifique as palavras-chave que se repetem. Sistemas de rastreamento de candidatos (ATS) filtram currículos por palavras-chave antes de chegarem a qualquer humano — use isso a seu favor.

## Estrutura ideal

A ordem dos elementos importa. Coloque no topo aquilo que é mais relevante para a vaga. Para profissionais com experiência, priorize histórico de trabalho. Para quem está iniciando, destaque projetos acadêmicos e habilidades técnicas.

Um currículo eficaz deve conter: dados de contato atualizados, objetivo profissional (opcional, mas útil para reposicionamentos), experiências em ordem cronológica inversa, formação acadêmica, habilidades técnicas e certificações relevantes.

## Erros que comprometem sua candidatura

Evite textos genéricos como "proativo, dinâmico e orientado a resultados". Esses termos perderam completamente o significado. Prefira exemplos concretos: "Aumentei as vendas em 35% no primeiro trimestre ao implementar nova estratégia de captação."

Números vendem. Sempre que possível, quantifique suas conquistas. Clientes atendidos, projetos entregues, economias geradas — dados concretos criam credibilidade imediata.

## Formatação que impressiona

Use no máximo 2 páginas. Fonte limpa (Inter, Calibri, Arial), tamanho 10-12pt, espaçamento adequado. Evite tabelas e caixas de texto se for enviar como Word — o ATS não consegue ler esses elementos corretamente.

Salve sempre em PDF para garantir que a formatação seja preservada em qualquer dispositivo.

## Currículo adaptado é currículo aceito

Não existe currículo universal. Para cada vaga relevante, adapte o documento. Releia a JD (job description), ajuste o objetivo, reorganize habilidades e destaque as experiências mais alinhadas.

Esse trabalho extra pode parecer excessivo, mas a diferença na taxa de retorno é significativa. Candidatos que personalizam seus currículos têm 3x mais chances de passar para a entrevista.`,
        imagemCapa: '/blog-resume.png',
        categoria: 'Currículo',
        tags: ['currículo', 'RH', 'carreira', 'ATS', 'candidatura'],
        autor: { nome: 'Ana Paula Costa', cargo: 'Especialista em RH', avatar: 'A' },
        dataPublicacao: '2026-03-04',
        tempoLeitura: 6,
        destaque: true,
    },
    {
        id: '2',
        slug: 'mercado-tech-2026-tendencias',
        titulo: 'Mercado de tecnologia em 2026: as tendências que vão definir contratações',
        resumo: 'IA generativa, cibersegurança e cloud computing lideram as buscas dos recrutadores. Saiba quais habilidades estão em alta e como se preparar para as vagas mais concorridas do setor.',
        conteudo: `O setor de tecnologia continua sendo o mais aquecido do mercado de trabalho, apesar das demissões em massa que dominaram as manchetes de 2023 e 2024. Em 2026, o quadro mudou: empresas voltaram a contratar, mas com critérios mais seletivos e foco em habilidades muito específicas.

## Inteligência Artificial muda o perfil das vagas

A IA generativa não eliminou empregos — ela redisribuiu competências. Profissionais que sabem trabalhar com ferramentas como Copilot, Claude e Gemini são mais valorizados do que nunca. O chamado "prompt engineering" deixou de ser nicho e passou a ser requisito básico em muitas funções.

Desenvolvedores que dominam integração com LLMs (Large Language Models) via API estão entre os mais procurados do mercado. Salários para essas posições chegam a 40% acima da média do setor.

## Cibersegurança: déficit histórico de talentos

Com ataques cibernéticos em crescimento exponencial, o mercado sofre com escassez grave de profissionais qualificados. Analistas de SOC (Security Operations Center), especialistas em pentest e arquitetos de segurança em cloud estão com carteira cheia de propostas.

Certificações como CompTIA Security+, CISSP e CEH nunca foram tão valorizadas. A boa notícia: há excelentes bootcamps e trilhas de aprendizado acessíveis para quem quer migrar.

## Cloud e DevOps: o básico virou obrigatório

Conhecimento em AWS, Azure ou GCP deixou de ser diferencial — é requisito. A briga agora é entre quem tem certificação de nível Associate e quem tem de nível Professional.

DevOps e Platform Engineering continuam crescendo. Profissionais que entendem de Kubernetes, Terraform e GitOps estão em posição privilegiada nas negociações salariais.

## Como se preparar

Invista em projetos práticos. Um portfólio com contribuições no GitHub e projetos deployados vale mais do que 10 certificações teóricas. Participe de comunidades, hackathons e abra pull requests em projetos open source relevantes.

O mercado de 2026 recompensa quem aprende com velocidade e demonstra aplicação prática do conhecimento.`,
        imagemCapa: '/blog-career.png',
        categoria: 'Mercado de Trabalho',
        tags: ['tecnologia', 'IA', 'cloud', 'carreira tech', 'tendências'],
        autor: { nome: 'Carlos Mendes', cargo: 'Tech Recruiter Sênior', avatar: 'C' },
        dataPublicacao: '2026-03-06',
        tempoLeitura: 8,
        destaque: true,
    },
    {
        id: '3',
        slug: 'como-se-sair-bem-entrevista',
        titulo: '10 técnicas para se sair bem em qualquer entrevista de emprego',
        resumo: 'Da pesquisa prévia à comunicação corporal — as estratégias que candidatos bem-sucedidos usam para impressionar recrutadores e sair da entrevista confiantes.',
        conteudo: `A entrevista de emprego é parte arte, parte ciência. Candidatos preparados não confiam apenas no improviso — eles praticam respostas, pesquisam a empresa e chegam com histórias concretas para contar.

## 1. Pesquise antes de tudo

Antes de entrar na sala (ou clicar em "entrar" no Meets), saiba tudo sobre a empresa: modelo de negócio, clientes, concorrentes, cultura, últimas notícias. Essa pesquisa vai aparecer nas suas respostas de forma natural e vai impressionar.

## 2. Domine o método STAR

STAR é o framework para responder perguntas comportamentais: Situação, Tarefa, Ação e Resultado. "Me fale sobre um desafio que você superou" — responda com uma história real, estruturada nesse formato.

## 3. Prepare perguntas inteligentes

Ao final, o entrevistador vai perguntar se você tem dúvidas. Preparar 3-5 perguntas relevantes demonstra interesse genuíno. Pergunte sobre a equipe, os desafios do cargo, como o sucesso é medido.

## 4. Linguagem corporal conta

Postura ereta, contato visual adequado, gestos controlados. Sorria genuinamente. Em entrevistas online, olhe para a câmera (não para a tela) quando falar — isso cria sensação de contato direto.

## 5. Pratique em voz alta

Não apenas mentalize as respostas — fale em voz alta. Grave no celular e assista. Identificar tiques verbais ("né", "tipo", "hunm") e corrigir faz enorme diferença na percepção do entrevistador sobre sua comunicação.`,
        imagemCapa: '/blog-resume.png',
        categoria: 'Entrevista',
        tags: ['entrevista', 'técnicas', 'comunicação', 'STAR', 'preparação'],
        autor: { nome: 'Juliana Ramos', cargo: 'Coach de Carreira', avatar: 'J' },
        dataPublicacao: '2026-03-01',
        tempoLeitura: 5,
        destaque: false,
    },
    {
        id: '4',
        slug: 'salario-como-negociar',
        titulo: 'Como negociar salário sem medo: guia prático e objetivo',
        resumo: 'A maioria dos profissionais deixa dinheiro na mesa por não saber negociar. Aprenda as táticas que funcionam, o momento certo de trazer o assunto e como responder a argumentos do RH.',
        conteudo: `Negociar salário é uma das habilidades mais valiosas de carreira — e uma das menos praticadas. Estudos mostram que profissionais que negociam ganham em média R$ 5.000 a mais por ano do que os que aceitam a primeira oferta.

## Pesquise antes de pedir

Você precisa saber o que o mercado paga para sua experiência, localização e setor. Use sites como Glassdoor, Linkedin Salary e relatórios do setor. Chegar com dados concretos transforma a conversa: não é você pedindo um favor, é você apresentando um case.

## O momento certo

Evite trazer salário antes da empresa trocar o assunto. Se perguntarem cedo, redirecione: "Estou mais interessado em entender se há fit entre mim e a posição. Podemos explorar isso antes?" Na oferta formal, aí sim você negocia.

## Técnicas que funcionam

Peça acima do que aceita — isso cria espaço de negociação. Use silêncio a seu favor após fazer um pedido; quem fala primeiro tende a conceder mais. Negocie o pacote completo: salário, bônus, benefícios, flexibilidade, crescimento.

## Lidando com "não temos orçamento"

Explore alternativas: "Entendo. Poderíamos rever em 6 meses mediante performance?" ou "Existe possibilidade de ajuste nos benefícios?". Empresas que dizem "não temos orçamento" frequentemente têm — só precisam de justificativa interna.`,
        imagemCapa: '/blog-career.png',
        categoria: 'Carreira',
        tags: ['salário', 'negociação', 'carreira', 'remuneração'],
        autor: { nome: 'Roberto Alves', cargo: 'Head of People', avatar: 'R' },
        dataPublicacao: '2026-02-25',
        tempoLeitura: 7,
        destaque: false,
    },
    {
        id: '5',
        slug: 'trabalho-remoto-produtividade',
        titulo: 'Home office em 2026: como manter produtividade e saúde mental',
        resumo: 'Com o modelo híbrido consolidado, os desafios mudaram. Veja como montar uma rotina sustentável, separar vida pessoal e profissional e se destacar mesmo à distância.',
        conteudo: `O trabalho remoto deixou de ser exceção e virou política permanente em boa parte das empresas. Mas a adaptação ainda é desafio para muitos: 68% dos profissionais remotos relatam dificuldade em "desligar" ao fim do expediente.

## Rituais de início e fim de expediente

Sem o deslocamento físico, seu cérebro precisa de outros sinais para transitar entre modo trabalho e modo descanso. Crie rituais: uma caminhada, um café especial, a playlist que só toca no trabalho. Ao encerrar, feche o computador, arrume a mesa e declare mentalmente que o trabalho acabou.

## Ambiente físico importa muito

Você não precisa de um home office perfeito, mas precisa de um espaço dedicado. Mesmo que seja uma cadeira específica na sala, associe aquele lugar ao trabalho. Iluminação adequada, cadeira ergonômica e internet estável são investimentos que se pagam em produtividade e saúde.

## Visibilidade no trabalho remoto

Um dos maiores riscos do home office é a invisibilidade. Profissionais que não aparecem nas conversas, não compartilham atualizações e somem atrás da câmera tendem a ser esquecidos em promoções. Comunique seu trabalho ativamente: updates diários, participação nas reuniões, contribuições documentadas.

## Saúde mental em primeiro lugar

Estabeleça horários fixos, faça pausas reais (longe da tela), mantenha contatos sociais — virtuais ou presenciais. Se a empresa oferece benefícios de saúde mental como terapia ou Gympass, use. São investimentos que retornam em foco e energia.`,
        imagemCapa: '/blog-career.png',
        categoria: 'Dicas & Tendências',
        tags: ['home office', 'remote work', 'produtividade', 'saúde mental'],
        autor: { nome: 'Fernanda Lima', cargo: 'People Experience Manager', avatar: 'F' },
        dataPublicacao: '2026-02-20',
        tempoLeitura: 6,
        destaque: false,
    },
]

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
export function getBlogPost(slug: string): BlogPost | null {
    return BLOG_POSTS.find(p => p.slug === slug) ?? null
}

export function getPostsRecentes(limite = 4): BlogPost[] {
    return [...BLOG_POSTS]
        .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
        .slice(0, limite)
}

export function formatarDataBlog(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function getCategoriaColor(categoria: string): string {
    const map: Record<string, string> = {
        'Carreira': '#09355F',
        'Currículo': '#FE8341',
        'Entrevista': '#2AB9C0',
        'Mercado de Trabalho': '#FBBF53',
        'Dicas & Tendências': '#10b981',
    }
    return map[categoria] ?? '#09355F'
}

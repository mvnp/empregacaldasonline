"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Faltando variáveis de ambiente do Supabase.");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
const CATEGORIES = ['Carreira', 'Currículo', 'Entrevista', 'Mercado de Trabalho', 'Dicas & Tendências'];
const NUM_POSTS = 120;
const IMAGE_URL = '/blog-placeholder.png';
async function seed() {
    console.log('Iniciando seed do blog...');
    // Limpar dados existentes
    await supabase.from('blog_post_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('blog_post_categories').delete().neq('post_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('blog_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Criar categorias
    console.log('Criando categorias...');
    const categoriasInsert = CATEGORIES.map(name => ({
        name,
        slug: name.toLowerCase().replace(/ & /g, '-').replace(/[^\w-]+/g, ''),
    }));
    const { data: categorias, error: catError } = await supabase
        .from('blog_categories')
        .insert(categoriasInsert)
        .select();
    if (catError || !categorias) {
        console.error('Erro ao criar categorias:', catError);
        process.exit(1);
    }
    // Criar posts
    console.log(`Criando ${NUM_POSTS} posts...`);
    const authors = [
        { name: 'Ana Paula Costa', role: 'Especialista em RH', avatar: 'A' },
        { name: 'Carlos Mendes', role: 'Tech Recruiter Sênior', avatar: 'C' },
        { name: 'Juliana Ramos', role: 'Coach de Carreira', avatar: 'J' },
        { name: 'Roberto Alves', role: 'Head of People', avatar: 'R' },
        { name: 'Fernanda Lima', role: 'People Experience Manager', avatar: 'F' }
    ];
    for (let i = 1; i <= NUM_POSTS; i++) {
        const isDestaque = i === 1; // O primeiro post será destaque
        const cat = categorias[i % categorias.length];
        const author = authors[i % authors.length];
        const baseTitle = `Artigo de Teste Exemplo ${i} sobre ${cat.name}`;
        const excerpt = `Este é o resumo do artigo ${i}. Um pequeno texto para atrair o leitor a continuar lendo o conteúdo principal que conta detalhes sobre ${cat.name}.`;
        // Conteúdo em HTML
        const content = `<h2>O que você precisa saber sobre ${cat.name}</h2><p>Parágrafo inicial para o post ${i}. Aqui começa a discussão principal onde exploramos as tendências e dicas sobre o assunto em questão.</p><p>As estatísticas mostram que profissionais preparados tendem a ser contratados 3x mais rápido.</p><ul><li>Ponto importante 1</li><li>Ponto importante 2</li><li>Ponto importante 3</li></ul><p>Conclusão do artigo com um pensamento final para inspirar os leitores.</p>`;
        // Inserir post
        const { data: post, error: postError } = await supabase
            .from('blog_posts')
            .insert({
            title: baseTitle,
            slug: `artigo-teste-${i}-${Date.now()}`,
            excerpt,
            content,
            tags: [cat.name.toLowerCase(), 'dicas', 'carreira2026'],
            author_name: author.name,
            author_role: author.role,
            author_avatar: author.avatar,
            reading_time: Math.floor(Math.random() * 8) + 3,
            featured: isDestaque,
            published_at: new Date(Date.now() - i * 86400000).toISOString()
        })
            .select()
            .single();
        if (postError) {
            console.error(`Erro inserindo post ${i}:`, postError);
            continue;
        }
        // Inserir relacionamento com categoria
        const { error: relError } = await supabase
            .from('blog_post_categories')
            .insert({
            post_id: post.id,
            category_id: cat.id
        });
        if (relError) {
            console.error(`Erro linkando post ${i} à categoria ${cat.id}:`, relError);
        }
        // Inserir imagem
        const { error: imgError } = await supabase
            .from('blog_post_images')
            .insert({
            post_id: post.id,
            url: IMAGE_URL,
            featured: true
        });
        if (imgError) {
            console.error(`Erro inserindo imagem do post ${i}:`, imgError);
        }
    }
    console.log('Seed do blog concluído!');
}
seed().catch(console.error);

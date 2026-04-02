"use strict";
/**
 * seed-candidaturas.ts
 * Insere 6 candidaturas aleatórias para cada candidato existente no banco de dados.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});
const STATUS_POOL = ['pendente', 'em_analise', 'entrevista', 'recusado', 'aprovado'];
const MENSAGENS = [
    'Tenho muita vontade de integrar equipe e aprender bastante sobre o negócio de vocês.',
    'Acredito que meu perfil se encaixe perfeitamente na posição. Aguardo um retorno!',
    'Acompanho a empresa há muito tempo e seria uma honra participar deste time.',
    null,
    null
];
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}
async function seed() {
    console.log(`\n🌱 Iniciando seed de candidaturas...`);
    // 1. Obter todos os candidatos
    const { data: candidatos, error: erroCandidatos } = await supabase.from('candidatos').select('id, nome_completo');
    if (erroCandidatos || !candidatos || candidatos.length === 0) {
        console.error('❌ Erro ou nenhum candidato encontrado:', erroCandidatos === null || erroCandidatos === void 0 ? void 0 : erroCandidatos.message);
        process.exit(1);
    }
    // 2. Obter todas as vagas
    const { data: vagas, error: erroVagas } = await supabase.from('vagas').select('id, titulo');
    if (erroVagas || !vagas || vagas.length < 6) {
        console.error('❌ Erro ou quantidade insuficiente de vagas. É necessário pelo menos 6 vagas.', erroVagas === null || erroVagas === void 0 ? void 0 : erroVagas.message);
        process.exit(1);
    }
    let insercoesFeitas = 0;
    let errosOcorridos = 0;
    // 3. Iterar cada candidato e criar 6 candidaturas agendadas unicamente
    for (const candidato of candidatos) {
        const vagasEscolhidas = shuffle([...vagas]).slice(0, 6);
        const candidaturasToInsert = vagasEscolhidas.map(vaga => {
            const diasAtras = Math.floor(Math.random() * 45) + 1; // Candidaturas até 45 dias atrás
            const dataApply = new Date();
            dataApply.setDate(dataApply.getDate() - diasAtras);
            return {
                vaga_id: vaga.id,
                candidato_id: candidato.id,
                status: STATUS_POOL[Math.floor(Math.random() * STATUS_POOL.length)],
                mensagem: MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)],
                created_at: dataApply.toISOString(),
                updated_at: dataApply.toISOString()
            };
        });
        const { error } = await supabase.from('candidaturas').insert(candidaturasToInsert);
        if (error) {
            console.error(`   ⚠️ Erro ao inserir para candidato ${candidato.nome_completo}: ${error.message}`);
            errosOcorridos++;
        }
        else {
            insercoesFeitas += candidaturasToInsert.length;
        }
    }
    console.log(`\n🎉 Processo concluído!`);
    console.log(`✅ Foram cadastradas ${insercoesFeitas} candidaturas com sucesso.`);
    if (errosOcorridos > 0) {
        console.log(`❌ Ocorreram erros em ${errosOcorridos} inserts de blocos relacionais.`);
    }
}
seed().catch(console.error);

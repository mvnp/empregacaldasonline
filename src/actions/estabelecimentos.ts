'use server'

import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/server-auth'

// Campos esperados do CSV (na ordem do header)
const CSV_HEADERS = [
    'cnpj_basico',
    'cnpj_ordem',
    'cnpj_dv',
    'identificador_matriz_filial',
    'nome_fantasia',
    'situacao_cadastral',
    'data_situacao_cadastral',
    'motivo_situacao_cadastral',
    'nome_cidade_exterior',
    'pais',
    'data_inicio_atividade',
    'cnae_fiscal_principal',
    'cnae_fiscal_secundaria',
    'tipo_logradouro',
    'logradouro',
    'numero',
    'complemento',
    'bairro',
    'cep',
    'uf',
    'municipio',
    'ddd_1',
    'telefone_1',
    'ddd_2',
    'telefone_2',
    'ddd_fax',
    'fax',
    'correio_eletronico',
    'situacao_especial',
    'data_situacao_especial',
] as const

type EstabelecimentoRow = Record<typeof CSV_HEADERS[number], string>

/**
 * Faz parsing simples de CSV respeitando campos entre aspas com vírgulas internas.
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    result.push(current.trim())
    return result
}

/**
 * Importa um arquivo CSV para a tabela _estabelecimentos.
 * Aceita os dados como string (conteúdo do arquivo).
 * Retorna um objeto com totais de sucesso/erro.
 */
export async function importarEstabelecimentosCSV(
    csvContent: string,
    options: { limparAntes?: boolean } = {}
) {
    // SECURITY PATCH: Blindar deleção/inserção em massa
    const supabase = await requireAdmin()

    const lines = csvContent
        .split('\n')
        .map(l => l.replace(/\r$/, ''))
        .filter(l => l.trim().length > 0)

    if (lines.length < 2) {
        return { sucesso: false, erro: 'Arquivo CSV vazio ou sem dados.' }
    }

    // Valida header
    const headerLine = lines[0]
    const headerCols = parseCSVLine(headerLine)
    const csvHeaderStr = headerCols.join(',')
    const expectedHeaderStr = CSV_HEADERS.join(',')

    if (csvHeaderStr !== expectedHeaderStr) {
        return {
            sucesso: false,
            erro: `Header inválido. Esperado:\n${expectedHeaderStr}\n\nEncontrado:\n${csvHeaderStr}`,
        }
    }

    // Limpar tabela antes se solicitado
    if (options.limparAntes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: delErr } = await (supabase as any)
            .from('_estabelecimentos')
            .delete()
            .neq('id', 0) // deleta tudo (workaround para delete sem filtro no RLS)

        if (delErr) {
            return { sucesso: false, erro: `Erro ao limpar tabela: ${delErr.message}` }
        }
    }

    const dataLines = lines.slice(1)
    const BATCH_SIZE = 500

    let totalInseridos = 0
    let totalErros = 0
    const erros: string[] = []

    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
        const batch = dataLines.slice(i, i + BATCH_SIZE)
        const rows: EstabelecimentoRow[] = []

        for (const line of batch) {
            const cols = parseCSVLine(line)
            if (cols.length !== CSV_HEADERS.length) {
                totalErros++
                if (erros.length < 10) {
                    erros.push(`Linha ignorada (${cols.length} colunas em vez de ${CSV_HEADERS.length}): ${line.substring(0, 60)}...`)
                }
                continue
            }

            const row = {} as EstabelecimentoRow
            CSV_HEADERS.forEach((header, idx) => {
                row[header] = cols[idx] ?? ''
            })
            rows.push(row)
        }

        if (rows.length === 0) continue

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertErr } = await (supabase as any)
            .from('_estabelecimentos')
            .insert(rows)

        if (insertErr) {
            totalErros += rows.length
            if (erros.length < 10) {
                erros.push(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}: ${insertErr.message}`)
            }
        } else {
            totalInseridos += rows.length
        }
    }

    return {
        sucesso: true,
        totalLinhas: dataLines.length,
        totalInseridos,
        totalErros,
        erros: erros.length > 0 ? erros : undefined,
    }
}

export async function buscarEstabelecimentosPaginado(busca: string, start: number, limit: number, filtroCnae?: string, esconderSemNome: boolean = false) {
    const supabaseAdmin = createAdminClient();
    const userClient = await createServerSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();

    let favoritosIds: number[] = [];
    if (user) {
        // Buscamos os IDs favoritos desse usuário usando o DB. (Bypassamos RLS na admin se precisarmos ou a tabela permite com o userClient normal já que o RLS dá match auth.uid() = user_id)
        const { data: favs } = await userClient.from('_estabelecimentos_favoritos').select('estabelecimento_id').eq('user_id', user.id);
        favoritosIds = (favs || []).map(f => f.estabelecimento_id);
    }

    let query = supabaseAdmin
        .from('_estabelecimentos')
        .select(`
            id,
            nome_fantasia,
            cnae_fiscal_principal,
            cep,
            tipo_logradouro,
            logradouro,
            numero,
            complemento,
            bairro,
            municipio,
            uf,
            ddd_1,
            telefone_1,
            ddd_2,
            telefone_2,
            correio_eletronico,
            cnpj_basico
        `, { count: 'exact' });

    if (busca) {
        const q = `"%${busca}%"`;
        const q2 = `%${busca}%`; // sem aspas para as queries simples

        // Busca ids dos CNAEs que combinam com o texto
        const { data: cnaesEncontrados } = await supabaseAdmin
            .from('_cnaes')
            .select('codigo')
            .ilike('descricao', q2);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const codigosCnae = (cnaesEncontrados as any[])?.map(c => c.codigo) || [];

        // Limpa pontuações para procurar de forma otimizada caso o usuário digite um CNPJ formatado
        const limpoCnpj = busca.replace(/\D/g, '');
        const qCnpj = limpoCnpj ? `"%${limpoCnpj}%"` : q;

        // Filtra também pelo código array se encontrar
        if (codigosCnae.length > 0) {
            query = query.or(`nome_fantasia.ilike.${q},bairro.ilike.${q},cnpj_basico.ilike.${qCnpj},cnae_fiscal_principal.in.(${codigosCnae.join(',')})`);
        } else {
            query = query.or(`nome_fantasia.ilike.${q},bairro.ilike.${q},cnpj_basico.ilike.${qCnpj}`);
        }
    }

    if (filtroCnae) {
        query = query.eq('cnae_fiscal_principal', filtroCnae);
    }

    if (esconderSemNome) {
        // Usa is.null para tratar db null, e neq para campo que apenas foi enviado vazio
        query = query.not('nome_fantasia', 'is', null).neq('nome_fantasia', '');
    }

    const noSearch = !busca && !filtroCnae && !esconderSemNome;

    // Se não tiver busca ativa, tiramos os favoritos da listagem sequencial padrão
    if (noSearch && favoritosIds.length > 0) {
        query = query.not('id', 'in', `(${favoritosIds.join(',')})`);
    }

    const { data: dataRestante, count, error } = await query
        .order('id', { ascending: true })
        .range(start, start + limit - 1);

    if (error) {
        console.error("Erro na busca de estabelecimentos:", error);
        return { data: [], count: 0, erro: true, favoritosIds: [] };
    }

    let resultData = dataRestante || [];

    // Se é a primeira página e não tem busca, os favoritos entram em primeiro lugar fixo
    if (noSearch && start === 0 && favoritosIds.length > 0) {
        const { data: dataFavoritos } = await supabaseAdmin
            .from('_estabelecimentos')
            .select(`
                id,
                nome_fantasia,
                cnae_fiscal_principal,
                cep,
                tipo_logradouro,
                logradouro,
                numero,
                complemento,
                bairro,
                municipio,
                uf,
                ddd_1,
                telefone_1,
                ddd_2,
                telefone_2,
                correio_eletronico,
                cnpj_basico
            `)
            .in('id', favoritosIds);

        if (dataFavoritos && dataFavoritos.length > 0) {
            resultData = [...dataFavoritos, ...resultData];
        }
    }

    // Calcula total isolando o count para exibir à UI corretamente a quantidade total considerando todos os do DB (com favoritos que foram tirados no select anterior)
    const finalCount = (noSearch && favoritosIds.length > 0) ? (count || 0) + favoritosIds.length : (count || 0);

    return {
        data: resultData,
        count: finalCount,
        erro: false,
        favoritosIds
    };
}

export async function toggleEstabelecimentoFavorito(estabelecimento_id: number, isFavorito: boolean) {
    const userClient = await createServerSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) return { erro: 'Usuário não autenticado' };

    if (isFavorito) {
        const { error } = await userClient.from('_estabelecimentos_favoritos').insert({
            user_id: user.id,
            estabelecimento_id
        });
        if (error) return { erro: error.message };
    } else {
        const { error } = await userClient.from('_estabelecimentos_favoritos')
            .delete()
            .eq('user_id', user.id)
            .eq('estabelecimento_id', estabelecimento_id);
        if (error) return { erro: error.message };
    }

    return { sucesso: true };
}

export async function atualizarNomeFantasia(id: number, nome_fantasia: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = await requireAdmin();
    } catch (e: any) {
        return { erro: e.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
        .from('_estabelecimentos')
        .update({ nome_fantasia })
        .eq('id', id);

    if (error) {
        return { erro: error.message };
    }

    return { sucesso: true };
}

export async function atualizarTelefone1(id: number, ddd_1: string, telefone_1: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = await requireAdmin();
    } catch (e: any) {
        return { erro: e.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
        .from('_estabelecimentos')
        .update({ ddd_1, telefone_1 })
        .eq('id', id);

    if (error) return { erro: error.message };
    return { sucesso: true };
}

export async function atualizarTelefone2(id: number, ddd_2: string, telefone_2: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = await requireAdmin();
    } catch (e: any) {
        return { erro: e.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
        .from('_estabelecimentos')
        .update({ ddd_2, telefone_2 })
        .eq('id', id);

    if (error) return { erro: error.message };
    return { sucesso: true };
}

export async function atualizarEmail(id: number, correio_eletronico: string) {
    let supabaseAdmin;
    try {
        supabaseAdmin = await requireAdmin();
    } catch (e: any) {
        return { erro: e.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
        .from('_estabelecimentos')
        .update({ correio_eletronico })
        .eq('id', id);

    if (error) return { erro: error.message };
    return { sucesso: true };
}

export async function buscarCnaes() {
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allCnaes: any[] = [];
    let start = 0;
    const limit = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('_cnaes')
            .select('*')
            .order('descricao', { ascending: true })
            .range(start, start + limit - 1);

        if (error) {
            console.error("Erro na busca de cnaes:", error);
            return { data: [], erro: true };
        }

        if (data && data.length > 0) {
            allCnaes = [...allCnaes, ...data];
            if (data.length < limit) break;
            start += limit;
        } else {
            break;
        }
    }

    return {
        data: allCnaes,
        erro: false
    };
}

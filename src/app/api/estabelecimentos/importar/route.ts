import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

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

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('arquivo') as File | null
        const limparAntes = formData.get('limparAntes') === 'true'

        if (!file) {
            return NextResponse.json({ sucesso: false, erro: 'Nenhum arquivo enviado.' }, { status: 400 })
        }

        const csvContent = await file.text()
        const supabase = createAdminClient()

        const lines = csvContent
            .split('\n')
            .map(l => l.replace(/\r$/, ''))
            .filter(l => l.trim().length > 0)

        if (lines.length < 2) {
            return NextResponse.json({ sucesso: false, erro: 'Arquivo CSV vazio ou sem dados.' }, { status: 400 })
        }

        // Valida header
        const headerCols = parseCSVLine(lines[0])
        const csvHeaderStr = headerCols.join(',')
        const expectedHeaderStr = CSV_HEADERS.join(',')

        if (csvHeaderStr !== expectedHeaderStr) {
            return NextResponse.json({
                sucesso: false,
                erro: `Header inválido.\nEsperado: ${expectedHeaderStr}\nEncontrado: ${csvHeaderStr}`,
            }, { status: 400 })
        }

        // Limpar tabela antes se solicitado
        if (limparAntes) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: delErr } = await (supabase as any)
                .from('_estabelecimentos')
                .delete()
                .neq('id', 0)

            if (delErr) {
                return NextResponse.json({ sucesso: false, erro: `Erro ao limpar tabela: ${delErr.message}` }, { status: 500 })
            }
        }

        const dataLines = lines.slice(1)
        const BATCH_SIZE = 200  // menor para evitar limites do postgres
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
                        erros.push(`Linha ignorada (${cols.length} cols): ${line.substring(0, 60)}…`)
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

        return NextResponse.json({
            sucesso: true,
            totalLinhas: dataLines.length,
            totalInseridos,
            totalErros,
            erros: erros.length > 0 ? erros : undefined,
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro inesperado no servidor.'
        return NextResponse.json({ sucesso: false, erro: msg }, { status: 500 })
    }
}

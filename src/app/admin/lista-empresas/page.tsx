import { createAdminClient } from '@/lib/supabase'
import ListaEstabelecimentosClient from './ListaEstabelecimentosClient'

export const metadata = {
    title: 'Lista de Empresas · Admin',
    description: 'Listagem de estabelecimentos importados do CNPJ',
}

export interface Estabelecimento {
    id: number
    nome_fantasia: string | null
    cnae_fiscal_principal: string | null
    cep: string | null
    tipo_logradouro: string | null
    logradouro: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    municipio: string | null
    uf: string | null
    ddd_1: string | null
    telefone_1: string | null
    ddd_2: string | null
    telefone_2: string | null
    correio_eletronico: string | null
    cnpj_basico: string | null
}

import { buscarEstabelecimentosPaginado, buscarCnaes } from '@/actions/estabelecimentos'

export default async function ListaEmpresasPage() {
    // Busca inicial: 100 primeiros, sem filtro
    const [estabResult, cnaesResult] = await Promise.all([
        buscarEstabelecimentosPaginado("", 0, 100),
        buscarCnaes()
    ]);

    const { data: estabelecimentos, count, erro, favoritosIds } = estabResult;
    const { data: cnaes } = cnaesResult;

    return (
        <ListaEstabelecimentosClient
            initialData={estabelecimentos}
            initialCount={count}
            initialFavoritos={favoritosIds || []}
            cnaes={cnaes}
            erro={erro}
        />
    )
}

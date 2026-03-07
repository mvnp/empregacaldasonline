// ===========================
// Tipos do Portal de Empregos
// ===========================

export interface Vaga {
  id: string
  titulo: string
  descricao: string
  empresa: string
  localizacao: string
  tipo_contrato: TipoContrato
  modalidade: Modalidade
  salario_min?: number
  salario_max?: number
  salario_visivel: boolean
  area: string
  nivel: NivelExperiencia
  requisitos: string[]
  beneficios: string[]
  ativa: boolean
  destaque: boolean
  data_expiracao?: string
  created_at: string
  updated_at: string
  empresa_id?: string
}

export interface Empresa {
  id: string
  nome: string
  descricao?: string
  website?: string
  logo_url?: string
  setor: string
  tamanho: TamanhoEmpresa
  localizacao: string
  created_at: string
}

export interface Candidatura {
  id: string
  vaga_id: string
  nome: string
  email: string
  telefone?: string
  curriculo_url?: string
  mensagem?: string
  status: StatusCandidatura
  created_at: string
  vaga?: Vaga
}

// ===========================
// Enums / Union Types
// ===========================

export type TipoContrato =
  | 'CLT'
  | 'PJ'
  | 'Freelance'
  | 'Estágio'
  | 'Temporário'
  | 'Aprendiz'

export type Modalidade =
  | 'Presencial'
  | 'Remoto'
  | 'Híbrido'

export type NivelExperiencia =
  | 'Estágio'
  | 'Júnior'
  | 'Pleno'
  | 'Sênior'
  | 'Especialista'
  | 'Gerência'

export type TamanhoEmpresa =
  | 'Startup (1-10)'
  | 'Pequena (11-50)'
  | 'Média (51-200)'
  | 'Grande (201-1000)'
  | 'Corporação (1000+)'

export type StatusCandidatura =
  | 'Pendente'
  | 'Visualizado'
  | 'Em análise'
  | 'Aprovado'
  | 'Reprovado'

// ===========================
// Filtros de Busca
// ===========================

export interface FiltrosVaga {
  busca?: string
  area?: string
  modalidade?: Modalidade
  tipo_contrato?: TipoContrato
  nivel?: NivelExperiencia
  localizacao?: string
  salario_min?: number
  salario_max?: number
  destaque?: boolean
}

// ===========================
// Resposta Paginada
// ===========================

export interface RespostaPaginada<T> {
  dados: T[]
  total: number
  pagina: number
  por_pagina: number
  total_paginas: number
}

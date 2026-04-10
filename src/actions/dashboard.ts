'use server'

import { requireAdmin } from '@/lib/server-auth'
import { createAdminClient } from '@/lib/supabase'

export interface DashboardStats {
    totalVagas: number
    totalCandidatos: number
    totalEmpresas: number
    candidaturasHoje: number
}

export interface GraficoDia {
    dia: string
    valor: number
    data: string // ISO YYYY-MM-DD para referência
}

export interface VagaDashboard {
    id: number
    titulo: string
    empresa: string
    local: string | null
    status: string
    candidaturas: number
    created_at: string
}

export interface UsuarioDashboard {
    id: number
    nome: string
    sobrenome: string | null
    email: string
    tipo: string
    created_at: string
}

export interface DashboardData {
    stats: DashboardStats
    grafico: GraficoDia[]
    totalGrafico: number
    vagas: VagaDashboard[]
    vagasTotal: number
    usuarios: UsuarioDashboard[]
    usuariosTotal: number
}

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export async function buscarDadosDashboard(vagaPage = 1, userPage = 1): Promise<DashboardData | null> {
    let admin: any
    try {
        admin = await requireAdmin()
    } catch {
        return null
    }

    // ── Datas de referência ──────────────────────────
    const agora = new Date()
    const inicioDia = new Date(agora)
    inicioDia.setHours(0, 0, 0, 0)

    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - 6)
    inicioSemana.setHours(0, 0, 0, 0)

    const PER_PAGE = 10

    // ── Todas as queries em paralelo ──────────────────
    const [
        vagasCount,
        candidatosCount,
        empresasCount,
        candidaturasHojeCount,
        candidaturasSemana,
        vagasData,
        vagasTotal,
        usuariosData,
        usuariosTotal,
    ] = await Promise.all([
        // Total de vagas ativas
        (admin.from('vagas') as any).select('id', { count: 'exact', head: true }),

        // Total de candidatos (users com tipo=candidato)
        (admin.from('users') as any)
            .select('id', { count: 'exact', head: true })
            .eq('tipo', 'candidato'),

        // Total de empresas
        (admin.from('empresas') as any).select('id', { count: 'exact', head: true }),

        // Candidaturas hoje
        (admin.from('candidaturas') as any)
            .select('id', { count: 'exact', head: true })
            .gte('created_at', inicioDia.toISOString()),

        // Candidaturas dos últimos 7 dias (para o gráfico)
        (admin.from('candidaturas') as any)
            .select('created_at')
            .gte('created_at', inicioSemana.toISOString())
            .order('created_at', { ascending: true }),

        // Últimas vagas paginadas
        (admin.from('vagas') as any)
            .select('id, titulo, empresa, local, status, created_at, candidaturas(id)')
            .order('created_at', { ascending: false })
            .range((vagaPage - 1) * PER_PAGE, vagaPage * PER_PAGE - 1),

        // Total de vagas (para paginação)
        (admin.from('vagas') as any).select('id', { count: 'exact', head: true }),

        // Últimos usuários paginados
        (admin.from('users') as any)
            .select('id, nome, sobrenome, email, tipo, created_at')
            .order('created_at', { ascending: false })
            .range((userPage - 1) * PER_PAGE, userPage * PER_PAGE - 1),

        // Total de usuários (para paginação)
        (admin.from('users') as any).select('id', { count: 'exact', head: true }),
    ])

    // ── Montar gráfico por dia (últimos 7 dias) ──────
    const contadorPorDia: Record<string, { count: number; diaNome: string }> = {}

    for (let i = 6; i >= 0; i--) {
        const d = new Date(agora)
        d.setDate(agora.getDate() - i)
        const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
        contadorPorDia[key] = { count: 0, diaNome: DIAS_PT[d.getDay()] }
    }

    for (const c of (candidaturasSemana.data || [])) {
        const key = (c.created_at as string).slice(0, 10)
        if (contadorPorDia[key]) contadorPorDia[key].count++
    }

    const grafico: GraficoDia[] = Object.entries(contadorPorDia).map(([data, { count, diaNome }]) => ({
        dia: diaNome,
        valor: count,
        data,
    }))

    const totalGrafico = grafico.reduce((s, d) => s + d.valor, 0)

    // ── Formatar vagas ───────────────────────────────
    const vagas: VagaDashboard[] = (vagasData.data || []).map((v: any) => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        local: v.local,
        status: v.status,
        candidaturas: Array.isArray(v.candidaturas) ? v.candidaturas.length : 0,
        created_at: v.created_at,
    }))

    // ── Formatar usuários ────────────────────────────
    const usuarios: UsuarioDashboard[] = (usuariosData.data || []).map((u: any) => ({
        id: u.id,
        nome: u.nome,
        sobrenome: u.sobrenome,
        email: u.email,
        tipo: u.tipo,
        created_at: u.created_at,
    }))

    return {
        stats: {
            totalVagas: vagasCount.count ?? 0,
            totalCandidatos: candidatosCount.count ?? 0,
            totalEmpresas: empresasCount.count ?? 0,
            candidaturasHoje: candidaturasHojeCount.count ?? 0,
        },
        grafico,
        totalGrafico,
        vagas,
        vagasTotal: vagasTotal.count ?? 0,
        usuarios,
        usuariosTotal: usuariosTotal.count ?? 0,
    }
}

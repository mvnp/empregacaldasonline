import Link from 'next/link'
import CurriculoPublicoClient from './CurriculoPublicoClient'

export const dynamic = 'force-dynamic'

function calcularTempoExperiencia(exps: any[]): number {
    let maxAnos = 0
    exps.forEach(e => {
        if (!e.data_inicio) return
        const dIni = new Date(e.data_inicio)
        const dFim = e.em_andamento ? new Date() : (e.data_fim ? new Date(e.data_fim) : new Date())
        const anos = dFim.getFullYear() - dIni.getFullYear()
        if (anos > maxAnos) maxAnos = anos
    })
    return maxAnos
}

export default async function CurriculoPublicoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: token } = await params

    // Validate UUID format to avoid unnecessary DB queries
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!token || !uuidRegex.test(token)) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Link inválido</h2>
                <Link href="/" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Ir para Home
                </Link>
            </div>
        )
    }

    const { createAdminClient } = await import('@/lib/supabase')
    const supabase = createAdminClient()

    const { data: candidatoDb, error } = await supabase
        .from('candidatos')
        .select(`
            *,
            experiencias:candidato_experiencias(*),
            formacoes:candidato_formacoes(*),
            habilidades:candidato_habilidades(*),
            idiomas:candidato_idiomas(*),
            documentos:candidato_documentos(*)
        `)
        .eq('share_token', token)
        .single() as { data: any; error: any }

    if (error || !candidatoDb || candidatoDb.status !== 'ativo') {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Currículo Indisponível</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Este currículo não existe ou o candidato optou por ocultá-lo.</p>
                <Link href="/" className="btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.85rem' }}>
                    Ir para Home
                </Link>
            </div>
        )
    }

    const maxAnos = calcularTempoExperiencia(candidatoDb.experiencias || [])
    const formatBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    let pretensaoSalarial = "A combinar"
    if (candidatoDb.pretensao_min && candidatoDb.pretensao_max) {
        pretensaoSalarial = `${formatBRL.format(candidatoDb.pretensao_min)} - ${formatBRL.format(candidatoDb.pretensao_max)}`
    } else if (candidatoDb.pretensao_min) {
        pretensaoSalarial = `A partir de ${formatBRL.format(candidatoDb.pretensao_min)}`
    }

    const candidato = {
        id: candidatoDb.id,
        nome: candidatoDb.nome_completo,
        cargo: candidatoDb.cargo_desejado || 'Currículo',
        local: candidatoDb.local || 'Não informado',
        status: candidatoDb.status,
        email: candidatoDb.email,
        telefone: candidatoDb.telefone || '-',
        celular: candidatoDb.whatsapp || '-',
        dataNascimento: candidatoDb.data_nascimento || '-',
        linkedin: candidatoDb.linkedin,
        github: candidatoDb.github,
        bio: candidatoDb.resumo || 'Sem apresentação.',
        experiencia: maxAnos > 0 ? `${maxAnos} anos` : 'Menos de 1 ano',
        pretensaoSalarial,
        disponibilidade: candidatoDb.disponivel ? "Imediata" : "Indisponível",
        habilidades: (candidatoDb.habilidades || []).map((h: any) => h.texto),
        idiomas: (candidatoDb.idiomas || []).map((i: any) => ({ idioma: i.idioma, nivel: i.nivel || 'Básico' })),
        experiencias: (candidatoDb.experiencias || []).sort((a: any, b: any) => a.ordem - b.ordem).map((e: any) => ({
            id: e.id, atual: e.em_andamento, cargo: e.cargo, empresa: e.empresa,
            periodo: e.data_inicio ? `${e.data_inicio.split('-')[0]} – ${e.em_andamento ? 'Atual' : (e.data_fim ? e.data_fim.split('-')[0] : 'Atual')}` : '-',
            descricao: e.descricao || ''
        })),
        formacoes: (candidatoDb.formacoes || []).sort((a: any, b: any) => a.ordem - b.ordem).map((f: any) => ({
            id: f.id, tipo: f.grau || 'Formação', curso: f.curso, instituicao: f.instituicao,
            periodo: f.data_inicio ? `${f.data_inicio.split('-')[0]} – ${f.em_andamento ? 'Previsão ' + (new Date().getFullYear() + 2) : (f.data_fim ? f.data_fim.split('-')[0] : '')}` : '-'
        })),
        documentos: (candidatoDb.documentos || []).sort((a: any, b: any) => a.ordem - b.ordem).map((d: any) => ({
            id: d.id, nome: d.titulo, url: d.url,
            tipo: d.tipo || (d.titulo.split('.').pop()?.toLowerCase() || 'file'),
            tamanho: 'Anexo',
            dataUpload: new Date(d.created_at).toISOString().split('T')[0]
        })),
    }

    return <CurriculoPublicoClient candidato={candidato} />
}

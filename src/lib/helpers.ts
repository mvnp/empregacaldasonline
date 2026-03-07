// ─────────────────────────────────────────────────────────────
// Helpers de UI — formatações e estilos dinâmicos
// ─────────────────────────────────────────────────────────────

/** Retorna a classe CSS do badge de modalidade */
export function getBadgeModalidade(modalidade: string): string {
    const map: Record<string, string> = {
        'Remoto': 'badge badge-remoto',
        'Híbrido': 'badge badge-hibrido',
        'Presencial': 'badge badge-presencial',
    }
    return map[modalidade] ?? 'badge badge-presencial'
}

/** Retorna a classe CSS do badge de tipo de contrato */
export function getBadgeContrato(contrato: string): string {
    return contrato === 'PJ' ? 'badge badge-pj' : 'badge badge-clt'
}

/** Converte número de dias em texto legível */
export function formatarDiasAtras(dias: number): string {
    if (dias === 0) return 'Hoje'
    if (dias === 1) return 'Ontem'
    return `${dias} dias atrás`
}

/** Gera cor de avatar baseada no nome da empresa */
export function getAvatarColor(nome: string): string {
    const hues = [210, 195, 160, 270, 340, 30, 180, 240]
    const index = nome.charCodeAt(0) % hues.length
    return `hsl(${hues[index]}, 55%, 30%)`
}

'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function CandidatoDashboard() {
    return (
        <div>
            <AdminPageHeader titulo="Dashboard" subtitulo="Bem-vindo à sua área de candidato" />
            <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #e8edf5', textAlign: 'center', color: '#64748b' }}>
                Em breve você poderá ver suas candidaturas e recomendações de vagas aqui.
            </div>
        </div>
    )
}

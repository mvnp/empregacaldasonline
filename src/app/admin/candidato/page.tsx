import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { buscarMeuUsuarioCompleto } from '@/actions/candidatos'
import { Sparkles } from 'lucide-react'
import BannerSpace from '@/components/publicidade/BannerSpace'

export const dynamic = 'force-dynamic'

export default async function CandidatoDashboard() {
    const usuario = await buscarMeuUsuarioCompleto()
    const creditosIA = usuario?.creditos_ia ?? 0

    return (
        <div>
            <AdminPageHeader titulo="Dashboard" subtitulo="Bem-vindo à sua área de candidato" />
            
            {/* Cards: Créditos + Publicidade (2 colunas, 300px de altura) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Card 1: Créditos de IA */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    padding: '2rem',
                    borderRadius: 16,
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '1.25rem',
                    height: 300,
                }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles style={{ width: 28, height: 28, color: '#38bdf8' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>
                            Créditos de IA Restantes
                        </h3>
                        <p style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#fff', lineHeight: 1 }}>
                            {creditosIA}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: '0.5rem 0 0' }}>
                            créditos disponíveis para gerar currículos com IA
                        </p>
                    </div>
                </div>

                {/* Card 2: Publicidade Native */}
                <BannerSpace
                    formato="native"
                    className="ad-dashboard-candidato"
                    style={{ height: 300 }}
                    imageColWidth={300}
                />
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #e8edf5', textAlign: 'center', color: '#64748b' }}>
                <p>Em breve você poderá ver suas candidaturas e recomendações de vagas aqui.</p>
            </div>
        </div>
    )
}

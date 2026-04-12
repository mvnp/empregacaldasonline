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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    padding: '1.5rem',
                    borderRadius: 16,
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                }}>
                    <div style={{
                        width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles style={{ width: 26, height: 26, color: '#38bdf8' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 600, margin: 0, marginBottom: '0.25rem' }}>
                            Créditos de IA Restantes
                        </h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                            {creditosIA}
                        </p>
                    </div>
                </div>
            </div>

            {/* Banner C3 - Logo abaixo dos cards */}
            <BannerSpace formato="rectangle" style={{ marginBottom: '2rem' }} />

            <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #e8edf5', textAlign: 'center', color: '#64748b' }}>
                <p style={{ marginBottom: '2rem' }}>Em breve você poderá ver suas candidaturas e recomendações de vagas aqui.</p>
                
                {/* Banner C1 - Substituindo espaço ocioso */}
                <div style={{ maxWidth: 728, margin: '0 auto' }}>
                    <BannerSpace formato="leaderboard" />
                </div>
            </div>
        </div>
    )
}

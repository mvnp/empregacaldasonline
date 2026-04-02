import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Contato | PortalJobs',
}

export default function ContatoPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
            
            {/* Header Reduzido (Igual ao Detalhe da Vaga) */}
            <div style={{ background: 'linear-gradient(135deg, #09355F, #062340)', position: 'relative', zIndex: 10 }}>
                <Navbar variant="transparent" />
                
                <div style={{ padding: '7rem 2rem 4rem', maxWidth: 1280, margin: '0 auto', color: '#fff' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2AB9C0', flexShrink: 0
                        }}>
                            <MessageSquare style={{ width: 32, height: 32 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 280 }}>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.35rem', lineHeight: 1.15 }}>
                                Fale Conosco
                            </h1>
                            <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0 }}>
                                Tem alguma dúvida ou precisa de suporte? Nossa equipe está pronta para ajudar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout principal */}
            <main style={{ flex: 1, padding: '3rem 2rem 5rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem', alignItems: 'start' }} className="contato-grid">
                    
                    {/* Formulário de Contato */}
                    <div style={{ background: '#fff', padding: '2.5rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#09355F', marginBottom: '0.5rem' }}>Envie sua mensagem</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Preencha os campos abaixo e retornaremos o mais breve possível.</p>
                        
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-row-mobile">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label htmlFor="nome" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Nome completo</label>
                                    <input type="text" id="nome" placeholder="Ex: João da Silva" style={{
                                        padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>E-mail</label>
                                    <input type="email" id="email" placeholder="seu@email.com" style={{
                                        padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label htmlFor="assunto" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Assunto</label>
                                <input type="text" id="assunto" placeholder="Sobre o que deseja falar?" style={{
                                    padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none'
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label htmlFor="mensagem" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Mensagem</label>
                                <textarea id="mensagem" placeholder="Escreva os detalhes aqui..." rows={6} style={{
                                    padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical'
                                }} />
                            </div>

                            <button type="button" className="btn-primary" style={{
                                padding: '0.85rem 2rem', borderRadius: 10, fontSize: '1rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                width: 'fit-content', marginTop: '0.5rem', boxShadow: '0 4px 15px rgba(254,131,65,0.25)'
                            }}>
                                Enviar Mensagem <Send style={{ width: 18, height: 18 }} />
                            </button>
                        </form>
                    </div>

                    {/* Barra Lateral: Infos e Mapa */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
                        
                        {/* Cartão Informativo */}
                        <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09355F', marginBottom: '1.5rem' }}>
                                Informações de Contato
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(9, 53, 95, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin style={{ width: 18, height: 18, color: '#09355F' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.1rem' }}>Endereço Sede</p>
                                        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0, lineHeight: 1.4 }}>Edifício Comercial<br/>Av. Paulista, 1234 - Bela Vista<br/>São Paulo - SP, 01310-100</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(42, 185, 192, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Mail style={{ width: 18, height: 18, color: '#2AB9C0' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.1rem' }}>E-mail</p>
                                        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0, lineHeight: 1.4 }}>
                                            <a href="mailto:contato@portaljobs.com.br" style={{ color: 'inherit', textDecoration: 'none' }}>contato@portaljobs.com.br</a><br/>
                                            <a href="mailto:suporte@portaljobs.com.br" style={{ color: 'inherit', textDecoration: 'none' }}>suporte@portaljobs.com.br</a>
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251, 191, 83, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Phone style={{ width: 18, height: 18, color: '#d97706' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.1rem' }}>Telefones</p>
                                        <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0, lineHeight: 1.4 }}>
                                            (11) 4002-8922<br/>
                                            0800 123 4567
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mapa */}
                        <div style={{ background: '#fff', padding: '0.5rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8', overflow: 'hidden' }}>
                            {/* Você pode trocar "SUA_CHAVE_AQUI" pelo token real do GMaps futuramente */}
                            <iframe 
                                src="https://www.google.com/maps/embed/v1/place?key=SUA_CHAVE_AQUI&q=Avenida+Paulista,Sao+Paulo,SP" 
                                width="100%" 
                                height="220" 
                                style={{ border: 0, borderRadius: 12, display: 'block', backgroundColor: '#e2e8f0' }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Localização PortalJobs"
                            />
                            <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Google Maps Integrado</p>
                            </div>
                        </div>
                    </div>
                </div>

                <style suppressHydrationWarning>{`
                    @media (max-width: 900px) {
                        .contato-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }
                    @media (max-width: 600px) {
                        .form-row-mobile {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}</style>
            </main>
            
            <Footer />
        </div>
    )
}

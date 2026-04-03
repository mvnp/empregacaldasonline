import { listarVagasPublicas } from '@/actions/vagas'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Faz o fetch inicial (SSR) para SEO e primeira carga rápida.
  const inicial = await listarVagasPublicas({ page: 1, perPage: 5 })

  return <HomeClient inicial={inicial} />
}

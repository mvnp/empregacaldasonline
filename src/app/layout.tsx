import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Portal de Empregos | Encontre sua vaga ideal',
    template: '%s | PortalJobs',
  },
  description:
    'Encontre as melhores oportunidades de emprego. Vagas de CLT, PJ, estágio e mais. Candidate-se agora!',
  keywords: ['vagas de emprego', 'trabalho', 'oportunidades', 'carreiras', 'empregos'],
  openGraph: {
    title: 'PortalJobs — Encontre sua vaga ideal',
    description: 'Conectamos talentos às melhores empresas do Brasil',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <Script
          strategy="afterInteractive"
          src={'https://www.googletagmanager.com/gtag/js?id=G-RHS7K0K6VJ'}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RHS7K0K6VJ', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

const appUrl = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Reclama Pro — Gestión de reclamos para Pymes',
  description: 'Centraliza y resuelve los reclamos de tus clientes desde un solo lugar. Sin planillas, sin correos perdidos.',
  openGraph: {
    title: 'Reclama Pro — Gestión de reclamos para Pymes',
    description: 'Centraliza y resuelve los reclamos de tus clientes desde un solo lugar. Sin planillas, sin correos perdidos.',
    siteName: 'Reclama Pro',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reclama Pro — Gestión de reclamos para Pymes',
    description: 'Centraliza y resuelve los reclamos de tus clientes desde un solo lugar. Sin planillas, sin correos perdidos.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

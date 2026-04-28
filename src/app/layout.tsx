import type { Metadata } from 'next'
import { getAppUrl } from '@/lib/utils/url'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
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

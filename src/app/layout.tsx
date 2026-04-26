import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reclama Pro — Gestión de reclamos para Pymes',
  description: 'Centraliza y resuelve los reclamos de tus clientes desde un solo lugar. Sin planillas, sin correos perdidos.',
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

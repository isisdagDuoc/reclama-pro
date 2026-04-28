import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Reclama Pro — Gestión de reclamos para Pymes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#1d4ed8',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        gap: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          width: '96px',
          height: '96px',
          fontSize: '40px',
          fontWeight: 800,
          color: '#1d4ed8',
          letterSpacing: '-1px',
        }}
      >
        RP
      </div>
      <div
        style={{
          fontSize: '56px',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
        }}
      >
        Reclama Pro
      </div>
      <div
        style={{
          fontSize: '26px',
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          maxWidth: '640px',
          lineHeight: 1.4,
        }}
      >
        Centraliza y resuelve los reclamos de tus clientes desde un solo lugar.
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}

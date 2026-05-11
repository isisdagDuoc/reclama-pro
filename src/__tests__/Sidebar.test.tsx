import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/ui/Sidebar'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))
jest.mock('@/lib/actions/auth', () => ({
  logout: jest.fn(),
}))

import { usePathname } from 'next/navigation'

describe('Sidebar', () => {
  it('renderiza los 3 links de navegación', () => {
    jest.mocked(usePathname).mockReturnValue('/dashboard')
    render(<Sidebar enterpriseName="Empresa Test" email="user@empresa.com" role="admin" />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reclamos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reportes/i })).toBeInTheDocument()
  })

  it('muestra las iniciales del email en el avatar', () => {
    jest.mocked(usePathname).mockReturnValue('/dashboard')
    render(<Sidebar enterpriseName="Empresa Test" email="gisbe@empresa.com" role="admin" />)
    expect(screen.getByText('GI')).toBeInTheDocument()
  })

  it('muestra el email y el rol del usuario', () => {
    jest.mocked(usePathname).mockReturnValue('/dashboard')
    render(<Sidebar enterpriseName="Empresa Test" email="agente@empresa.com" role="agent" />)
    expect(screen.getByText('agente@empresa.com')).toBeInTheDocument()
    expect(screen.getByText('Agente')).toBeInTheDocument()
  })

  it('muestra "Administrador" para el rol admin', () => {
    jest.mocked(usePathname).mockReturnValue('/dashboard')
    render(<Sidebar enterpriseName="Empresa Test" email="admin@empresa.com" role="admin" />)
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('renderiza el botón de cerrar sesión', () => {
    jest.mocked(usePathname).mockReturnValue('/dashboard')
    render(<Sidebar enterpriseName="Empresa Test" email="user@empresa.com" role="admin" />)
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
  })

  it('aplica la clase activa al link de la ruta actual', () => {
    jest.mocked(usePathname).mockReturnValue('/claims')
    render(<Sidebar enterpriseName="Empresa Test" email="user@empresa.com" role="admin" />)
    const claimsLink = screen.getByRole('link', { name: /reclamos/i })
    expect(claimsLink.className).toContain('navLinkActive')
  })

  it('no aplica la clase activa a links que no son la ruta actual', () => {
    jest.mocked(usePathname).mockReturnValue('/claims')
    render(<Sidebar enterpriseName="Empresa Test" email="user@empresa.com" role="admin" />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink.className).not.toContain('navLinkActive')
  })
})

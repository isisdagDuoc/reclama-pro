import { render, screen, fireEvent, act } from '@testing-library/react'
import { ClaimsFilters } from '@/app/(panel)/claims/_components/ClaimsFilters'
import type { ClaimStatus } from '@/types'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/claims',
}))

const counts: Record<ClaimStatus, number> = {
  open: 3,
  in_progress: 1,
  resolved: 5,
  closed: 2,
}

describe('ClaimsFilters', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renderiza los 4 tabs de estado con sus conteos', () => {
    render(<ClaimsFilters counts={counts} />)
    expect(screen.getByText('Abierto (3)')).toBeInTheDocument()
    expect(screen.getByText('En progreso (1)')).toBeInTheDocument()
    expect(screen.getByText('Resuelto (5)')).toBeInTheDocument()
    expect(screen.getByText('Cerrado (2)')).toBeInTheDocument()
  })

  it('no muestra "Limpiar filtros" sin filtros activos', () => {
    render(<ClaimsFilters counts={counts} />)
    expect(screen.queryByText(/limpiar filtros/i)).not.toBeInTheDocument()
  })

  it('muestra "Limpiar filtros" cuando hay un filtro activo', () => {
    render(<ClaimsFilters currentStatus="open" counts={counts} />)
    expect(screen.getByText(/limpiar filtros/i)).toBeInTheDocument()
  })

  it('muestra "Limpiar filtros" cuando hay búsqueda activa', () => {
    render(<ClaimsFilters currentSearch="producto" counts={counts} />)
    expect(screen.getByText(/limpiar filtros/i)).toBeInTheDocument()
  })

  it('renderiza el input de búsqueda con el valor actual', () => {
    render(<ClaimsFilters currentSearch="factura" counts={counts} />)
    expect(screen.getByRole('searchbox')).toHaveValue('factura')
  })

  it('llama router.push al escribir en el buscador después del debounce', () => {
    render(<ClaimsFilters counts={counts} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'producto' } })
    act(() => jest.advanceTimersByTime(350))
    expect(mockPush).toHaveBeenCalledWith('/claims?search=producto')
  })

  it('no llama router.push antes de que termine el debounce', () => {
    render(<ClaimsFilters counts={counts} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'algo' } })
    act(() => jest.advanceTimersByTime(200))
    expect(mockPush).not.toHaveBeenCalled()
  })
})

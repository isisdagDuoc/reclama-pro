import { render, screen } from '@testing-library/react'
import { StatusSubmitButton } from '@/app/(panel)/claims/[id]/_components/StatusSubmitButton'

const mockUseFormStatus = jest.fn()

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: () => mockUseFormStatus(),
}))

describe('StatusSubmitButton', () => {
  it('renderiza los children cuando no está pendiente', () => {
    mockUseFormStatus.mockReturnValue({ pending: false })
    render(
      <StatusSubmitButton className="btn">Marcar como resuelto</StatusSubmitButton>
    )
    expect(screen.getByRole('button', { name: /marcar como resuelto/i })).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('muestra "Procesando..." y deshabilita el botón cuando está pendiente', () => {
    mockUseFormStatus.mockReturnValue({ pending: true })
    render(
      <StatusSubmitButton className="btn">Marcar como resuelto</StatusSubmitButton>
    )
    expect(screen.getByRole('button')).toHaveTextContent('Procesando...')
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

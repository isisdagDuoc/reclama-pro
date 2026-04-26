import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteClaimButton } from '@/app/(panel)/claims/[id]/_components/DeleteClaimButton'

jest.mock('@/lib/actions/claims', () => ({
  deleteClaim: jest.fn().mockResolvedValue(undefined),
}))

import { deleteClaim } from '@/lib/actions/claims'

describe('DeleteClaimButton', () => {
  beforeEach(() => jest.mocked(deleteClaim).mockClear())

  it('renderiza el botón inicial', () => {
    render(<DeleteClaimButton claimId="c1" />)
    expect(screen.getByRole('button', { name: /eliminar reclamo/i })).toBeInTheDocument()
  })

  it('muestra la UI de confirmación al hacer click', async () => {
    const user = userEvent.setup()
    render(<DeleteClaimButton claimId="c1" />)
    await user.click(screen.getByRole('button', { name: /eliminar reclamo/i }))
    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sí, eliminar/i })).toBeInTheDocument()
  })

  it('cancela y vuelve al estado inicial', async () => {
    const user = userEvent.setup()
    render(<DeleteClaimButton claimId="c1" />)
    await user.click(screen.getByRole('button', { name: /eliminar reclamo/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByRole('button', { name: /eliminar reclamo/i })).toBeInTheDocument()
  })

  it('llama deleteClaim con el id correcto al confirmar', async () => {
    const user = userEvent.setup()
    render(<DeleteClaimButton claimId="reclamo-xyz" />)
    await user.click(screen.getByRole('button', { name: /eliminar reclamo/i }))
    await user.click(screen.getByRole('button', { name: /sí, eliminar/i }))
    await waitFor(() =>
      expect(jest.mocked(deleteClaim)).toHaveBeenCalledWith('reclamo-xyz')
    )
  })
})

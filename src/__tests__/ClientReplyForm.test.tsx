import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientReplyForm } from '@/app/[slug]/_components/ClientReplyForm'

jest.mock('@/lib/actions/portal', () => ({
  addClientComment: jest.fn(),
  submitRating: jest.fn(),
}))

import { addClientComment } from '@/lib/actions/portal'

const defaultProps = {
  enterpriseId: 'ent-1',
  claimId: 'claim-1',
  accessToken: 'token-abc',
  slug: 'empresa-x',
}

describe('ClientReplyForm', () => {
  beforeEach(() => jest.mocked(addClientComment).mockClear())

  it('renderiza el formulario del cliente', () => {
    render(<ClientReplyForm {...defaultProps} />)
    expect(screen.getByPlaceholderText(/escribe tu comentario/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar comentario/i })).toBeInTheDocument()
  })

  it('muestra error si se envía vacío', async () => {
    const user = userEvent.setup()
    render(<ClientReplyForm {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /enviar comentario/i }))
    expect(screen.getByText(/escribe un comentario antes de enviar/i)).toBeInTheDocument()
  })

  it('limpia el textarea tras envío exitoso', async () => {
    jest.mocked(addClientComment).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    render(<ClientReplyForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText(/escribe tu comentario/i), 'Mi comentario')
    await user.click(screen.getByRole('button', { name: /enviar comentario/i }))
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/escribe tu comentario/i)).toHaveValue('')
    )
  })

  it('llama addClientComment con todos los parámetros correctos', async () => {
    jest.mocked(addClientComment).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    render(<ClientReplyForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText(/escribe tu comentario/i), 'Hola mundo')
    await user.click(screen.getByRole('button', { name: /enviar comentario/i }))
    await waitFor(() =>
      expect(jest.mocked(addClientComment)).toHaveBeenCalledWith(
        'ent-1',
        'claim-1',
        'token-abc',
        'empresa-x',
        'Hola mundo',
      )
    )
  })

  it('muestra el error del servidor si la acción falla', async () => {
    jest.mocked(addClientComment).mockResolvedValue({ error: 'Token inválido' } as never)
    const user = userEvent.setup()
    render(<ClientReplyForm {...defaultProps} />)
    await user.type(screen.getByPlaceholderText(/escribe tu comentario/i), 'Texto')
    await user.click(screen.getByRole('button', { name: /enviar comentario/i }))
    await waitFor(() => expect(screen.getByText(/token inválido/i)).toBeInTheDocument())
  })
})

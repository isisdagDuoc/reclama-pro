import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReplyForm } from '@/app/(panel)/claims/[id]/_components/ReplyForm'

jest.mock('@/lib/actions/claims', () => ({
  addReply: jest.fn(),
}))

import { addReply } from '@/lib/actions/claims'

describe('ReplyForm', () => {
  beforeEach(() => jest.mocked(addReply).mockClear())

  it('renderiza el formulario', () => {
    render(<ReplyForm claimId="c1" />)
    expect(screen.getByPlaceholderText(/escribe tu respuesta/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar respuesta/i })).toBeInTheDocument()
  })

  it('muestra error si se envía vacío', async () => {
    const user = userEvent.setup()
    render(<ReplyForm claimId="c1" />)
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))
    expect(screen.getByText(/escribe una respuesta antes de enviar/i)).toBeInTheDocument()
  })

  it('limpia el textarea tras envío exitoso', async () => {
    jest.mocked(addReply).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    render(<ReplyForm claimId="c1" />)
    await user.type(screen.getByPlaceholderText(/escribe tu respuesta/i), 'Mi respuesta')
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/escribe tu respuesta/i)).toHaveValue('')
    )
  })

  it('muestra el error del servidor si la acción falla', async () => {
    jest.mocked(addReply).mockResolvedValue({ error: 'Error interno' } as never)
    const user = userEvent.setup()
    render(<ReplyForm claimId="c1" />)
    await user.type(screen.getByPlaceholderText(/escribe tu respuesta/i), 'Texto')
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))
    await waitFor(() => expect(screen.getByText(/error interno/i)).toBeInTheDocument())
  })

  it('llama addReply con claimId y mensaje recortado', async () => {
    jest.mocked(addReply).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    render(<ReplyForm claimId="claim-123" />)
    await user.type(screen.getByPlaceholderText(/escribe tu respuesta/i), '  Hola  ')
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))
    await waitFor(() =>
      expect(jest.mocked(addReply)).toHaveBeenCalledWith('claim-123', 'Hola')
    )
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddUserForm } from '@/app/(panel)/settings/users/_components/AddUserForm'

jest.mock('@/lib/actions/users', () => ({
  createEnterpriseUser: jest.fn(),
}))
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

import { createEnterpriseUser } from '@/lib/actions/users'
import { useRouter } from 'next/navigation'

const mockRefresh = jest.fn()

describe('AddUserForm', () => {
  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue({ refresh: mockRefresh } as ReturnType<typeof useRouter>)
    jest.mocked(createEnterpriseUser).mockClear()
    mockRefresh.mockClear()
  })

  it('renderiza los 4 campos del formulario', () => {
    render(<AddUserForm />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña temporal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument()
  })

  it('el select de rol tiene las opciones Agente y Administrador', () => {
    render(<AddUserForm />)
    const select = screen.getByLabelText(/rol/i)
    expect(select).toHaveDisplayValue('Agente')
    expect(screen.getByRole('option', { name: /agente/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /administrador/i })).toBeInTheDocument()
  })

  it('llama createEnterpriseUser con los datos del formulario', async () => {
    jest.mocked(createEnterpriseUser).mockResolvedValue({ success: true, user: { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'agent' } })
    const user = userEvent.setup()
    render(<AddUserForm />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana García')
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await user.type(screen.getByLabelText(/contraseña temporal/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(jest.mocked(createEnterpriseUser)).toHaveBeenCalledWith({
        name: 'Ana García',
        email: 'ana@test.com',
        password: 'clave123',
        role: 'agent',
      })
    )
  })

  it('muestra mensaje de éxito y llama router.refresh() tras creación exitosa', async () => {
    jest.mocked(createEnterpriseUser).mockResolvedValue({ success: true, user: { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'agent' } })
    const user = userEvent.setup()
    render(<AddUserForm />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana')
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await user.type(screen.getByLabelText(/contraseña temporal/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('muestra error específico cuando el email ya está registrado', async () => {
    jest.mocked(createEnterpriseUser).mockResolvedValue({ error: 'email_already_exists' })
    const user = userEvent.setup()
    render(<AddUserForm />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana')
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await user.type(screen.getByLabelText(/contraseña temporal/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/este email ya está registrado/i)
    )
  })

  it('muestra error genérico ante error desconocido del servidor', async () => {
    jest.mocked(createEnterpriseUser).mockResolvedValue({ error: 'unknown' })
    const user = userEvent.setup()
    render(<AddUserForm />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana')
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await user.type(screen.getByLabelText(/contraseña temporal/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/error inesperado/i)
    )
  })

  it('deshabilita el botón mientras carga', async () => {
    jest.mocked(createEnterpriseUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, user: { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'agent' } }), 200))
    )
    const user = userEvent.setup()
    render(<AddUserForm />)

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana')
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await user.type(screen.getByLabelText(/contraseña temporal/i), 'clave123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled()
  })
})

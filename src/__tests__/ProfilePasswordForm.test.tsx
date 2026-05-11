import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfilePasswordForm } from '@/app/(panel)/settings/profile/_components/ProfilePasswordForm'

jest.mock('@/lib/actions/profile', () => ({
  updateName: jest.fn(),
  updatePassword: jest.fn(),
}))

import { updatePassword } from '@/lib/actions/profile'

describe('ProfilePasswordForm', () => {
  beforeEach(() => jest.mocked(updatePassword).mockClear())

  it('renderiza los dos campos de contraseña y el aviso de cierre de sesión', () => {
    render(<ProfilePasswordForm />)
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByText(/cerrará la sesión/i)).toBeInTheDocument()
  })

  it('muestra error client-side si la contraseña tiene menos de 6 caracteres', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm />)

    await user.type(screen.getByLabelText(/nueva contraseña/i), '123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '123')
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 6 caracteres/i)
    expect(jest.mocked(updatePassword)).not.toHaveBeenCalled()
  })

  it('muestra error client-side si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(<ProfilePasswordForm />)

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'clave123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'clave456')
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/i)
    expect(jest.mocked(updatePassword)).not.toHaveBeenCalled()
  })

  it('llama updatePassword con la contraseña correcta cuando la validación pasa', async () => {
    jest.mocked(updatePassword).mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ProfilePasswordForm />)

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'nuevaclave')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'nuevaclave')
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() =>
      expect(jest.mocked(updatePassword)).toHaveBeenCalledWith('nuevaclave')
    )
  })

  it('muestra error del servidor si updatePassword retorna un error', async () => {
    jest.mocked(updatePassword).mockResolvedValue({ error: 'unknown' })
    const user = userEvent.setup()
    render(<ProfilePasswordForm />)

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'nuevaclave')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'nuevaclave')
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/error al cambiar la contraseña/i)
    )
  })

  it('deshabilita el botón mientras carga', async () => {
    jest.mocked(updatePassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 200))
    )
    const user = userEvent.setup()
    render(<ProfilePasswordForm />)

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'nuevaclave')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'nuevaclave')
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(screen.getByRole('button', { name: /cambiando/i })).toBeDisabled()
  })
})

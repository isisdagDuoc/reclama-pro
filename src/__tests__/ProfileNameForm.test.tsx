import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileNameForm } from '@/app/(panel)/settings/profile/_components/ProfileNameForm'

jest.mock('@/lib/actions/profile', () => ({
  updateName: jest.fn(),
  updatePassword: jest.fn(),
}))

import { updateName } from '@/lib/actions/profile'

describe('ProfileNameForm', () => {
  beforeEach(() => jest.mocked(updateName).mockClear())

  it('renderiza el campo nombre con el valor inicial', () => {
    render(<ProfileNameForm currentName="Ana García" />)
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana García')
  })

  it('renderiza vacío cuando currentName es string vacío', () => {
    render(<ProfileNameForm currentName="" />)
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('')
  })

  it('llama updateName con el nombre al guardar', async () => {
    jest.mocked(updateName).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<ProfileNameForm currentName="Ana" />)

    await user.clear(screen.getByLabelText(/nombre/i))
    await user.type(screen.getByLabelText(/nombre/i), 'Ana Beltrán')
    await user.click(screen.getByRole('button', { name: /guardar nombre/i }))

    await waitFor(() =>
      expect(jest.mocked(updateName)).toHaveBeenCalledWith('Ana Beltrán')
    )
  })

  it('muestra mensaje de éxito tras guardar correctamente', async () => {
    jest.mocked(updateName).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<ProfileNameForm currentName="Ana" />)

    await user.click(screen.getByRole('button', { name: /guardar nombre/i }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/nombre actualizado correctamente/i)
    )
  })

  it('muestra error de validación cuando el server retorna name_invalid', async () => {
    jest.mocked(updateName).mockResolvedValue({ error: 'name_invalid' })
    const user = userEvent.setup()
    render(<ProfileNameForm currentName="A" />)

    await user.click(screen.getByRole('button', { name: /guardar nombre/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/al menos 2 caracteres/i)
    )
  })

  it('deshabilita el botón mientras carga', async () => {
    jest.mocked(updateName).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
    )
    const user = userEvent.setup()
    render(<ProfileNameForm currentName="Ana" />)

    await user.click(screen.getByRole('button', { name: /guardar nombre/i }))

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled()
  })
})

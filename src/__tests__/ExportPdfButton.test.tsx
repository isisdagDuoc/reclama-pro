import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportPdfButton } from '@/app/(panel)/reports/_components/ExportPdfButton'

describe('ExportPdfButton', () => {
  let mockWindowOpen: jest.SpyInstance

  beforeEach(() => {
    mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    mockWindowOpen.mockRestore()
  })

  it('renderiza el botón', () => {
    render(<ExportPdfButton period={30} />)
    expect(screen.getByRole('button', { name: /exportar pdf/i })).toBeInTheDocument()
  })

  it('abre la URL correcta con period=30', async () => {
    const user = userEvent.setup()
    render(<ExportPdfButton period={30} />)
    await user.click(screen.getByRole('button'))
    expect(mockWindowOpen).toHaveBeenCalledWith('/api/reports/pdf?period=30', '_blank')
  })

  it('usa el period como parámetro en la URL', async () => {
    const user = userEvent.setup()
    render(<ExportPdfButton period={7} />)
    await user.click(screen.getByRole('button'))
    expect(mockWindowOpen).toHaveBeenCalledWith('/api/reports/pdf?period=7', '_blank')
  })
})

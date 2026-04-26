import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { CopyLinkButton } from '@/app/(panel)/claims/[id]/_components/CopyLinkButton'

const mockWriteText = jest.fn().mockResolvedValue(undefined)

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
})

describe('CopyLinkButton', () => {
  beforeEach(() => mockWriteText.mockClear())

  it('renderiza con el texto "Copiar link"', () => {
    render(<CopyLinkButton url="https://example.com" />)
    expect(screen.getByRole('button', { name: /copiar link/i })).toBeInTheDocument()
  })

  it('escribe en el clipboard y muestra "¡Copiado!" al hacer click', async () => {
    render(<CopyLinkButton url="https://test.com/reclamo" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(mockWriteText).toHaveBeenCalledWith('https://test.com/reclamo')
    expect(screen.getByRole('button')).toHaveTextContent('¡Copiado!')
  })

  it('vuelve a "Copiar link" después de 2 segundos', async () => {
    jest.useFakeTimers()
    render(<CopyLinkButton url="https://example.com" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })
    expect(screen.getByRole('button')).toHaveTextContent('¡Copiado!')
    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByRole('button')).toHaveTextContent('Copiar link')
    jest.useRealTimers()
  })
})

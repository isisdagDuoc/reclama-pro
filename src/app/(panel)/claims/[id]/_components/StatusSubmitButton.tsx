'use client'

import { useFormStatus } from 'react-dom'

interface StatusSubmitButtonProps {
  children: React.ReactNode
  className: string
}

export function StatusSubmitButton({ children, className }: StatusSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? 'Procesando...' : children}
    </button>
  )
}

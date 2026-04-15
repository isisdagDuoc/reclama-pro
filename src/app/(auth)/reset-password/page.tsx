'use client'

import { type FormEvent, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { confirmPasswordReset } from 'firebase/auth'
import { getAuth } from '@/lib/firebase/client'
import styles from './page.module.css'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  if (!oobCode) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.stateText}>El enlace no es válido.</p>
        <Link href="/forgot-password" className={styles.link}>
          Solicitar uno nuevo
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.stateText}>Contraseña actualizada.</p>
        <Link href="/login" className={styles.link}>
          Inicia sesión con tu nueva contraseña
        </Link>
      </div>
    )
  }

  function handleConfirmBlur() {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.')
    } else {
      setConfirmError(null)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!newPassword) {
      setError('Ingresa tu nueva contraseña.')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      // oobCode is guaranteed non-null: early return above handles the null case
      await confirmPasswordReset(auth, oobCode as string, newPassword)
      setSuccess(true)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        setError('El enlace venció o ya fue usado.')
      } else if (code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="newPassword" className={styles.label}>Nueva contraseña</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={styles.input}
          placeholder="Mínimo 6 caracteres"
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirmar contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={handleConfirmBlur}
          className={`${styles.input} ${confirmError ? styles.inputError : ''}`}
          placeholder="Repite la contraseña"
          disabled={loading}
          autoComplete="new-password"
        />
        {confirmError && (
          <span className={styles.fieldError}>{confirmError}</span>
        )}
      </div>

      {error && (
        <div className={styles.errorBox} role="alert">
          <span>{error}</span>
          {(error.includes('venció') || error.includes('usado')) && (
            <>
              {' '}
              <Link href="/forgot-password" className={styles.link}>
                Solicitar uno nuevo
              </Link>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        className={styles.button}
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Reclama Pro</h1>
        <p className={styles.subtitle}>Establece tu nueva contraseña</p>
      </div>
      <Suspense fallback={<p className={styles.loading}>Cargando...</p>}>
        <ResetPasswordForm />
      </Suspense>
      <div className={styles.footer}>
        <Link href="/login" className={styles.backLink}>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}

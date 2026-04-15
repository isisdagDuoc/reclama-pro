'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { getAuth } from '@/lib/firebase/client'
import styles from './page.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El formato no es válido.')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      await sendPasswordResetEmail(auth, email, {
        url: `${appUrl}/reset-password`,
        handleCodeInApp: true,
      })
      setSent(true)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        // No revelar si el email existe o no — mensaje genérico de éxito
        setSent(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Reclama Pro</h1>
        </div>
        <div className={styles.successBox}>
          <p className={styles.successText}>
            Si el correo está registrado, recibirás un enlace en los próximos minutos.
          </p>
          <p className={styles.successHint}>
            Revisa tu bandeja de entrada y también la carpeta de spam.
          </p>
        </div>
        <Link href="/login" className={styles.backLink}>
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Reclama Pro</h1>
        <p className={styles.subtitle}>Recupera tu contraseña</p>
        <p className={styles.description}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="tu@empresa.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>

        <Link href="/login" className={styles.backLink}>
          Volver al inicio de sesión
        </Link>
      </form>
    </div>
  )
}

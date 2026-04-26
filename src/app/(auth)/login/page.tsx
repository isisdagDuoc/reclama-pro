'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getAuth } from '@/lib/firebase/client'
import { login } from '@/lib/actions/auth'
import styles from './page.module.css'

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo.'
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    default:
      return 'Correo o contraseña incorrectos.'
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Validación client-side
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El formato del correo no es válido.')
      return
    }
    if (!password) {
      setError('Ingresa tu contraseña.')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const result = await login(idToken)
      if (result?.error) {
        setError(result.error)
      }
      // Si no hay error, el Server Action redirigió a /dashboard
    } catch (err: unknown) {
      if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) return
      const code = (err as { code?: string })?.code ?? ''
      setError(mapFirebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Reclama Pro</h1>
        <p className={styles.subtitle}>Accede a tu panel de gestión</p>
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

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="current-password"
          />
          <Link href="/forgot-password" className={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
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
          {loading ? (
            <>
              <span className={styles.spinner} />
              Iniciando sesión...
            </>
          ) : 'Iniciar sesión'}
        </button>

        <p className={styles.registerPrompt}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className={styles.link}>
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

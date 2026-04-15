'use client'

import { type FormEvent, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getAuth } from '@/lib/firebase/client'
import { registerEnterprise, checkSlugAvailability, login } from '@/lib/actions/auth'
import styles from './page.module.css'

function sanitizeSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanum → guión
    .replace(/^-+|-+$/g, '') // trim guiones extremos
    .slice(0, 40)
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const slugUserEdited = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validateSlugFormat = (value: string): boolean =>
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length >= 2

  const checkSlug = useCallback(async (value: string) => {
    if (!value) {
      setSlugStatus('idle')
      return
    }
    if (!validateSlugFormat(value)) {
      setSlugStatus('invalid')
      return
    }
    setSlugStatus('checking')
    const result = await checkSlugAvailability(value)
    if (result.error) {
      setSlugStatus('error')
    } else {
      setSlugStatus(result.available ? 'available' : 'taken')
    }
  }, [])

  // Auto-generar slug desde el nombre (si el usuario no lo editó manualmente)
  useEffect(() => {
    if (slugUserEdited.current) return
    const generated = sanitizeSlug(name)
    setSlug(generated)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      checkSlug(generated)
    }, 600)
  }, [name, checkSlug])

  function handleSlugChange(value: string) {
    slugUserEdited.current = true
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(sanitized)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      checkSlug(sanitized)
    }, 600)
  }

  function handleConfirmPasswordBlur() {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.')
    } else {
      setConfirmError(null)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Validaciones client-side
    if (!name.trim() || name.trim().length < 2) {
      setError(!name.trim() ? 'Ingresa el nombre de tu empresa.' : 'El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (name.length > 80) {
      setError('El nombre no puede superar los 80 caracteres.')
      return
    }
    if (!slug) {
      setError('El identificador URL es obligatorio.')
      return
    }
    if (!validateSlugFormat(slug)) {
      setError('Solo letras minúsculas, números y guiones (ej: mi-empresa).')
      return
    }
    if (slugStatus === 'taken') {
      setError('Este identificador ya está en uso. Prueba con otro.')
      return
    }
    if (slugStatus === 'checking') {
      setError('Espera mientras verificamos el identificador.')
      return
    }
    // slugStatus === 'error': dejar pasar — registerEnterprise verificará unicidad en la transacción
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El formato del correo no es válido (ejemplo: usuario@empresa.com).')
      return
    }
    if (!password) {
      setError('Ingresa una contraseña.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password.length > 128) {
      setError('La contraseña no puede superar los 128 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const result = await registerEnterprise(idToken, { name: name.trim(), slug, email })

      if ('error' in result) {
        if (result.error === 'slug_taken') {
          setError('Este identificador ya está en uso. Elige otro.')
        } else if (result.error === 'email_already_exists') {
          setError('Ya existe una cuenta con este correo.')
        } else {
          setError('Ocurrió un error al crear la empresa. Intenta de nuevo.')
        }
        return
      }

      // Forzar refresh del token para obtener Custom Claims recién seteados
      const freshToken = await credential.user.getIdToken(true)
      await login(freshToken)
      // login() redirige a /dashboard — no se llega aquí si es exitoso
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta con este correo.')
      } else if (code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        setError('Error al completar el registro. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const submitDisabled = loading || slugStatus === 'taken' || slugStatus === 'checking' || slugStatus === 'invalid'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Reclama Pro</h1>
        <p className={styles.subtitle}>Crea tu cuenta de empresa</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Nombre de empresa</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Mi Empresa S.A."
            maxLength={80}
            disabled={loading}
            autoComplete="organization"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="slug" className={styles.label}>
            Identificador URL
            <span className={styles.labelHint}> — solo minúsculas, números y guiones</span>
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={`${styles.input} ${slugStatus === 'available' ? styles.inputValid : ''} ${slugStatus === 'taken' || slugStatus === 'invalid' ? styles.inputError : ''}`}
            placeholder="mi-empresa"
            maxLength={40}
            disabled={loading}
            autoComplete="off"
          />
          {slugStatus === 'checking' && (
            <span className={styles.slugChecking}>Verificando disponibilidad...</span>
          )}
          {slugStatus === 'available' && (
            <span className={styles.slugAvailable}>Disponible</span>
          )}
          {slugStatus === 'taken' && (
            <span className={styles.slugTaken}>Este identificador ya está en uso. Prueba con otro.</span>
          )}
          {slugStatus === 'invalid' && slug && (
            <span className={styles.slugTaken}>Solo letras minúsculas, números y guiones (ej: mi-empresa).</span>
          )}
          {slugStatus === 'error' && (
            <span className={styles.slugChecking}>No se pudo verificar disponibilidad — se comprobará al crear la cuenta.</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email del administrador</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="admin@empresa.com"
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
            placeholder="Mínimo 6 caracteres"
            maxLength={128}
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
            onBlur={handleConfirmPasswordBlur}
            className={`${styles.input} ${confirmError ? styles.inputError : ''}`}
            placeholder="Repite la contraseña"
            maxLength={128}
            disabled={loading}
            autoComplete="new-password"
          />
          {confirmError && (
            <span className={styles.fieldError}>{confirmError}</span>
          )}
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.button}
          disabled={submitDisabled}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className={styles.loginPrompt}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className={styles.link}>
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

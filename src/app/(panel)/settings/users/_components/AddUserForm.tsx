'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEnterpriseUser } from '@/lib/actions/users'
import styles from './AddUserForm.module.css'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'No tenés permisos para realizar esta acción.',
  name_invalid: 'El nombre debe tener al menos 2 caracteres.',
  email_invalid: 'Ingresá un email válido.',
  password_too_short: 'La contraseña debe tener al menos 6 caracteres.',
  email_already_exists: 'Este email ya está registrado en el sistema.',
  unknown: 'Ocurrió un error inesperado. Intentá de nuevo.',
}

export function AddUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'agent'>('agent')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const result = await createEnterpriseUser({ name, email, password, role })
    setLoading(false)

    if ('error' in result) {
      setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.unknown)
      return
    }

    setSuccess(true)
    setName('')
    setEmail('')
    setPassword('')
    setRole('agent')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="userName" className={styles.label}>Nombre completo</label>
          <input
            id="userName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Ana García"
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="userEmail" className={styles.label}>Email</label>
          <input
            id="userEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="ana@empresa.com"
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="userPassword" className={styles.label}>Contraseña temporal</label>
          <input
            id="userPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="userRole" className={styles.label}>Rol</label>
          <select
            id="userRole"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'agent')}
            className={styles.select}
            disabled={loading}
          >
            <option value="agent">Agente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {success && (
        <div className={styles.successMsg} role="status">
          Usuario creado correctamente. Ya puede iniciar sesión en el panel.
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Creando...' : 'Crear usuario →'}
        </button>
      </div>
    </form>
  )
}

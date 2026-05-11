'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/actions/profile'
import styles from './ProfileForm.module.css'

export function ProfilePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const result = await updatePassword(newPassword)
    // Si result es void, el server hizo redirect — no llega aquí.
    // Si hay error, lo mostramos.
    setLoading(false)
    if (result && 'error' in result) {
      setError('Ocurrió un error al cambiar la contraseña. Intentá de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.warning}>
        Al cambiar la contraseña se cerrará la sesión en todos los dispositivos y tendrás que volver a iniciar sesión.
      </div>

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
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirmar contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          placeholder="Repetí la contraseña"
          disabled={loading}
        />
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitButtonDanger} disabled={loading}>
          {loading ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}

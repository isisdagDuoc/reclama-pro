'use client'

import { useState } from 'react'
import { updateName } from '@/lib/actions/profile'
import styles from './ProfileForm.module.css'

interface ProfileNameFormProps {
  currentName: string
}

export function ProfileNameForm({ currentName }: ProfileNameFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(currentName)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const result = await updateName(name)
    setLoading(false)

    if ('error' in result) {
      setError(
        result.error === 'name_invalid'
          ? 'El nombre debe tener al menos 2 caracteres.'
          : 'Ocurrió un error inesperado. Intentá de nuevo.'
      )
      return
    }

    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="profileName" className={styles.label}>Nombre</label>
        <input
          id="profileName"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setSuccess(false) }}
          className={styles.input}
          placeholder="Tu nombre completo"
          disabled={loading}
        />
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {success && <div className={styles.success} role="status">Nombre actualizado correctamente.</div>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar nombre'}
        </button>
      </div>
    </form>
  )
}

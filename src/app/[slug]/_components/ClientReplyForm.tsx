'use client'

import { useState } from 'react'
import { addClientComment } from '@/lib/actions/portal'
import styles from './ClientReplyForm.module.css'

interface Props {
  enterpriseId: string
  claimId: string
  accessToken: string
  slug: string
}

export function ClientReplyForm({ enterpriseId, claimId, accessToken, slug }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) { setError('Escribe un comentario antes de enviar.'); return }
    setError(null)
    setLoading(true)
    const result = await addClientComment(enterpriseId, claimId, accessToken, slug, message.trim())
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>Agregar comentario</label>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Escribe tu comentario..."
        className={styles.textarea}
        rows={4}
        disabled={loading}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar comentario'}
        </button>
      </div>
    </form>
  )
}

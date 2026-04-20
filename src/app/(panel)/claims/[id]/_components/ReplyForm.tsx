'use client'

import { useState } from 'react'
import { addReply } from '@/lib/actions/claims'
import styles from './ReplyForm.module.css'

export function ReplyForm({ claimId }: { claimId: string }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) { setError('Escribe una respuesta antes de enviar.'); return }
    setError(null)
    setLoading(true)
    const result = await addReply(claimId, message.trim())
    setLoading(false)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>Responder al cliente</label>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Escribe tu respuesta..."
        className={styles.textarea}
        rows={4}
        disabled={loading}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar respuesta'}
        </button>
      </div>
    </form>
  )
}

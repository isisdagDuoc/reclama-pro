'use client'

import { useState } from 'react'
import { submitRating } from '@/lib/actions/portal'
import styles from './RatingForm.module.css'

interface Props {
  enterpriseId: string
  claimId: string
  accessToken: string
  slug: string
}

export function RatingForm({ enterpriseId, claimId, accessToken, slug }: Props) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) { setError('Selecciona una valoración.'); return }
    setError(null)
    setLoading(true)
    const result = await submitRating(enterpriseId, claimId, accessToken, slug, selected)
    setLoading(false)
    if (result?.error) setError(result.error)
  }

  const display = hovered || selected

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.title}>¿Cómo fue tu experiencia?</p>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`${styles.star} ${n <= display ? styles.starActive : ''}`}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            disabled={loading}
          >
            ★
          </button>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={loading || !selected}>
        {loading ? 'Enviando...' : 'Enviar valoración'}
      </button>
    </form>
  )
}

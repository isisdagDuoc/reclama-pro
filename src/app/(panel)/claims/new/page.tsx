'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClaim } from '@/lib/actions/claims'
import { CLAIM_CATEGORIES } from '@/constants'
import type { ClaimCategory } from '@/types'
import styles from './page.module.css'

export default function NewClaimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [category, setCategory] = useState<ClaimCategory>('other')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!customerName.trim()) { setError('Ingresa el nombre del cliente.'); return }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Ingresa un email válido.'); return
    }
    if (!subject.trim()) { setError('Ingresa el asunto del reclamo.'); return }
    if (!description.trim()) { setError('Ingresa la descripción del reclamo.'); return }

    setLoading(true)
    const result = await createClaim({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      category,
      subject: subject.trim(),
      description: description.trim(),
    })
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    router.push(`/claims/${result.claimId}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuevo reclamo</h1>
        <Link href="/claims" className={styles.cancelLink}>Cancelar</Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="customerName" className={styles.label}>Nombre del cliente</label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className={styles.input}
              placeholder="Juan Pérez"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerEmail" className={styles.label}>Email del cliente</label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              className={styles.input}
              placeholder="juan@email.com"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category" className={styles.label}>Categoría</label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value as ClaimCategory)}
              className={styles.select}
              disabled={loading}
            >
              {Object.entries(CLAIM_CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="subject" className={styles.label}>Asunto</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={styles.input}
              placeholder="Breve descripción del problema"
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={styles.textarea}
            rows={5}
            placeholder="Describe el reclamo en detalle..."
            disabled={loading}
          />
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creando...' : 'Crear reclamo →'}
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { deleteClaim } from '@/lib/actions/claims'
import styles from './DeleteClaimButton.module.css'

export function DeleteClaimButton({ claimId }: { claimId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteClaim(claimId)
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className={styles.deleteBtn}>
        Eliminar reclamo
      </button>
    )
  }

  return (
    <div className={styles.confirm}>
      <p className={styles.confirmText}>
        Esta acción elimina el reclamo y su historial. No se puede deshacer.
      </p>
      <div className={styles.confirmActions}>
        <button
          onClick={() => setConfirming(false)}
          className={styles.cancelBtn}
          disabled={loading}
        >
          Cancelar
        </button>
        <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={loading}>
          {loading ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
      </div>
    </div>
  )
}

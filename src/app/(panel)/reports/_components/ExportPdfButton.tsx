'use client'

import styles from './ExportPdfButton.module.css'

export function ExportPdfButton({ period }: { period: number }) {
  return (
    <button
      type="button"
      className={styles.btn}
      onClick={() => window.open(`/api/reports/pdf?period=${period}`, '_blank')}
    >
      ↓ Exportar PDF
    </button>
  )
}

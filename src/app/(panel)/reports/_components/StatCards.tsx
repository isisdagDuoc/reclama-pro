import type { ReportData } from '@/lib/queries/reports'
import styles from './StatCards.module.css'

export function StatCards({ totals }: { totals: ReportData['totals'] }) {
  const { totalClaims, resolutionRate, averageRating, newThisWeek } = totals

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <p className={styles.label}>Total reclamos</p>
        <p className={styles.value}>{totalClaims}</p>
        <p className={styles.sub}>en el período seleccionado</p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Tasa de resolución</p>
        <p className={`${styles.value} ${styles.green}`}>{resolutionRate.toFixed(1)}%</p>
        <p className={styles.sub}>resueltos o cerrados</p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Rating promedio</p>
        <p className={styles.value}>
          {averageRating !== null ? averageRating.toFixed(1) : '—'}
        </p>
        <p className={styles.sub}>
          {averageRating !== null ? '★ sobre valoraciones recibidas' : 'sin valoraciones aún'}
        </p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Nuevos esta semana</p>
        <p className={styles.value}>{newThisWeek}</p>
        <p className={styles.sub}>últimos 7 días</p>
      </div>
    </div>
  )
}

import type { ReportData } from '@/lib/queries/reports'
import styles from './StatusDistribution.module.css'

const STATUS_CONFIG = {
  open:        { label: 'Abierto',    mod: styles.open },
  in_progress: { label: 'En proceso', mod: styles.inProgress },
  resolved:    { label: 'Resuelto',   mod: styles.resolved },
  closed:      { label: 'Cerrado',    mod: styles.closed },
} as const

export function StatusDistribution({
  distribution,
  percentages,
}: {
  distribution: ReportData['statusDistribution']
  percentages: ReportData['statusPercentages']
}) {
  return (
    <div className={styles.grid}>
      {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(key => {
        const { label, mod } = STATUS_CONFIG[key]
        return (
          <div key={key} className={`${styles.tile} ${mod}`}>
            <p className={styles.label}>{label}</p>
            <p className={styles.count}>{distribution[key]}</p>
            <p className={styles.pct}>{percentages[key].toFixed(1)}%</p>
          </div>
        )
      })}
    </div>
  )
}

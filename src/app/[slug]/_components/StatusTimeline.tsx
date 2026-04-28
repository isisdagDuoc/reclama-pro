import type { ClaimStatus } from '@/types'
import styles from './StatusTimeline.module.css'

const STEPS: { status: ClaimStatus; label: string }[] = [
  { status: 'open',        label: 'Abierto'    },
  { status: 'in_progress', label: 'En proceso' },
  { status: 'resolved',    label: 'Resuelto'   },
  { status: 'closed',      label: 'Cerrado'    },
]

const ORDER: Record<ClaimStatus, number> = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3,
}

export function StatusTimeline({ current }: { current: ClaimStatus }) {
  const currentIndex = ORDER[current]

  return (
    <div className={styles.timeline}>
      {STEPS.map((step, i) => {
        const isPast    = ORDER[step.status] < currentIndex
        const isCurrent = step.status === current
        const isFuture  = ORDER[step.status] > currentIndex

        return (
          <div key={step.status} className={styles.stepWrapper}>
            <div className={styles.stepRow}>
              {i > 0 && (
                <div
                  className={`${styles.connector} ${isPast || isCurrent ? styles.connectorActive : ''}`}
                />
              )}
              <div
                className={`${styles.dot} ${
                  isCurrent ? styles.dotCurrent :
                  isPast    ? styles.dotPast    :
                              styles.dotFuture
                }`}
              />
              {i < STEPS.length - 1 && (
                <div
                  className={`${styles.connector} ${isPast ? styles.connectorActive : ''}`}
                />
              )}
            </div>
            <span
              className={`${styles.label} ${
                isCurrent ? styles.labelCurrent :
                isFuture  ? styles.labelFuture  :
                            styles.labelPast
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

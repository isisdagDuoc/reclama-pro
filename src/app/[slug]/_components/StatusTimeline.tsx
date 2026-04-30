import type { ClaimStatus } from '@/types'
import styles from './StatusTimeline.module.css'

const STEPS: { status: ClaimStatus; label: string }[] = [
  { status: 'open',        label: 'Recibido'   },
  { status: 'in_progress', label: 'En proceso' },
  { status: 'resolved',    label: 'Resuelto'   },
  { status: 'closed',      label: 'Cerrado'    },
]

const STATUS_DESCRIPTIONS: Record<ClaimStatus, string> = {
  open:        'Tu reclamo fue recibido. El equipo lo revisará pronto.',
  in_progress: 'El equipo de soporte está trabajando en tu caso activamente.',
  resolved:    'Tu reclamo fue resuelto. Contanos cómo fue tu experiencia.',
  closed:      'Este reclamo fue cerrado.',
}

const ORDER: Record<ClaimStatus, number> = {
  open: 0, in_progress: 1, resolved: 2, closed: 3,
}

export function StatusTimeline({ current }: { current: ClaimStatus }) {
  const currentIndex = ORDER[current]

  return (
    <div className={styles.wrapper}>
      <div className={styles.stepper}>
        {STEPS.map((step, i) => {
          const isPast    = i < currentIndex
          const isCurrent = i === currentIndex

          const stepClass = isCurrent ? styles.stepCurrent
                          : isPast    ? styles.stepPast
                                      : styles.stepFuture

          const dotClass  = isCurrent ? styles.dotCurrent
                          : isPast    ? styles.dotPast
                                      : styles.dotFuture

          const labelClass = isCurrent ? styles.labelCurrent
                           : isPast    ? styles.labelPast
                                       : styles.labelFuture

          return (
            <div key={step.status} className={`${styles.step} ${stepClass}`}>
              <div className={`${styles.dot} ${dotClass}`} />
              <span className={`${styles.label} ${labelClass}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <p className={styles.description}>{STATUS_DESCRIPTIONS[current]}</p>
    </div>
  )
}

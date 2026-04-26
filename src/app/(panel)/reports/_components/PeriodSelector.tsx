import Link from 'next/link'
import type { ReportPeriod } from '@/lib/queries/reports'
import styles from './PeriodSelector.module.css'

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 7,   label: '7 días' },
  { value: 30,  label: '30 días' },
  { value: 90,  label: '90 días' },
  { value: 365, label: 'Este año' },
]

export function PeriodSelector({ current }: { current: ReportPeriod }) {
  return (
    <div className={styles.wrap}>
      {PERIODS.map(({ value, label }) => (
        <Link
          key={value}
          href={`/reports?period=${value}`}
          className={`${styles.btn} ${current === value ? styles.active : ''}`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

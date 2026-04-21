import type { ReportWeekBucket } from '@/lib/queries/reports'
import styles from './WeeklyTrend.module.css'

export function WeeklyTrend({ buckets }: { buckets: ReportWeekBucket[] }) {
  const max = Math.max(...buckets.map(b => b.count), 1)

  return (
    <div className={styles.wrap}>
      <div className={styles.chart}>
        {buckets.map(bucket => {
          const heightPct = Math.max((bucket.count / max) * 100, bucket.count > 0 ? 4 : 0)
          return (
            <div key={bucket.startDate} className={styles.col}>
              <span className={styles.n}>{bucket.count > 0 ? bucket.count : ''}</span>
              <div
                className={`${styles.bar} ${bucket.count === max && max > 0 ? styles.peak : ''}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className={styles.label}>{bucket.weekLabel}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

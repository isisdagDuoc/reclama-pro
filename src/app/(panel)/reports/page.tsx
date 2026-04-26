import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { getReportData, parsePeriod } from '@/lib/queries/reports'
import { StatCards } from './_components/StatCards'
import { StatusDistribution } from './_components/StatusDistribution'
import { WeeklyTrend } from './_components/WeeklyTrend'
import { CategoryTable } from './_components/CategoryTable'
import { PeriodSelector } from './_components/PeriodSelector'
import { ExportPdfButton } from './_components/ExportPdfButton'
import styles from './page.module.css'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodRaw } = await searchParams

  const session = await getSessionUser()
  const period = parsePeriod(periodRaw)
  const db = getDb()
  const data = await getReportData(db, session.enterpriseId, period)

  const isEmpty = data.totals.totalClaims === 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes</h1>
          <p className={styles.subtitle}>{data.periodLabel}</p>
        </div>
        <div className={styles.controls}>
          <PeriodSelector current={period} />
          <ExportPdfButton period={period} />
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Sin reclamos en este período</p>
          <p className={styles.emptySub}>
            Seleccioná un período más amplio o esperá que se registren reclamos.
          </p>
        </div>
      ) : (
        <>
          <StatCards totals={data.totals} />

          <div className={styles.row2}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <p className={styles.cardTitle}>Distribución por estado</p>
                <p className={styles.cardSub}>{data.totals.totalClaims} reclamos en total</p>
              </div>
              <div className={styles.cardBody}>
                <StatusDistribution
                  distribution={data.statusDistribution}
                  percentages={data.statusPercentages}
                />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <p className={styles.cardTitle}>Tendencia semanal</p>
                <p className={styles.cardSub}>Nuevos reclamos por semana</p>
              </div>
              <WeeklyTrend buckets={data.weeklyTrend} />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Reclamos por categoría</p>
              <p className={styles.cardSub}>Ordenados por volumen</p>
            </div>
            <CategoryTable rows={data.byCategory} />
          </div>
        </>
      )}
    </div>
  )
}

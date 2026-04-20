import Link from 'next/link'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/queries/dashboard'
import { getEnterpriseName } from '@/lib/queries/enterprise'
import { CLAIM_CATEGORIES, CLAIM_STATUSES } from '@/constants'
import type { ClaimStatus } from '@/types'
import styles from './page.module.css'

function formatRelativeDate(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

function renderStars(rating: number): string {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

const badgeClass: Record<ClaimStatus, string> = {
  open: styles.badgeOpen,
  in_progress: styles.badgeInProgress,
  resolved: styles.badgeResolved,
  closed: styles.badgeClosed,
}

export default async function DashboardPage() {
  const user = await getSessionUser()
  const db = getDb()

  const [enterpriseName, data] = await Promise.all([
    getEnterpriseName(db, user.enterpriseId),
    getDashboardData(db, user.enterpriseId),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>{enterpriseName} — últimos 30 días</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total reclamos</div>
          <div className={`${styles.statValue} ${styles.statValueBlue}`}>{data.totalClaims}</div>
          <div className={styles.statDelta}>+{data.thisWeekClaims} esta semana</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Abiertos</div>
          <div className={`${styles.statValue} ${styles.statValueBlue}`}>{data.openClaims}</div>
          <div className={styles.statDelta}>requieren atención</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>En proceso</div>
          <div className={styles.statValue}>{data.inProgressClaims}</div>
          <div className={styles.statDelta}>en seguimiento</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rating promedio</div>
          <div className={styles.statValue}>
            {data.avgRating !== null ? data.avgRating.toFixed(1) : 'Sin datos'}
          </div>
          <div className={styles.statDelta}>
            {data.avgRating !== null ? renderStars(data.avgRating) : '—'}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>Reclamos recientes</span>
          <Link href="/claims" className={styles.viewAllBtn}>Ver todos →</Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Ticket</th>
              <th className={styles.th}>Cliente</th>
              <th className={styles.th}>Descripción</th>
              <th className={styles.th}>Categoría</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.recentClaims.map((claim) => (
              <tr key={claim.id}>
                <td className={styles.tdMono}>{claim.ticketNumber}</td>
                <td className={styles.td}>{claim.customerName}</td>
                <td className={styles.td}>{claim.subject}</td>
                <td className={styles.td}>{CLAIM_CATEGORIES[claim.category]}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${badgeClass[claim.status]}`}>
                    {CLAIM_STATUSES[claim.status]}
                  </span>
                </td>
                <td className={styles.tdDate}>{formatRelativeDate(claim.createdAt)}</td>
              </tr>
            ))}
            {data.recentClaims.length === 0 && (
              <tr>
                <td className={styles.td} colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  No hay reclamos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

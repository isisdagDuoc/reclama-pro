import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/firebase/session'
import { getClaims, getClaimCounts } from '@/lib/queries/claims'
import { CLAIM_STATUSES, CLAIM_CATEGORIES } from '@/constants'
import { ClaimsFilters } from './_components/ClaimsFilters'
import type { ClaimStatus } from '@/types'
import styles from './page.module.css'

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams

  const session = await getSessionUser()
  if (!session) redirect('/login')

  const db = getDb()
  const [claims, counts] = await Promise.all([
    getClaims(db, session.enterpriseId, {
      status: status as ClaimStatus | undefined,
      search,
    }),
    getClaimCounts(db, session.enterpriseId),
  ])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reclamos</h1>
          <p className={styles.subtitle}>{total} reclamo{total !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/claims/new" className={styles.newButton}>+ Nuevo reclamo</Link>
      </div>

      <div className={styles.tableWrapper}>
        <ClaimsFilters currentStatus={status} currentSearch={search} counts={counts} />

        {claims.length === 0 ? (
          <p className={styles.empty}>No hay reclamos para estos filtros.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Ticket</th>
                <th className={styles.th}>Cliente</th>
                <th className={styles.th}>Descripción</th>
                <th className={styles.th}>Categoría</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.id} className={styles.tr}>
                  <td className={`${styles.td} ${styles.ticket}`}>{claim.ticketNumber}</td>
                  <td className={styles.td}>{claim.customerName}</td>
                  <td className={`${styles.td} ${styles.subject}`}>{claim.subject}</td>
                  <td className={styles.td}>{CLAIM_CATEGORIES[claim.category]}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[claim.status]}`}>
                      {CLAIM_STATUSES[claim.status]}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.date}`}>
                    {claim.createdAt.toDate().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className={styles.td}>
                    <Link href={`/claims/${claim.id}`} className={styles.viewLink}>Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

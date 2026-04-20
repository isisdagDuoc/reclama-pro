import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/firebase/session'
import { getClaim } from '@/lib/queries/claims'
import { CLAIM_STATUSES, CLAIM_CATEGORIES } from '@/constants'
import styles from './page.module.css'

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id } = await params
  const { created } = await searchParams

  const session = await getSessionUser()
  if (!session) redirect('/login')

  const db = getDb()
  const claim = await getClaim(db, session.enterpriseId, id)
  if (!claim) notFound()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/claims" className={styles.back}>← Reclamos</Link>
          <h1 className={styles.title}>{claim.ticketNumber}</h1>
        </div>
        <span className={`${styles.badge} ${styles[claim.status]}`}>
          {CLAIM_STATUSES[claim.status]}
        </span>
      </div>

      {created === '1' && (
        <div className={styles.successBanner}>
          ✓ Reclamo creado correctamente
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>Cliente</span>
            <span className={styles.value}>{claim.customerName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{claim.customerEmail}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Categoría</span>
            <span className={styles.value}>{CLAIM_CATEGORIES[claim.category]}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Fecha</span>
            <span className={styles.value}>
              {claim.createdAt.toDate().toLocaleDateString('es-CL')}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.field}>
          <span className={styles.label}>Asunto</span>
          <span className={styles.value}>{claim.subject}</span>
        </div>

        <div className={styles.field} style={{ marginTop: 16 }}>
          <span className={styles.label}>Descripción</span>
          <p className={styles.description}>{claim.description}</p>
        </div>
      </div>
    </div>
  )
}

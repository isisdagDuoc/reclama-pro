import { notFound } from 'next/navigation'
import { getDb } from '@/lib/firebase/admin'
import {
  getEnterpriseBySlug,
  getClaimByToken,
  getClaimHistory,
} from '@/lib/queries/claims'
import { CLAIM_STATUSES, CLAIM_CATEGORIES } from '@/constants'
import { ClientReplyForm } from './_components/ClientReplyForm'
import { RatingForm } from './_components/RatingForm'
import styles from './page.module.css'

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await params
  const { token } = await searchParams
  if (!token) notFound()

  const db = getDb()
  const enterprise = await getEnterpriseBySlug(db, slug)
  if (!enterprise) notFound()

  const claim = await getClaimByToken(db, enterprise.id, token)
  if (!claim) notFound()

  const history = await getClaimHistory(db, enterprise.id, claim.id)

  const isActive = claim.status === 'open' || claim.status === 'in_progress'
  const canRate =
    (claim.status === 'resolved' || claim.status === 'closed') &&
    claim.rating === null

  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.navTitle}>{enterprise.name}</span>
        <span className={styles.navDot}>·</span>
        <span className={styles.navTicket}>{claim.ticketNumber}</span>
      </nav>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.claimMeta}>
            <span className={`${styles.badge} ${styles[claim.status]}`}>
              {CLAIM_STATUSES[claim.status]}
            </span>
            <span className={styles.category}>
              {CLAIM_CATEGORIES[claim.category]}
            </span>
          </div>

          <h1 className={styles.subject}>{claim.subject}</h1>
          <p className={styles.clientDate}>
            Ingresado el{' '}
            {claim.createdAt
              .toDate()
              .toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
          </p>

          <hr className={styles.divider} />
          <p className={styles.description}>{claim.description}</p>

          {history.length > 0 && (
            <>
              <hr className={styles.divider} />
              <h2 className={styles.historyTitle}>Comunicaciones</h2>
              <div className={styles.historyList}>
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className={`${styles.entry} ${
                      entry.authorRole === 'agent'
                        ? styles.entryAgent
                        : styles.entryClient
                    }`}
                  >
                    <span className={styles.entryAuthor}>
                      {entry.authorRole === 'agent' ? 'Soporte' : 'Tú'}{' — '}
                      {entry.timestamp
                        .toDate()
                        .toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      ,{' '}
                      {entry.timestamp
                        .toDate()
                        .toLocaleTimeString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </span>
                    <p className={styles.entryText}>{entry.action}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {isActive && (
            <ClientReplyForm
              enterpriseId={enterprise.id}
              claimId={claim.id}
              accessToken={token}
              slug={slug}
            />
          )}

          {canRate && (
            <RatingForm
              enterpriseId={enterprise.id}
              claimId={claim.id}
              accessToken={token}
              slug={slug}
            />
          )}

          {!isActive && claim.rating !== null && (
            <div className={styles.ratingDone}>
              <p className={styles.ratingLabel}>Tu valoración</p>
              <span className={styles.ratingStars}>
                {'★'.repeat(claim.rating)}
                {'☆'.repeat(5 - claim.rating)}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

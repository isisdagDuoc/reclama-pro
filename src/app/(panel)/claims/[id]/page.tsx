import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { getClaim, getClaimHistory, getEnterprise } from '@/lib/queries/claims'
import { updateClaimStatus } from '@/lib/actions/claims'
import { CLAIM_STATUSES, CLAIM_CATEGORIES } from '@/constants'
import { ReplyForm } from './_components/ReplyForm'
import { CopyLinkButton } from './_components/CopyLinkButton'
import { DeleteClaimButton } from './_components/DeleteClaimButton'
import { StatusSubmitButton } from './_components/StatusSubmitButton'
import type { ClaimStatus } from '@/types'
import styles from './page.module.css'

const STATUS_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  open:        ['in_progress'],
  in_progress: ['resolved', 'closed'],
  resolved:    ['closed'],
  closed:      [],
}

const ACTION_LABELS: Partial<Record<ClaimStatus, string>> = {
  in_progress: '▶ Iniciar proceso',
  resolved:    '✓ Marcar como resuelto',
  closed:      '✕ Cerrar sin resolver',
}

function getActionLabel(currentStatus: ClaimStatus, nextStatus: ClaimStatus): string {
  if (nextStatus === 'closed' && currentStatus === 'resolved') return '✕ Cerrar'
  return ACTION_LABELS[nextStatus] ?? nextStatus
}

const ACTION_STYLE: Partial<Record<ClaimStatus, string>> = {
  in_progress: 'actionBlue',
  resolved:    'actionGreen',
  closed:      'actionRed',
}

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
  const db = getDb()
  const [claim, history, enterprise] = await Promise.all([
    getClaim(db, session.enterpriseId, id),
    getClaimHistory(db, session.enterpriseId, id),
    getEnterprise(db, session.enterpriseId),
  ])
  if (!claim) notFound()

  const nextStatuses = STATUS_TRANSITIONS[claim.status]
  const clientUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${enterprise?.slug}?token=${claim.accessToken}`

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/claims" className={styles.breadcrumbLink}>← Reclamos</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{claim.ticketNumber}</span>
      </nav>

      {created === '1' && (
        <div className={styles.successBanner}>✓ Reclamo creado correctamente</div>
      )}

      <div className={styles.layout}>
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.main}>
          {/* Card info */}
          <div className={styles.card}>
            <div className={styles.claimMeta}>
              <span className={`${styles.badge} ${styles[claim.status]}`}>
                {CLAIM_STATUSES[claim.status]}
              </span>
              <span className={styles.category}>
                Categoría: {CLAIM_CATEGORIES[claim.category]}
              </span>
            </div>
            <h1 className={styles.subject}>{claim.subject}</h1>
            <p className={styles.clientDate}>
              {claim.customerName} · {claim.createdAt.toDate().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <hr className={styles.divider} />
            <p className={styles.description}>{claim.description}</p>
          </div>

          {/* Card historial */}
          <div className={styles.card}>
            <h2 className={styles.historyTitle}>Historial de comunicación</h2>
            {history.length === 0 ? (
              <p className={styles.historyEmpty}>Sin comunicaciones aún.</p>
            ) : (
              <div className={styles.historyList}>
                {history.map(entry => (
                  <div key={entry.id} className={`${styles.entry} ${entry.authorRole === 'agent' ? styles.entryAgent : styles.entryClient}`}>
                    <span className={styles.entryAuthor}>
                      {entry.authorName ?? entry.authorId} ({entry.authorRole === 'agent' ? 'agente' : 'cliente'})
                      {' — '}
                      {entry.timestamp.toDate().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })},
                      {' '}
                      {entry.timestamp.toDate().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className={styles.entryText}>{entry.action}</p>
                  </div>
                ))}
              </div>
            )}
            {claim.status !== 'closed' && <ReplyForm claimId={claim.id} />}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          {/* Estado actual */}
          <div className={styles.sideCard}>
            <p className={styles.sideLabel}>ESTADO ACTUAL</p>
            <span className={`${styles.badge} ${styles[claim.status]}`}>
              {CLAIM_STATUSES[claim.status]}
            </span>

            {nextStatuses.length > 0 && (
              <>
                <p className={styles.sideLabel} style={{ marginTop: 16 }}>CAMBIAR A</p>
                <div className={styles.actionButtons}>
                  {nextStatuses.map(next => {
                    const action = updateClaimStatus.bind(null, claim.id, next)
                    return (
                      <form key={next} action={action}>
                        <StatusSubmitButton
                          className={`${styles.actionBtn} ${styles[ACTION_STYLE[next] ?? '']}`}
                        >
                          {getActionLabel(claim.status, next)}
                        </StatusSubmitButton>
                      </form>
                    )
                  })}
                </div>
                <p className={styles.sideHint}>Solo se muestran los pasos siguientes posibles.</p>
              </>
            )}
          </div>

          {/* Cliente */}
          <div className={styles.sideCard}>
            <p className={styles.sideLabel}>CLIENTE</p>
            <p className={styles.sideValue}>{claim.customerName}</p>
            <p className={styles.sideMuted}>{claim.customerEmail}</p>
          </div>

          {/* Ticket */}
          <div className={styles.sideCard}>
            <p className={styles.sideLabel}>TICKET</p>
            <p className={styles.sideValue}>{claim.ticketNumber}</p>
            <p className={styles.sideMuted}>
              Creado {claim.createdAt.toDate().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Link del cliente */}
          <div className={styles.linkCard}>
            <p className={styles.sideLabel} style={{ color: '#065f46' }}>LINK DEL CLIENTE</p>
            <p className={styles.linkUrl}>{clientUrl}</p>
            <CopyLinkButton url={clientUrl} />
          </div>

          {/* Eliminar — solo admin */}
          {session.role === 'admin' && (
            <div className={styles.sideCard}>
              <DeleteClaimButton claimId={claim.id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

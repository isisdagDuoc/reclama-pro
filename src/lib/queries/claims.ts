import type { Firestore } from 'firebase-admin/firestore'
import type { Claim, ClaimStatus } from '@/types'

export async function getClaimCounts(
  db: Firestore,
  enterpriseId: string
): Promise<Record<ClaimStatus, number>> {
  const base = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')

  const [open, inProgress, resolved, closed] = await Promise.all([
    base.where('status', '==', 'open').count().get(),
    base.where('status', '==', 'in_progress').count().get(),
    base.where('status', '==', 'resolved').count().get(),
    base.where('status', '==', 'closed').count().get(),
  ])

  return {
    open: open.data().count,
    in_progress: inProgress.data().count,
    resolved: resolved.data().count,
    closed: closed.data().count,
  }
}

interface ClaimsFilter {
  status?: ClaimStatus
  search?: string
}

export async function getClaims(
  db: Firestore,
  enterpriseId: string,
  filter?: ClaimsFilter
): Promise<Claim[]> {
  let query = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims') as FirebaseFirestore.Query

  if (filter?.status) {
    query = query.where('status', '==', filter.status)
  }

  const snap = await query.get()
  let claims = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Claim)

  claims.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())

  if (filter?.search) {
    const term = filter.search.toLowerCase()
    claims = claims.filter(c =>
      c.customerName.toLowerCase().includes(term) ||
      c.ticketNumber.toLowerCase().includes(term) ||
      c.customerEmail.toLowerCase().includes(term)
    )
  }

  return claims
}

export async function getClaim(
  db: Firestore,
  enterpriseId: string,
  claimId: string
): Promise<Claim | null> {
  const snap = await db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .doc(claimId)
    .get()

  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Claim
}

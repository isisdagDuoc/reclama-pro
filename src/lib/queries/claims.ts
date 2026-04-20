import type { Firestore } from 'firebase-admin/firestore'
import type { Claim, ClaimStatus } from '@/types'

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
    .collection('claims')
    .orderBy('createdAt', 'desc') as FirebaseFirestore.Query

  if (filter?.status) {
    query = query.where('status', '==', filter.status)
  }

  const snap = await query.get()
  let claims = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Claim)

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

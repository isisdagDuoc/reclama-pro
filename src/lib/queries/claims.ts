import type { Firestore } from 'firebase-admin/firestore'
import type { Claim } from '@/types'

export async function getClaims(db: Firestore, enterpriseId: string): Promise<Claim[]> {
  const snap = await db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .orderBy('createdAt', 'desc')
    .get()

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Claim)
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

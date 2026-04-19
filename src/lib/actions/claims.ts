'use server'

import { redirect } from 'next/navigation'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/firebase/session'
import type { ClaimCategory } from '@/types'

interface CreateClaimInput {
  customerName: string
  customerEmail: string
  category: ClaimCategory
  subject: string
  description: string
}

export async function createClaim(
  input: CreateClaimInput
): Promise<{ claimId: string } | { error: string }> {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const { enterpriseId } = session
  const db = getFirestore(getFirebaseAdmin())
  const enterpriseRef = db.collection('enterprises').doc(enterpriseId)

  try {
    const result = await db.runTransaction(async (tx) => {
      const enterpriseSnap = await tx.get(enterpriseRef)
      const counter = (enterpriseSnap.data()?.claimCounter ?? 0) + 1
      const ticketNumber = `REC-${String(counter).padStart(5, '0')}`
      const claimRef = enterpriseRef.collection('claims').doc()

      tx.update(enterpriseRef, { claimCounter: counter })
      tx.set(claimRef, {
        ticketNumber,
        status: 'open',
        category: input.category,
        subject: input.subject,
        description: input.description,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        accessToken: crypto.randomUUID(),
        rating: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      return { claimId: claimRef.id }
    })

    return result
  } catch {
    return { error: 'No se pudo crear el reclamo. Intenta de nuevo.' }
  }
}

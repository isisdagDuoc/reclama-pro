'use server'

import { redirect } from 'next/navigation'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/firebase/session'
import { CLAIM_STATUSES } from '@/constants'
import type { ClaimCategory, ClaimStatus } from '@/types'

interface CreateClaimInput {
  customerName: string
  customerEmail: string
  category: ClaimCategory
  subject: string
  description: string
}

export async function createClaim(
  input: CreateClaimInput
): Promise<{ error: string }> {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const { enterpriseId } = session
  const db = getFirestore(getFirebaseAdmin())
  const enterpriseRef = db.collection('enterprises').doc(enterpriseId)

  let claimId: string
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

    claimId = result.claimId
  } catch {
    return { error: 'No se pudo crear el reclamo. Intenta de nuevo.' }
  }

  redirect(`/claims/${claimId}?created=1`)
}

export async function updateClaimStatus(
  claimId: string,
  newStatus: ClaimStatus
): Promise<void> {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const { enterpriseId, uid } = session
  const db = getFirestore(getFirebaseAdmin())

  const userSnap = await db.collection('enterpriseUsers').doc(uid).get()
  const authorName = (userSnap.data()?.name as string) ?? 'Agente'

  const claimRef = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .doc(claimId)

  await db.runTransaction(async (tx) => {
    tx.update(claimRef, {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    })
    tx.set(claimRef.collection('history').doc(), {
      action: `Estado cambiado a: ${CLAIM_STATUSES[newStatus]}`,
      authorId: uid,
      authorName,
      authorRole: 'agent',
      timestamp: FieldValue.serverTimestamp(),
    })
  })

  redirect(`/claims/${claimId}`)
}

export async function addReply(
  claimId: string,
  message: string
): Promise<{ error: string } | void> {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  const { enterpriseId, uid } = session
  const db = getFirestore(getFirebaseAdmin())

  const userSnap = await db.collection('enterpriseUsers').doc(uid).get()
  const authorName = (userSnap.data()?.name as string) ?? 'Agente'

  const claimRef = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .doc(claimId)

  const claimSnap = await claimRef.get()
  const currentStatus = claimSnap.data()?.status

  await db.runTransaction(async (tx) => {
    if (currentStatus === 'open') {
      tx.update(claimRef, {
        status: 'in_progress',
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
    tx.set(claimRef.collection('history').doc(), {
      action: message,
      authorId: uid,
      authorName,
      authorRole: 'agent',
      timestamp: FieldValue.serverTimestamp(),
    })
  })

  redirect(`/claims/${claimId}`)
}

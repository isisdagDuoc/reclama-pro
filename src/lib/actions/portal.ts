'use server'

import { revalidatePath } from 'next/cache'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

export async function addClientComment(
  enterpriseId: string,
  claimId: string,
  accessToken: string,
  slug: string,
  message: string
): Promise<{ error: string } | void> {
  const db = getFirestore(getFirebaseAdmin())
  const claimRef = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .doc(claimId)

  const claimSnap = await claimRef.get()
  if (!claimSnap.exists || claimSnap.data()?.accessToken !== accessToken) {
    return { error: 'Acceso no válido.' }
  }

  try {
    await claimRef.collection('history').add({
      action: message,
      authorId: 'client',
      authorName: claimSnap.data()?.customerName ?? 'Cliente',
      authorRole: 'client',
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch {
    return { error: 'No se pudo enviar el comentario. Intenta de nuevo.' }
  }

  revalidatePath(`/${slug}`)
  revalidatePath(`/claims/${claimId}`)
}

export async function submitRating(
  enterpriseId: string,
  claimId: string,
  accessToken: string,
  slug: string,
  rating: number
): Promise<{ error: string } | void> {
  if (rating < 1 || rating > 5) return { error: 'Valoración inválida.' }

  const db = getFirestore(getFirebaseAdmin())
  const claimRef = db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .doc(claimId)

  const claimSnap = await claimRef.get()
  if (!claimSnap.exists || claimSnap.data()?.accessToken !== accessToken) {
    return { error: 'Acceso no válido.' }
  }
  if (claimSnap.data()?.rating !== null) {
    return { error: 'Ya enviaste tu valoración.' }
  }

  try {
    await claimRef.update({
      rating,
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch {
    return { error: 'No se pudo guardar la valoración. Intenta de nuevo.' }
  }

  revalidatePath(`/${slug}`)
}

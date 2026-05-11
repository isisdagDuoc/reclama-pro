'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'

export async function updateName(
  name: string
): Promise<{ success: true } | { error: string }> {
  const session = await getSessionUser()

  if (!name.trim() || name.trim().length < 2) return { error: 'name_invalid' }

  try {
    const db = getFirestore(getFirebaseAdmin())
    await db.collection('enterpriseUsers').doc(session.uid).update({ name: name.trim() })
  } catch (err) {
    console.error('[profile] updateName error:', err)
    return { error: 'unknown' }
  }

  revalidatePath('/settings/profile')
  return { success: true }
}

export async function updatePassword(
  newPassword: string
): Promise<{ error: string } | void> {
  const session = await getSessionUser()

  if (!newPassword || newPassword.length < 6) return { error: 'password_too_short' }

  try {
    const app = getFirebaseAdmin()
    const auth = getAuth(app)
    await auth.updateUser(session.uid, { password: newPassword })
    await auth.revokeRefreshTokens(session.uid)
    const cookieStore = await cookies()
    cookieStore.delete('session')
  } catch (err) {
    console.error('[profile] updatePassword error:', err)
    return { error: 'unknown' }
  }

  redirect('/login')
}

'use server'

import { revalidatePath } from 'next/cache'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import type { EnterpriseUser } from '@/types'

interface CreateUserInput {
  name: string
  email: string
  password: string
  role: 'admin' | 'agent'
}

export async function createEnterpriseUser(
  input: CreateUserInput
): Promise<{ success: true; user: Pick<EnterpriseUser, 'id' | 'name' | 'email' | 'role'> } | { error: string }> {
  const session = await getSessionUser()
  if (session.role !== 'admin') return { error: 'unauthorized' }

  const { name, email, password, role } = input
  if (!name.trim() || name.trim().length < 2) return { error: 'name_invalid' }
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'email_invalid' }
  if (!password || password.length < 6) return { error: 'password_too_short' }

  const app = getFirebaseAdmin()
  const auth = getAuth(app)
  const db = getFirestore(app)

  let uid: string
  try {
    const userRecord = await auth.createUser({
      email: email.trim(),
      password,
      displayName: name.trim(),
    })
    uid = userRecord.uid
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') {
      return { error: 'email_already_exists' }
    }
    console.error('[users] createUser error:', err)
    return { error: 'unknown' }
  }

  try {
    await auth.setCustomUserClaims(uid, {
      enterpriseId: session.enterpriseId,
      role,
    })
    await db.collection('enterpriseUsers').doc(uid).set({
      name: name.trim(),
      email: email.trim(),
      role,
      enterpriseId: session.enterpriseId,
    })
  } catch (err) {
    console.error('[users] post-create error:', err)
    // Usuario creado en Auth pero sin claims/doc — raro, pero registramos
    return { error: 'unknown' }
  }

  revalidatePath('/settings/users')
  return { success: true, user: { id: uid, name: name.trim(), email: email.trim(), role } }
}

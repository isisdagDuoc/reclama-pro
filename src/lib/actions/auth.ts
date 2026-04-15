'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000 // 7 días en ms
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7 // 7 días en segundos

export async function login(idToken: string): Promise<{ error: string } | void> {
  console.log('[auth] login() — creando Session Cookie...')
  try {
    const app = getFirebaseAdmin()
    const auth = getAuth(app)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    })
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_S,
      path: '/',
    })
    console.log('[auth] Session Cookie establecida — redirigiendo a /dashboard')
  } catch (err) {
    console.error('[auth] error al crear Session Cookie:', err)
    return { error: 'Credenciales inválidas. Intenta de nuevo.' }
  }
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  console.log('[auth] logout() — eliminando sesión')
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}

export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; error?: boolean }> {
  // Validar formato antes de consultar Firestore
  if (!slug || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 2) {
    return { available: false }
  }

  try {
    const db = getFirestore(getFirebaseAdmin())
    const snapshot = await db
      .collection('enterprises')
      .where('slug', '==', slug)
      .limit(1)
      .get()
    return { available: snapshot.empty }
  } catch (err) {
    console.error('[auth] checkSlugAvailability error:', err)
    // No reportar como "tomado" — dejar que la transacción en registerEnterprise sea el árbitro final
    return { available: true, error: true }
  }
}

export async function registerEnterprise(
  idToken: string,
  data: { name: string; slug: string; email: string }
): Promise<{ success: true } | { error: string }> {
  try {
    const app = getFirebaseAdmin()
    const auth = getAuth(app)
    const db = getFirestore(app)

    // Verificar ID token
    const decodedToken = await auth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Verificar unicidad del slug + crear documentos en Transaction
    const enterprisesRef = db.collection('enterprises')
    const enterpriseUsersRef = db.collection('enterpriseUsers')

    const enterpriseId = await db.runTransaction(async (tx) => {
      // Verificar slug dentro de la transacción (previene race condition)
      const slugQuery = await tx.get(
        enterprisesRef.where('slug', '==', data.slug).limit(1)
      )
      if (!slugQuery.empty) {
        throw new Error('slug_taken')
      }

      const newEnterpriseRef = enterprisesRef.doc()
      const newId = newEnterpriseRef.id

      tx.set(newEnterpriseRef, {
        name: data.name,
        slug: data.slug,
        plan: 'basic',
        claimCounter: 0,
        createdAt: FieldValue.serverTimestamp(),
      })

      tx.set(enterpriseUsersRef.doc(uid), {
        enterpriseId: newId,
        role: 'admin',
        email: data.email,
        name: data.name,
      })

      return newId
    })

    // Setear Custom Claims (fuera de la transacción, después de confirmar éxito)
    await auth.setCustomUserClaims(uid, {
      enterpriseId,
      role: 'admin',
    })

    console.log('[auth] registerEnterprise — empresa creada:', enterpriseId, '| uid:', uid)
    return { success: true }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'slug_taken') {
        return { error: 'slug_taken' }
      }
      if (err.message.includes('auth/email-already-exists')) {
        return { error: 'email_already_exists' }
      }
    }
    console.error('[auth] registerEnterprise error:', err)
    return { error: 'unknown' }
  }
}

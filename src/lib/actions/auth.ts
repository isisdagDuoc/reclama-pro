'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuth } from 'firebase-admin/auth'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

export async function login(idToken: string): Promise<{ error: string } | void> {
  console.log('[auth] login() — verificando ID token...')
  try {
    const auth = getAuth(getFirebaseAdmin())
    const decodedToken = await auth.verifyIdToken(idToken)
    console.log('[auth] token verificado — uid:', decodedToken.uid, '| email:', decodedToken.email)
    const cookieStore = await cookies()
    cookieStore.set('session', decodedToken.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })
    console.log('[auth] cookie de sesión establecida — redirigiendo a /dashboard')
  } catch (err) {
    console.error('[auth] error al verificar token:', err)
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

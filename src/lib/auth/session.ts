import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuth } from 'firebase-admin/auth'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

export interface SessionUser {
  uid: string
  email: string
  enterpriseId: string
  role: 'admin' | 'agent'
}

async function _getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) redirect('/login')

  try {
    const auth = getAuth(getFirebaseAdmin())
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decoded.uid,
      email: decoded.email ?? '',
      enterpriseId: decoded['enterpriseId'] as string,
      role: decoded['role'] as 'admin' | 'agent',
    }
  } catch {
    redirect('/login')
  }
}

async function _getSessionUserOrNull(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  try {
    const auth = getAuth(getFirebaseAdmin())
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decoded.uid,
      email: decoded.email ?? '',
      enterpriseId: decoded['enterpriseId'] as string,
      role: decoded['role'] as 'admin' | 'agent',
    }
  } catch {
    return null
  }
}

export const getSessionUser = cache(_getSessionUser)
export const getSessionUserOrNull = cache(_getSessionUserOrNull)

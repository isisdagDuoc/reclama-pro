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

export async function getSessionUser(): Promise<SessionUser> {
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

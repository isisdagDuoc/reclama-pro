import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import { getFirebaseAdmin } from './admin'

export async function getSessionUser(): Promise<{
  uid: string
  enterpriseId: string
  role: 'admin' | 'agent'
} | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null

  try {
    const auth = getAuth(getFirebaseAdmin())
    const decoded = await auth.verifySessionCookie(session.value, true)
    const enterpriseId = decoded['enterpriseId'] as string | undefined
    const role = decoded['role'] as string | undefined
    if (!enterpriseId || !role) return null
    return { uid: decoded.uid, enterpriseId, role: role as 'admin' | 'agent' }
  } catch {
    return null
  }
}

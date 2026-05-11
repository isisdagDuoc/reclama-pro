import type { Firestore } from 'firebase-admin/firestore'
import type { EnterpriseUser } from '@/types'

export async function getEnterpriseUsers(
  db: Firestore,
  enterpriseId: string
): Promise<EnterpriseUser[]> {
  const snapshot = await db
    .collection('enterpriseUsers')
    .where('enterpriseId', '==', enterpriseId)
    .get()

  const users: EnterpriseUser[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name ?? '',
    email: doc.data().email ?? '',
    role: doc.data().role as 'admin' | 'agent',
    enterpriseId: doc.data().enterpriseId ?? enterpriseId,
  }))

  return users.sort((a, b) => a.name.localeCompare(b.name))
}

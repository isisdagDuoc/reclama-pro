import { Firestore } from 'firebase-admin/firestore'

export async function getEnterpriseName(db: Firestore, enterpriseId: string): Promise<string> {
  const doc = await db.collection('enterprises').doc(enterpriseId).get()
  return (doc.data()?.name as string) ?? 'Mi empresa'
}

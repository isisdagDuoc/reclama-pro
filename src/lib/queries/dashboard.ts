import { Firestore, Timestamp } from 'firebase-admin/firestore'
import type { ClaimCategory, ClaimStatus } from '@/types'

export interface RecentClaim {
  id: string
  ticketNumber: string
  customerName: string
  subject: string
  category: ClaimCategory
  status: ClaimStatus
  createdAt: string
}

export interface DashboardData {
  totalClaims: number
  thisWeekClaims: number
  openClaims: number
  inProgressClaims: number
  avgRating: number | null
  recentClaims: RecentClaim[]
}

export async function getDashboardData(db: Firestore, enterpriseId: string): Promise<DashboardData> {
  const claimsRef = db.collection('enterprises').doc(enterpriseId).collection('claims')
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalSnap, weekSnap, openSnap, inProgressSnap, ratedSnap, recentSnap] = await Promise.all([
    claimsRef.count().get(),
    claimsRef.where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)).count().get(),
    claimsRef.where('status', '==', 'open').count().get(),
    claimsRef.where('status', '==', 'in_progress').count().get(),
    claimsRef.where('rating', '!=', null).select('rating').get(),
    claimsRef.orderBy('createdAt', 'desc').limit(10).get(),
  ])

  let avgRating: number | null = null
  if (!ratedSnap.empty) {
    const sum = ratedSnap.docs.reduce((acc, doc) => acc + (doc.data().rating as number), 0)
    avgRating = Math.round((sum / ratedSnap.size) * 10) / 10
  }

  const recentClaims: RecentClaim[] = recentSnap.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      ticketNumber: d.ticketNumber as string,
      customerName: d.customerName as string,
      subject: d.subject as string,
      category: d.category as ClaimCategory,
      status: d.status as ClaimStatus,
      createdAt: (d.createdAt as Timestamp).toDate().toISOString(),
    }
  })

  return {
    totalClaims: totalSnap.data().count,
    thisWeekClaims: weekSnap.data().count,
    openClaims: openSnap.data().count,
    inProgressClaims: inProgressSnap.data().count,
    avgRating,
    recentClaims,
  }
}

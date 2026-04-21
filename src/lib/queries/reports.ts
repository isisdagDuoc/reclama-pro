import { Timestamp } from 'firebase-admin/firestore'
import type { Firestore } from 'firebase-admin/firestore'
import type { Claim, ClaimCategory, ClaimStatus } from '@/types'
import { CLAIM_CATEGORIES } from '@/constants'

export type ReportPeriod = 7 | 30 | 90 | 365

export interface ReportCategoryRow {
  category: ClaimCategory
  label: string
  count: number
  percentage: number
  resolvedCount: number
  resolutionRate: number
  averageRating: number | null
}

export interface ReportWeekBucket {
  weekLabel: string
  startDate: string
  count: number
}

export interface ReportStatusDistribution {
  open: number
  in_progress: number
  resolved: number
  closed: number
}

export interface ReportData {
  period: ReportPeriod
  periodLabel: string
  startDate: string
  endDate: string
  totals: {
    totalClaims: number
    resolutionRate: number
    averageRating: number | null
    newThisWeek: number
  }
  statusDistribution: ReportStatusDistribution
  statusPercentages: ReportStatusDistribution
  weeklyTrend: ReportWeekBucket[]
  byCategory: ReportCategoryRow[]
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  7:   'Últimos 7 días',
  30:  'Últimos 30 días',
  90:  'Últimos 90 días',
  365: 'Este año',
}

export function parsePeriod(raw: string | undefined): ReportPeriod {
  const n = Number(raw)
  if (n === 7 || n === 30 || n === 90 || n === 365) return n
  return 30
}

export async function getReportData(
  db: Firestore,
  enterpriseId: string,
  period: ReportPeriod
): Promise<ReportData> {
  const now = new Date()
  const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const snap = await db
    .collection('enterprises')
    .doc(enterpriseId)
    .collection('claims')
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .orderBy('createdAt', 'asc')
    .get()

  const claims = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Claim)
  const total = claims.length

  // Acumuladores de una sola pasada
  const statusCounts: ReportStatusDistribution = { open: 0, in_progress: 0, resolved: 0, closed: 0 }
  let globalRatingSum = 0
  let globalRatingCount = 0
  let newThisWeek = 0

  type CategoryAcc = { count: number; resolvedCount: number; ratingSum: number; ratingCount: number }
  const categoryMap = new Map<ClaimCategory, CategoryAcc>()

  const weeks = Math.ceil(period / 7)
  const weekCounts = new Array<number>(weeks).fill(0)

  for (const claim of claims) {
    // Status
    statusCounts[claim.status]++

    // Rating global
    if (claim.rating !== null) {
      globalRatingSum += claim.rating
      globalRatingCount++
    }

    // Nuevos esta semana (independiente del period)
    if (claim.createdAt.toMillis() >= startOfWeek.getTime()) {
      newThisWeek++
    }

    // Categoría
    const acc = categoryMap.get(claim.category) ?? { count: 0, resolvedCount: 0, ratingSum: 0, ratingCount: 0 }
    acc.count++
    if (claim.status === 'resolved' || claim.status === 'closed') acc.resolvedCount++
    if (claim.rating !== null) { acc.ratingSum += claim.rating; acc.ratingCount++ }
    categoryMap.set(claim.category, acc)

    // Semana
    const weekIndex = Math.min(
      Math.floor((claim.createdAt.toMillis() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      weeks - 1
    )
    weekCounts[weekIndex]++
  }

  // Porcentajes de estado
  const pct = (n: number) => total > 0 ? Math.round(n / total * 1000) / 10 : 0
  const statusPercentages: ReportStatusDistribution = {
    open:        pct(statusCounts.open),
    in_progress: pct(statusCounts.in_progress),
    resolved:    pct(statusCounts.resolved),
    closed:      pct(statusCounts.closed),
  }

  // Tasa de resolución global
  const resolved = statusCounts.resolved + statusCounts.closed
  const resolutionRate = total > 0 ? Math.round(resolved / total * 1000) / 10 : 0

  // Rating global
  const averageRating = globalRatingCount > 0 ? globalRatingSum / globalRatingCount : null

  // Tendencia semanal
  const weeklyTrend: ReportWeekBucket[] = Array.from({ length: weeks }, (_, i) => {
    const bucketStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    return {
      weekLabel: `Sem ${i + 1}`,
      startDate: bucketStart.toISOString().slice(0, 10),
      count: weekCounts[i],
    }
  })

  // Por categoría — solo las que tienen al menos 1 reclamo, ordenadas por count desc
  const byCategory: ReportCategoryRow[] = Array.from(categoryMap.entries())
    .map(([category, acc]) => ({
      category,
      label: CLAIM_CATEGORIES[category],
      count: acc.count,
      percentage: total > 0 ? Math.round(acc.count / total * 1000) / 10 : 0,
      resolvedCount: acc.resolvedCount,
      resolutionRate: acc.count > 0 ? Math.round(acc.resolvedCount / acc.count * 1000) / 10 : 0,
      averageRating: acc.ratingCount > 0 ? acc.ratingSum / acc.ratingCount : null,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    startDate: startDate.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
    totals: { totalClaims: total, resolutionRate, averageRating, newThisWeek },
    statusDistribution: statusCounts,
    statusPercentages,
    weeklyTrend,
    byCategory,
  }
}

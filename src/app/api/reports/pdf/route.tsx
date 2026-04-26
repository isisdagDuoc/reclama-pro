import { type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUserOrNull } from '@/lib/auth/session'
import { getReportData, parsePeriod } from '@/lib/queries/reports'
import { ReportDocument } from '@/components/pdf/ReportDocument'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getSessionUserOrNull()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { enterpriseId } = session
  const period = parsePeriod(req.nextUrl.searchParams.get('period') ?? undefined)

  const db = getDb()
  const [data, enterpriseSnap] = await Promise.all([
    getReportData(db, enterpriseId, period),
    db.collection('enterprises').doc(enterpriseId).get(),
  ])

  const enterpriseName = (enterpriseSnap.get('name') as string | undefined) ?? 'Empresa'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(<ReportDocument data={data} enterpriseName={enterpriseName} /> as any)

  const filename = `reporte-${period}d-${new Date().toISOString().slice(0, 10)}.pdf`

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

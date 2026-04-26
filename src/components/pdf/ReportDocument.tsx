import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReportData } from '@/lib/queries/reports'
import { CLAIM_STATUSES } from '@/constants'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 16,
  },
  appName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  enterprise: {
    fontSize: 12,
    color: '#1d4ed8',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  meta: {
    fontSize: 9,
    color: '#64748b',
  },

  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    border: '1px solid #e2e8f0',
  },
  kpiLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
  },
  kpiSub: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 2,
  },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusTile: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
  },
  statusLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  statusCount: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  statusPct: {
    fontSize: 8,
  },

  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '6 10',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f1f5f9',
    padding: '8 10',
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: '8 10',
  },
  colCat:      { flex: 3 },
  colNum:      { flex: 1, textAlign: 'center' },
  colPct:      { flex: 1, textAlign: 'center' },
  colResolved: { flex: 1, textAlign: 'center' },
  colRating:   { flex: 1, textAlign: 'center' },
  thText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tdText: {
    fontSize: 9,
    color: '#334155',
  },
  tdBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  tdBlue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    textAlign: 'center',
  },
  tdGreen: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#065f46',
    textAlign: 'center',
  },
  tdAmber: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#b45309',
    textAlign: 'center',
  },
  tdMuted: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
})

const STATUS_COLORS = {
  open:        { bg: '#dbeafe', text: '#1e40af', pct: '#3b82f6' },
  in_progress: { bg: '#fef3c7', text: '#92400e', pct: '#d97706' },
  resolved:    { bg: '#d1fae5', text: '#065f46', pct: '#10b981' },
  closed:      { bg: '#fee2e2', text: '#991b1b', pct: '#ef4444' },
} as const

export function ReportDocument({
  data,
  enterpriseName,
}: {
  data: ReportData
  enterpriseName: string
}) {
  const generatedAt = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.appName}>Reclama Pro</Text>
          <Text style={s.reportTitle}>Reporte de Reclamos</Text>
          <Text style={s.enterprise}>{enterpriseName}</Text>
          <Text style={s.meta}>{data.periodLabel} · Generado el {generatedAt}</Text>
        </View>

        {/* KPIs */}
        <Text style={s.sectionTitle}>Resumen del período</Text>
        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Total reclamos</Text>
            <Text style={s.kpiValue}>{data.totals.totalClaims}</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Tasa de resolución</Text>
            <Text style={[s.kpiValue, { color: '#15803d' }]}>
              {data.totals.resolutionRate.toFixed(1)}%
            </Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Rating promedio</Text>
            <Text style={[s.kpiValue, { color: '#0f172a' }]}>
              {data.totals.averageRating !== null
                ? data.totals.averageRating.toFixed(1)
                : '—'}
            </Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Nuevos esta semana</Text>
            <Text style={[s.kpiValue, { color: '#0f172a' }]}>{data.totals.newThisWeek}</Text>
          </View>
        </View>

        {/* ESTADO */}
        <Text style={s.sectionTitle}>Distribución por estado</Text>
        <View style={s.statusRow}>
          {(['open', 'in_progress', 'resolved', 'closed'] as const).map(key => {
            const colors = STATUS_COLORS[key]
            return (
              <View key={key} style={[s.statusTile, { backgroundColor: colors.bg }]}>
                <Text style={[s.statusLabel, { color: colors.text }]}>
                  {CLAIM_STATUSES[key]}
                </Text>
                <Text style={[s.statusCount, { color: colors.text }]}>
                  {data.statusDistribution[key]}
                </Text>
                <Text style={[s.statusPct, { color: colors.pct }]}>
                  {data.statusPercentages[key].toFixed(1)}%
                </Text>
              </View>
            )
          })}
        </View>

        {/* TABLA POR CATEGORÍA */}
        <Text style={s.sectionTitle}>Detalle por categoría</Text>
        {data.byCategory.length === 0 ? (
          <Text style={{ fontSize: 9, color: '#94a3b8' }}>Sin reclamos en el período.</Text>
        ) : (
          <View style={s.table}>
            <View style={s.tableHeader}>
              <View style={s.colCat}><Text style={s.thText}>Categoría</Text></View>
              <View style={s.colNum}><Text style={s.thText}>Total</Text></View>
              <View style={s.colPct}><Text style={s.thText}>%</Text></View>
              <View style={s.colResolved}><Text style={s.thText}>Resueltos</Text></View>
              <View style={s.colRating}><Text style={s.thText}>Rating</Text></View>
            </View>
            {data.byCategory.map((row, i) => {
              const isLast = i === data.byCategory.length - 1
              return (
                <View key={row.category} style={isLast ? s.tableRowLast : s.tableRow}>
                  <View style={s.colCat}><Text style={s.tdBold}>{row.label}</Text></View>
                  <View style={s.colNum}><Text style={s.tdBlue}>{row.count}</Text></View>
                  <View style={s.colPct}><Text style={s.tdText}>{row.percentage.toFixed(1)}%</Text></View>
                  <View style={s.colResolved}>
                    <Text style={s.tdGreen}>{row.resolvedCount}/{row.count}</Text>
                  </View>
                  <View style={s.colRating}>
                    {row.averageRating !== null
                      ? <Text style={s.tdAmber}>★ {row.averageRating.toFixed(1)}</Text>
                      : <Text style={s.tdMuted}>—</Text>}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Reclama Pro · {enterpriseName}</Text>
          <Text style={s.footerText}>{data.periodLabel}</Text>
        </View>

      </Page>
    </Document>
  )
}

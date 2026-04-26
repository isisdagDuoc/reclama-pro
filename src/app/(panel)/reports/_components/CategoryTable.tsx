import type { ReportCategoryRow } from '@/lib/queries/reports'
import styles from './CategoryTable.module.css'

export function CategoryTable({ rows }: { rows: ReportCategoryRow[] }) {
  if (rows.length === 0) {
    return <p className={styles.empty}>Sin reclamos en el período.</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Categoría</th>
          <th className={styles.th}>Volumen</th>
          <th className={styles.th}>Total</th>
          <th className={styles.th}>Resueltos</th>
          <th className={styles.th}>% resolución</th>
          <th className={styles.th}>Rating</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.category} className={styles.tr}>
            <td className={`${styles.td} ${styles.name}`}>{row.label}</td>
            <td className={styles.td}>
              <div className={styles.barWrap}>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className={styles.barPct}>{row.percentage.toFixed(1)}%</span>
              </div>
            </td>
            <td className={`${styles.td} ${styles.num}`}>{row.count}</td>
            <td className={`${styles.td} ${styles.num}`}>{row.resolvedCount}</td>
            <td className={styles.td}>
              <span className={styles.resolvedRate}>{row.resolutionRate.toFixed(0)}%</span>
            </td>
            <td className={styles.td}>
              {row.averageRating !== null
                ? <span className={styles.rating}>★ {row.averageRating.toFixed(1)}</span>
                : <span className={styles.noRating}>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

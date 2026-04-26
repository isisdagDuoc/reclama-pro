import styles from './loading.module.css'

export default function DashboardLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBar} />
        <div className={styles.subtitleBar} />
      </div>
      <div className={styles.statsGrid}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={styles.statCard} />
        ))}
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableHeader} />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={styles.tableRow} />
        ))}
      </div>
    </div>
  )
}

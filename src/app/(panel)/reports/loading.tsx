import styles from './loading.module.css'

export default function ReportsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBar} />
        <div className={styles.controls}>
          <div className={styles.selectorSkeleton} />
          <div className={styles.buttonSkeleton} />
        </div>
      </div>
      <div className={styles.statsGrid}>
        {[0, 1, 2].map(i => (
          <div key={i} className={styles.statCard} />
        ))}
      </div>
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} />
        <div className={styles.chartCard} />
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

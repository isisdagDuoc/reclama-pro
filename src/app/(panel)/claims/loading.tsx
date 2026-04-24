import styles from './loading.module.css'

export default function ClaimsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleBar} />
          <div className={styles.subtitleBar} />
        </div>
        <div className={styles.buttonSkeleton} />
      </div>
      <div className={styles.tableWrapper}>
        <div className={styles.tabs}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={styles.tab} />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.tableRow} />
        ))}
      </div>
    </div>
  )
}

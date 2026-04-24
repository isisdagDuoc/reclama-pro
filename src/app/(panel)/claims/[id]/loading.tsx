import styles from './loading.module.css'

export default function ClaimDetailLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <div className={styles.breadcrumbBar} />
      </div>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.cardTall} />
          <div className={styles.cardMedium} />
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sideCard} />
          <div className={styles.sideCard} />
          <div className={styles.sideCard} />
        </aside>
      </div>
    </div>
  )
}

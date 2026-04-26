import styles from './loading.module.css'

export default function PanelLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.bar} />
      <div className={styles.bar} style={{ width: '60%' }} />
      <div className={styles.cardSkeleton} />
    </div>
  )
}

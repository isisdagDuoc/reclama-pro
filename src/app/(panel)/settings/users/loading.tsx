import styles from '@/app/(panel)/loading.module.css'

export default function UsersLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.bar} />
      <div className={styles.cardSkeleton} />
      <div className={styles.cardSkeleton} />
    </div>
  )
}

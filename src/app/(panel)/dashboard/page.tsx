import styles from './page.module.css'

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      <div className={styles.placeholder}>
        <p>El contenido del dashboard se implementará en la siguiente feature.</p>
      </div>
    </div>
  )
}

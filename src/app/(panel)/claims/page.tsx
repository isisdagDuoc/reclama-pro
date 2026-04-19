import Link from 'next/link'
import styles from './page.module.css'

export default function ClaimsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reclamos</h1>
        <Link href="/claims/new" className={styles.newButton}>
          + Nuevo reclamo
        </Link>
      </div>
      <p className={styles.empty}>No hay reclamos aún.</p>
    </div>
  )
}

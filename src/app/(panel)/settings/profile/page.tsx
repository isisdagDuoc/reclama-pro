import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { ProfileNameForm } from './_components/ProfileNameForm'
import { ProfilePasswordForm } from './_components/ProfilePasswordForm'
import styles from './page.module.css'

export default async function ProfilePage() {
  const user = await getSessionUser()
  const db = getDb()
  const userSnap = await db.collection('enterpriseUsers').doc(user.uid).get()
  const currentName: string = userSnap.data()?.name ?? ''

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi perfil</h1>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Datos personales</h2>
        <ProfileNameForm currentName={currentName} email={user.email} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cambiar contraseña</h2>
        <ProfilePasswordForm />
      </div>
    </div>
  )
}

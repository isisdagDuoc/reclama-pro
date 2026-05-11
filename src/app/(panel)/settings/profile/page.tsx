import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { CLAIM_ROLES } from '@/constants'
import { ProfileNameForm } from './_components/ProfileNameForm'
import { ProfilePasswordForm } from './_components/ProfilePasswordForm'
import styles from './page.module.css'

export default async function ProfilePage() {
  const user = await getSessionUser()
  const db = getDb()
  const userSnap = await db.collection('enterpriseUsers').doc(user.uid).get()
  const currentName: string = userSnap.data()?.name ?? ''

  const avatarText = currentName.trim()
    ? currentName.trim().split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user.email.split('@')[0].slice(0, 2).toUpperCase()

  return (
    <div className={styles.page}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarLarge}>{avatarText}</div>
        <div className={styles.profileMeta}>
          <div className={styles.profileTop}>
            <span className={styles.profileName}>{currentName || user.email.split('@')[0]}</span>
            <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleAgent}`}>
              {CLAIM_ROLES[user.role]}
            </span>
          </div>
          <span className={styles.profileEmail}>{user.email}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Información personal</h2>
          <p className={styles.sectionDesc}>Actualizá tu nombre de usuario en el sistema.</p>
        </div>
        <ProfileNameForm currentName={currentName} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Seguridad</h2>
          <p className={styles.sectionDesc}>Cambiá tu contraseña de acceso al panel.</p>
        </div>
        <ProfilePasswordForm />
      </div>
    </div>
  )
}

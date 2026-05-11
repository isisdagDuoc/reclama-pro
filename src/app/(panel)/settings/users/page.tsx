import { redirect } from 'next/navigation'
import { getDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/lib/auth/session'
import { getEnterpriseUsers } from '@/lib/queries/users'
import { CLAIM_ROLES } from '@/constants'
import { AddUserForm } from './_components/AddUserForm'
import styles from './page.module.css'

export default async function UsersPage() {
  const user = await getSessionUser()
  if (user.role !== 'admin') redirect('/dashboard')

  const db = getDb()
  const users = await getEnterpriseUsers(db, user.enterpriseId)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Equipo</h1>
          <p className={styles.subtitle}>Usuarios con acceso al panel de tu empresa</p>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={styles.td}>
                  {u.name}
                  {u.id === user.uid && <span className={styles.youBadge}>tú</span>}
                </td>
                <td className={styles.tdMuted}>{u.email}</td>
                <td className={styles.td}>
                  <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleAgent}`}>
                    {CLAIM_ROLES[u.role]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Agregar usuario</h2>
        <AddUserForm />
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { getSessionUser } from '@/lib/auth/session'
import { getDb } from '@/lib/firebase/admin'
import { getEnterpriseName } from '@/lib/queries/enterprise'
import { Sidebar } from '@/components/ui/Sidebar'
import styles from './layout.module.css'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  const db = getDb()
  const enterpriseName = await getEnterpriseName(db, user.enterpriseId)
  return (
    <div className={styles.root}>
      <Sidebar email={user.email} role={user.role} enterpriseName={enterpriseName} />
      <main className={styles.main}>{children}</main>
    </div>
  )
}

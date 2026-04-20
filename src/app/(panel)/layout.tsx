import type { ReactNode } from 'react'
import { getSessionUser } from '@/lib/auth/session'
import { Sidebar } from '@/components/ui/Sidebar'
import styles from './layout.module.css'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  return (
    <div className={styles.root}>
      <Sidebar email={user.email} role={user.role} />
      <main className={styles.main}>{children}</main>
    </div>
  )
}

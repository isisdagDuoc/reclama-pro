import type { ReactNode } from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import styles from './layout.module.css'

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}

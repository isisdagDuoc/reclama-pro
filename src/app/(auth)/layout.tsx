import type { ReactNode } from 'react'
import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      {children}
    </div>
  )
}

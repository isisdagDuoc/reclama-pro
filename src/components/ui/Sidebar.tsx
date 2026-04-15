'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import styles from './Sidebar.module.css'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Reclamos', href: '/claims' },
  { label: 'Reportes', href: '/reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Reclama Pro</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>A</div>
          <span className={styles.userName}>Admin</span>
        </div>
        <form action={logout}>
          <button type="submit" className={styles.logoutButton}>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { CLAIM_ROLES } from '@/constants'
import styles from './Sidebar.module.css'

interface SidebarProps {
  email: string
  role: 'admin' | 'agent'
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Reclamos', href: '/claims' },
  { label: 'Reportes', href: '/reports' },
]

export function Sidebar({ email, role }: SidebarProps) {
  const pathname = usePathname()
  const initials = email.split('@')[0].slice(0, 2).toUpperCase()

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
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{email}</span>
            <span className={styles.userRole}>{CLAIM_ROLES[role]}</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => logout()}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

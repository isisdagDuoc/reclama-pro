'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { CLAIM_STATUSES } from '@/constants'
import type { ClaimStatus } from '@/types'
import styles from './ClaimsFilters.module.css'

const STATUSES: ClaimStatus[] = ['open', 'in_progress', 'resolved', 'closed']

export function ClaimsFilters({
  currentStatus,
  currentSearch,
}: {
  currentStatus?: string
  currentSearch?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buildUrl(status?: string, search?: string) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl(currentStatus, value || undefined))
    }, 350)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className={styles.bar}>
      <div className={styles.tabs}>
        <a
          href={buildUrl(undefined, currentSearch)}
          className={`${styles.tab} ${!currentStatus ? styles.tabActive : ''}`}
        >
          Todos
        </a>
        {STATUSES.map(status => (
          <a
            key={status}
            href={buildUrl(status, currentSearch)}
            className={`${styles.tab} ${currentStatus === status ? styles.tabActive : ''}`}
          >
            {CLAIM_STATUSES[status]}
          </a>
        ))}
      </div>
      <input
        type="search"
        placeholder="Buscar cliente o ticket..."
        defaultValue={currentSearch}
        onChange={e => handleSearch(e.target.value)}
        className={styles.search}
      />
    </div>
  )
}

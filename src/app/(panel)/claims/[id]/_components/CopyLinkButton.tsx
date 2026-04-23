'use client'

import { useState } from 'react'
import styles from './CopyLinkButton.module.css'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className={styles.button}>
      {copied ? '¡Copiado!' : 'Copiar link'}
    </button>
  )
}

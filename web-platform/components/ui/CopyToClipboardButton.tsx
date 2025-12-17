'use client'

import React, { useCallback, useState } from 'react'

type CopyToClipboardButtonProps = {
  text: string
  className?: string
  children: React.ReactNode
  copiedLabel?: string
  copyLabel?: string
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export function CopyToClipboardButton({
  text,
  className = '',
  children,
  copiedLabel = 'Copied',
  copyLabel = 'Copy',
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false)

  const onClick = useCallback(async () => {
    await copyToClipboard(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={copied ? copiedLabel : copyLabel}
    >
      {copied ? copiedLabel : children}
    </button>
  )
}

export default CopyToClipboardButton


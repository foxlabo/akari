'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Registers global keyboard shortcuts for the chat surface.
 *  - Ctrl/Cmd + Shift + N → start a new conversation
 *  - Ctrl/Cmd + K        → focus the message composer (handled where rendered)
 *
 * Mounted once in the chat layout; client-only.
 */
export function ChatKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return

      // Cmd/Ctrl + Shift + N → /chat/new
      if (e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault()
        router.push('/chat/new')
      }

      // Cmd/Ctrl + K → focus the message textarea (we tag it via aria-label).
      if (!e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        const textarea = document.querySelector<HTMLTextAreaElement>(
          'textarea[aria-label="Message"]',
        )
        if (textarea) {
          e.preventDefault()
          textarea.focus()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  return null
}

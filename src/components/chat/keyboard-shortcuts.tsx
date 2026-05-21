'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

/**
 * Registers global keyboard shortcuts for the chat surface.
 *  - Ctrl/Cmd + Shift + N → start a new conversation (ignored while typing)
 *  - Ctrl/Cmd + K        → focus the message composer
 *
 * Mounted once in the chat layout; client-only.
 */
export function ChatKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return

      // Cmd/Ctrl + Shift + N → /chat/new. Skip when the user is typing so we
      // don't hijack browser/text-editing shortcuts.
      if (e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        if (isEditableTarget(e.target)) return
        e.preventDefault()
        router.push('/chat/new')
        return
      }

      // Cmd/Ctrl + K → focus the message textarea. Allowed from any focus
      // state since the user is explicitly asking to jump to the composer.
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

'use client'

import { RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface to telemetry / console for development.
    // biome-ignore lint/suspicious/noConsole: this is the only path to expose a server error to dev tooling
    console.error('Chat segment error:', error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-zinc-500">
        {error.message || 'Unexpected error while loading the chat.'}
      </p>
      <Button variant="outline" onClick={reset}>
        <RotateCw />
        Try again
      </Button>
    </div>
  )
}

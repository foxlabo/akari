'use client'

import { RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function PersonasError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: this is the only path to expose a server error to dev tooling
    console.error('Personas segment error:', error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center">
      <h2 className="text-lg font-semibold">Could not load personas</h2>
      <p className="text-sm text-zinc-500">{error.message || 'Unexpected error.'}</p>
      <Button variant="outline" onClick={reset}>
        <RotateCw />
        Try again
      </Button>
    </div>
  )
}

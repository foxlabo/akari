import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ensureDbReady } from '@/lib/db/init'
import { listPersonas } from '@/lib/db/queries'
import { startConversationAction } from './actions'

export const dynamic = 'force-dynamic'

export default function NewChatPage() {
  ensureDbReady()
  const personas = listPersonas()

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Start a new conversation</h1>
        <p className="text-sm text-zinc-500">Pick a persona to begin.</p>
      </div>

      {personas.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No personas yet. Create one from the Personas page first.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {personas.map((persona) => (
            <form key={persona.id} action={startConversationAction}>
              <input type="hidden" name="personaId" value={persona.id} />
              <Button
                type="submit"
                variant="outline"
                className="flex h-auto w-full flex-col items-start gap-2 p-4 text-left whitespace-normal"
              >
                <div className="flex w-full items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{persona.name}</span>
                  <span className="shrink-0 text-xs font-normal text-zinc-500">
                    {persona.provider}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs font-normal text-zinc-500">
                  {persona.systemPrompt}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 text-xs font-normal text-zinc-400">
                  <Sparkles className="h-3 w-3" />
                  Start
                </div>
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}

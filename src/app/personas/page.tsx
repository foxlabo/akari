import { ArrowLeft, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getConfiguredProviderIds } from '@/lib/ai/providers'
import { ensureDbReady } from '@/lib/db/init'
import { listPersonas } from '@/lib/db/queries'
import { PersonaCard } from './_components/persona-card'
import { PersonaCreateDialog } from './_components/persona-create-dialog'

export const dynamic = 'force-dynamic'

export default function PersonasPage() {
  ensureDbReady()
  const personas = listPersonas()
  const configuredProviderIds = getConfiguredProviderIds()

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href="/chat/new">
              <ArrowLeft />
              Back to chat
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Personas</h1>
          <p className="text-sm text-zinc-500">
            Saved system prompts + model selection. Each conversation uses one persona.
          </p>
        </div>
        <PersonaCreateDialog configuredProviderIds={configuredProviderIds}>
          <Button>
            <PlusCircle />
            New persona
          </Button>
        </PersonaCreateDialog>
      </div>

      {personas.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No personas yet. Click <strong>New persona</strong> to add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {personas.map((p) => (
            <PersonaCard key={p.id} persona={p} configuredProviderIds={configuredProviderIds} />
          ))}
        </div>
      )}
    </div>
  )
}

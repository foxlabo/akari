'use client'

import { useState } from 'react'
import { PersonaForm } from '@/components/persona/persona-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Persona } from '@/lib/db/schema'

interface PersonaCardProps {
  persona: Persona
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{persona.name}</h3>
            <span className="shrink-0 text-xs text-zinc-500">{persona.provider}</span>
          </div>
          <p className="line-clamp-2 text-xs text-zinc-500">{persona.systemPrompt}</p>
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500">
            <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">
              {persona.model}
            </span>
            <span>temp {persona.temperature.toFixed(1)}</span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit persona</DialogTitle>
          <DialogDescription>
            Adjust the system prompt, model, or temperature. Existing conversations using this
            persona will pick up the changes on the next message.
          </DialogDescription>
        </DialogHeader>
        <PersonaForm persona={persona} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

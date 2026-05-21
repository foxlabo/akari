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
import type { ProviderId } from '@/lib/ai/providers'

interface PersonaCreateDialogProps {
  configuredProviderIds: ProviderId[]
  children: React.ReactNode
}

export function PersonaCreateDialog({ configuredProviderIds, children }: PersonaCreateDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create persona</DialogTitle>
          <DialogDescription>
            A persona pairs a system prompt with a provider/model and temperature. Use it as a
            preset when starting a conversation.
          </DialogDescription>
        </DialogHeader>
        <PersonaForm configuredProviderIds={configuredProviderIds} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

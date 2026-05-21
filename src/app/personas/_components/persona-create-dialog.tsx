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

interface PersonaCreateDialogProps {
  children: React.ReactNode
}

export function PersonaCreateDialog({ children }: PersonaCreateDialogProps) {
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
        <PersonaForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

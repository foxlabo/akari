'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ensureDbReady } from '@/lib/db/init'
import { createConversation, getPersona } from '@/lib/db/queries'

export async function startConversationAction(formData: FormData) {
  ensureDbReady()
  const personaId = formData.get('personaId')
  if (typeof personaId !== 'string' || !personaId) {
    throw new Error('Missing personaId')
  }
  const persona = getPersona(personaId)
  if (!persona) throw new Error('Persona not found')
  const conversation = createConversation(personaId, `Chat with ${persona.name}`)
  revalidatePath('/chat', 'layout')
  redirect(`/chat/${conversation.id}`)
}

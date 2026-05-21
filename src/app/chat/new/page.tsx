import { redirect } from 'next/navigation'
import { ensureDbReady } from '@/lib/db/init'
import { createConversation, listPersonas } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default function NewChatPage() {
  ensureDbReady()
  const personas = listPersonas()
  if (personas.length === 0) {
    throw new Error('No personas available. Seed personas first.')
  }
  const firstPersona = personas[0]
  if (!firstPersona) {
    throw new Error('Persona list returned empty array unexpectedly.')
  }
  const conversation = createConversation(firstPersona.id, 'New conversation')
  redirect(`/chat/${conversation.id}`)
}

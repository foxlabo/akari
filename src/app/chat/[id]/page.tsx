import type { UIMessage } from 'ai'
import { notFound } from 'next/navigation'
import { ensureDbReady } from '@/lib/db/init'
import { getConversation, getPersona, listMessages } from '@/lib/db/queries'
import { ChatClient } from './chat-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  ensureDbReady()
  const { id } = await params

  const conversation = getConversation(id)
  if (!conversation) notFound()
  if (conversation.archivedAt !== null) notFound()

  const persona = getPersona(conversation.personaId)
  if (!persona) notFound()

  const stored = listMessages(id)
  const initialMessages: UIMessage[] = stored.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text', text: m.content }],
  }))

  return (
    <ChatClient
      conversationId={id}
      conversationTitle={conversation.title}
      personaName={persona.name}
      initialMessages={initialMessages}
    />
  )
}

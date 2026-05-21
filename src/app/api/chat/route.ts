import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { z } from 'zod'
import { resolveModel } from '@/lib/ai/providers'
import { ensureDbReady } from '@/lib/db/init'
import { appendMessage, getConversation, getPersona } from '@/lib/db/queries'

const requestSchema = z.object({
  messages: z.array(z.unknown()),
  conversationId: z.string().min(1),
})

function extractText(message: UIMessage | undefined): string {
  if (!message) return ''
  const textPart = message.parts.find((p) => p.type === 'text')
  return textPart && 'text' in textPart ? textPart.text : ''
}

export async function POST(req: Request) {
  ensureDbReady()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request shape' }, { status: 400 })
  }

  const { messages: rawMessages, conversationId } = parsed.data
  const messages = rawMessages as UIMessage[]

  const conversation = getConversation(conversationId)
  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }
  const persona = getPersona(conversation.personaId)
  if (!persona) {
    return Response.json({ error: 'Persona not found' }, { status: 404 })
  }

  // Persist the new user message (last one in the array).
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  if (lastUserMessage) {
    const text = extractText(lastUserMessage)
    if (text) {
      appendMessage({ conversationId, role: 'user', content: text })
    }
  }

  let model: ReturnType<typeof resolveModel>
  try {
    model = resolveModel(persona.provider, persona.model)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provider initialisation failed'
    return Response.json({ error: message }, { status: 500 })
  }

  const modelMessages = await convertToModelMessages(messages)
  const result = streamText({
    model,
    system: persona.systemPrompt,
    messages: modelMessages,
    temperature: persona.temperature,
  })

  return result.toUIMessageStreamResponse({
    onFinish: ({ messages: finalMessages }) => {
      const lastAssistant = [...finalMessages].reverse().find((m) => m.role === 'assistant')
      if (!lastAssistant) return
      const text = extractText(lastAssistant)
      if (text) {
        appendMessage({ conversationId, role: 'assistant', content: text })
      }
    },
  })
}

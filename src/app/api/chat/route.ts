import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { z } from 'zod'
import { resolveModel } from '@/lib/ai/providers'
import { ensureDbReady } from '@/lib/db/init'
import { appendMessage, getConversation, getPersona, listMessages } from '@/lib/db/queries'

const MAX_USER_INPUT_CHARS = 32_000

/**
 * The shape we accept from the client (set by chat-client's
 * `prepareSendMessagesRequest`). The client sends only the new user message
 * plus the conversation id; the server is the single source of truth for
 * conversation history.
 */
const requestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.object({
    id: z.string().min(1).optional(),
    role: z.literal('user'),
    parts: z
      .array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
        }),
      )
      .min(1),
  }),
})

function extractText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text ?? '')
    .join('\n\n')
    .trim()
}

function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status })
}

export async function POST(req: Request) {
  ensureDbReady()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Invalid request shape', 400, {
      details: z.flattenError(parsed.error).fieldErrors,
    })
  }

  const { conversationId, message: clientMessage } = parsed.data

  // Server-authoritative lookups.
  const conversation = getConversation(conversationId)
  if (!conversation) return jsonError('Conversation not found', 404)
  const persona = getPersona(conversation.personaId)
  if (!persona) return jsonError('Persona not found', 404)

  // Validate text payload before persisting.
  const userText = extractText(clientMessage.parts)
  if (!userText) return jsonError('Message text is empty', 400)
  if (userText.length > MAX_USER_INPUT_CHARS) {
    return jsonError('Message text exceeds maximum length', 413, {
      max: MAX_USER_INPUT_CHARS,
    })
  }

  // Resolve provider/model before touching the DB so misconfiguration doesn't
  // leave orphan user messages.
  let model: ReturnType<typeof resolveModel>
  try {
    model = resolveModel(persona.provider, persona.model)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provider initialisation failed'
    return jsonError(message, 500)
  }

  // Idempotent insert — repeated retries with the same client message id are a no-op.
  appendMessage({
    id: clientMessage.id,
    conversationId,
    role: 'user',
    content: userText,
  })

  // Build the model context from the DB (the client copy is untrusted).
  const dbMessages = listMessages(conversationId)
  const uiMessages: UIMessage[] = dbMessages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text', text: m.content }],
  }))

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(uiMessages)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to build model context'
    return jsonError(message, 500)
  }

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
      const text = extractText(lastAssistant.parts as Array<{ type: string; text?: string }>)
      if (!text) return
      appendMessage({
        id: lastAssistant.id,
        conversationId,
        role: 'assistant',
        content: text,
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Streaming error'
      // Surface a stable error string to the client.
      return `Provider error: ${message}`
    },
  })
}

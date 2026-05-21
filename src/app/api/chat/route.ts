import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { z } from 'zod'
import { resolveModel } from '@/lib/ai/providers'
import { ensureDbReady } from '@/lib/db/init'
import { appendMessage, getConversation, getPersona, listMessages } from '@/lib/db/queries'

const MAX_USER_INPUT_CHARS = 32_000
/** Cap how much prior context we resend to the model (newest-first tail). */
const HISTORY_TAIL_LIMIT = 80

/**
 * The shape we accept from the client (set by chat-client's
 * `prepareSendMessagesRequest`). The client sends only the new user message
 * plus the conversation id; the server is the single source of truth for
 * conversation history.
 */
const requestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.object({
    id: z.string().min(1),
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

function logServerError(scope: string, err: unknown): void {
  // biome-ignore lint/suspicious/noConsole: server-side observability for opaque error responses
  console.error(`[akari/${scope}]`, err)
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

  const conversation = getConversation(conversationId)
  if (!conversation) return jsonError('Conversation not found', 404)
  if (conversation.archivedAt !== null) {
    return jsonError('Conversation is archived', 410)
  }
  const persona = getPersona(conversation.personaId)
  if (!persona) return jsonError('Persona not found', 404)

  const userText = extractText(clientMessage.parts)
  if (!userText) return jsonError('Message text is empty', 400)
  if (userText.length > MAX_USER_INPUT_CHARS) {
    return jsonError('Message text exceeds maximum length', 413, {
      max: MAX_USER_INPUT_CHARS,
    })
  }

  // Resolve provider/model before persisting so misconfiguration doesn't
  // leave orphan user messages.
  let model: ReturnType<typeof resolveModel>
  try {
    model = resolveModel(persona.provider, persona.model)
  } catch (err) {
    logServerError('chat/resolve-model', err)
    return jsonError(err instanceof Error ? err.message : 'Provider initialisation failed', 500)
  }

  // Idempotent insert — repeated retries with the same client id are a no-op.
  try {
    appendMessage({
      id: clientMessage.id,
      conversationId,
      role: 'user',
      content: userText,
    })
  } catch (err) {
    logServerError('chat/persist-user', err)
    return jsonError('Failed to persist message', 500)
  }

  // Server-authoritative history (capped tail).
  const fullHistory = listMessages(conversationId)
  const dbMessages =
    fullHistory.length > HISTORY_TAIL_LIMIT
      ? fullHistory.slice(fullHistory.length - HISTORY_TAIL_LIMIT)
      : fullHistory
  const uiMessages: UIMessage[] = dbMessages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text', text: m.content }],
  }))

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(uiMessages)
  } catch (err) {
    logServerError('chat/convert-messages', err)
    return jsonError('Failed to build model context', 500)
  }

  // A deterministic assistant id keeps onFinish persistence idempotent across
  // retries of the same user message.
  const assistantMessageId = `asst-${clientMessage.id}`

  let totalTokens: number | undefined
  const result = streamText({
    model,
    system: persona.systemPrompt,
    messages: modelMessages,
    temperature: persona.temperature,
    onFinish: ({ usage }) => {
      const t = usage?.totalTokens
      totalTokens = typeof t === 'number' ? t : undefined
    },
  })

  return result.toUIMessageStreamResponse({
    onFinish: ({ messages: finalMessages }) => {
      const lastAssistant = [...finalMessages].reverse().find((m) => m.role === 'assistant')
      if (!lastAssistant) return
      const text = extractText(lastAssistant.parts as Array<{ type: string; text?: string }>)
      if (!text) return
      try {
        appendMessage({
          id: assistantMessageId,
          conversationId,
          role: 'assistant',
          content: text,
          tokens: totalTokens ?? null,
        })
      } catch (err) {
        logServerError('chat/persist-assistant', err)
      }
    },
    onError: (error) => {
      logServerError('chat/stream', error)
      // Return a stable client-facing message; details stay in server logs.
      return 'Provider error while streaming the response. See server logs for details.'
    },
  })
}

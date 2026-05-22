'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConversationMenu } from '@/components/chat/conversation-menu'
import { MessageBubble } from '@/components/chat/message-bubble'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

interface ChatClientProps {
  conversationId: string
  conversationTitle: string
  personaName: string
  initialMessages: UIMessage[]
}

/** Flatten a UIMessage's text parts into a single string. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('\n\n')
}

export function ChatClient({
  conversationId,
  conversationTitle,
  personaName,
  initialMessages,
}: ChatClientProps) {
  const [input, setInput] = useState('')

  // Transport identity is meaningful to useChat — memoize so typing
  // doesn't tear down and rebuild it on every keystroke.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest({ messages, body }) {
          const last = messages[messages.length - 1]
          return {
            body: {
              ...body,
              conversationId,
              message: last,
            },
          }
        },
      }),
    [conversationId],
  )

  const { messages, sendMessage, status, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-6 py-2.5 dark:border-zinc-800">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="truncate text-base font-medium">{conversationTitle}</h1>
          <span className="shrink-0 text-xs text-zinc-500">{personaName}</span>
        </div>
        <ConversationMenu conversationId={conversationId} currentTitle={conversationTitle} />
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Start the conversation by typing below.
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} role={message.role} text={messageText(message)} />
            ))
          )}
          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error.message}
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <form
        onSubmit={submit}
        className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                submit(e)
              }
            }}
            placeholder="Type a message... (Ctrl/Cmd + Enter to send)"
            aria-label="Message"
            disabled={isStreaming}
            rows={2}
            className="resize-none"
          />
          <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
            <Send />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

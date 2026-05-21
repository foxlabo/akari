import type { UIMessage } from 'ai'
import { memo } from 'react'
import ReactMarkdown, { type Components, defaultUrlTransform } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: UIMessage
}

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const

/**
 * Restrict markdown URLs to safe protocols. Anything else (e.g. `javascript:`)
 * is replaced with `#` to neutralise injection through model output.
 */
function safeUrlTransform(url: string): string {
  const defaultResolved = defaultUrlTransform(url)
  if (!defaultResolved) return ''
  try {
    const parsed = new URL(defaultResolved, 'http://_relative_base/')
    if ((ALLOWED_URL_PROTOCOLS as readonly string[]).includes(parsed.protocol)) {
      return defaultResolved
    }
  } catch {
    if (defaultResolved.startsWith('#') || defaultResolved.startsWith('/')) {
      return defaultResolved
    }
  }
  return '#'
}

const markdownComponents: Components = {
  a: ({ children, href, ...props }) => (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

function extractMessageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('\n\n')
}

function MessageBubbleImpl({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const text = extractMessageText(message)

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800',
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-900 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:rounded-md [&_code]:before:hidden [&_code]:after:hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
            urlTransform={safeUrlTransform}
            components={markdownComponents}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

/**
 * Memoised by message identity + text content so unrelated re-renders
 * (e.g. composer typing) don't reparse markdown.
 */
export const MessageBubble = memo(MessageBubbleImpl, (prev, next) => {
  if (prev.message.id !== next.message.id) return false
  return extractMessageText(prev.message) === extractMessageText(next.message)
})

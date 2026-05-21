import type { UIMessage } from 'ai'
import { memo } from 'react'
import ReactMarkdown, { type Components, defaultUrlTransform } from 'react-markdown'
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
  // react-markdown's defaultUrlTransform already strips most dangerous cases,
  // but we double-check the protocol explicitly so future markdown plugins
  // don't reintroduce risk.
  const defaultResolved = defaultUrlTransform(url)
  if (!defaultResolved) return ''
  try {
    const parsed = new URL(defaultResolved, 'http://_relative_base/')
    if ((ALLOWED_URL_PROTOCOLS as readonly string[]).includes(parsed.protocol)) {
      return defaultResolved
    }
  } catch {
    // Relative URLs and fragments do not parse with a base — accept them.
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

function MessageBubbleImpl({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('\n\n')

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
        <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
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
 * Memoised by message identity so unrelated re-renders (e.g. composer typing)
 * don't reparse markdown.
 */
export const MessageBubble = memo(MessageBubbleImpl, (prev, next) => {
  if (prev.message.id !== next.message.id) return false
  // Re-render if any text part content changed (streaming updates the last bubble).
  const prevText = prev.message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('')
  const nextText = next.message.parts
    .filter((p) => p.type === 'text')
    .map((p) => ('text' in p ? p.text : ''))
    .join('')
  return prevText === nextText
})

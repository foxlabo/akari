'use client'

import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Item {
  id: string
  title: string
}

interface ConversationSearchProps {
  conversations: Item[]
  renderItem: (item: Item) => React.ReactNode
  emptyText: string
}

/**
 * Client-side filter over the sidebar conversation list. Keeps the search box
 * + filtered list in one component so we don't need a server round trip for
 * each keystroke.
 */
export function ConversationSearch({
  conversations,
  renderItem,
  emptyText,
}: ConversationSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, query])

  return (
    <>
      <div className="relative px-2 pt-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search conversations"
          className="h-8 pl-7 pr-7 text-xs"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2"
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-zinc-500">
            {query.trim() ? 'No matches.' : emptyText}
          </p>
        ) : (
          filtered.map((c) => <div key={c.id}>{renderItem(c)}</div>)
        )}
      </nav>
    </>
  )
}

import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { ConversationSearch } from '@/components/chat/conversation-search'
import { ChatKeyboardShortcuts } from '@/components/chat/keyboard-shortcuts'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ensureDbReady } from '@/lib/db/init'
import { listConversations } from '@/lib/db/queries'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  ensureDbReady()
  const conversations = listConversations().map((c) => ({ id: c.id, title: c.title }))

  return (
    <div className="flex h-screen w-full">
      <ChatKeyboardShortcuts />
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
          <Button asChild className="w-full" variant="outline">
            <Link href="/chat/new">
              <PlusCircle />
              New conversation
            </Link>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <ConversationSearch conversations={conversations} emptyText="No conversations yet." />
        </ScrollArea>
        <div className="flex items-center justify-between border-t border-zinc-200 p-3 text-xs text-zinc-500 dark:border-zinc-800">
          <Link href="/personas" className="hover:underline">
            Manage personas →
          </Link>
          <ThemeToggle />
        </div>
      </aside>
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
    </div>
  )
}

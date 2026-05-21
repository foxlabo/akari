import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ensureDbReady } from '@/lib/db/init'
import { listConversations } from '@/lib/db/queries'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  ensureDbReady()
  const conversations = listConversations()

  return (
    <div className="flex h-screen w-full">
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
          <nav className="flex flex-col gap-1 p-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-zinc-500">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className="truncate rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {c.title}
                </Link>
              ))
            )}
          </nav>
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

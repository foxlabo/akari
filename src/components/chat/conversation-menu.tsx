'use client'

import { Archive, Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  archiveConversationAction,
  deleteConversationAction,
  exportConversationAction,
  renameConversationAction,
} from '@/app/chat/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface ConversationMenuProps {
  conversationId: string
  currentTitle: string
}

export function ConversationMenu({ conversationId, currentTitle }: ConversationMenuProps) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [title, setTitle] = useState(currentTitle)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await renameConversationAction({ id: conversationId, title })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setRenameOpen(false)
      router.refresh()
    })
  }

  const handleArchive = () => {
    if (!confirm(`Archive "${currentTitle}"? It will be hidden from the sidebar.`)) return
    startTransition(async () => {
      await archiveConversationAction(conversationId)
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${currentTitle}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteConversationAction(conversationId)
    })
  }

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportConversationAction(conversationId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Conversation actions" disabled={pending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExport}>
            <Download className="h-4 w-4" />
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleArchive}>
            <Archive className="h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="New title"
              aria-label="Conversation title"
              autoFocus
            />
            {error ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !title.trim()}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

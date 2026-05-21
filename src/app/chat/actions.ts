'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ensureDbReady } from '@/lib/db/init'
import {
  deleteConversation as dbDeleteConversation,
  renameConversation as dbRenameConversation,
} from '@/lib/db/queries'

const renameSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
})

export async function renameConversationAction(input: { id: string; title: string }) {
  ensureDbReady()
  const parsed = renameSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Invalid title' }
  const updated = dbRenameConversation(parsed.data.id, parsed.data.title)
  if (!updated) return { ok: false as const, error: 'Conversation not found' }
  revalidatePath('/chat', 'layout')
  revalidatePath(`/chat/${parsed.data.id}`)
  return { ok: true as const }
}

export async function deleteConversationAction(id: string) {
  ensureDbReady()
  dbDeleteConversation(id)
  revalidatePath('/chat', 'layout')
  redirect('/chat/new')
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ensureDbReady } from '@/lib/db/init'
import {
  archiveConversation as dbArchiveConversation,
  deleteConversation as dbDeleteConversation,
  renameConversation as dbRenameConversation,
  getConversation,
  getPersona,
  listMessages,
} from '@/lib/db/queries'

const renameSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
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

export async function archiveConversationAction(id: string) {
  ensureDbReady()
  dbArchiveConversation(id)
  revalidatePath('/chat', 'layout')
  redirect('/chat/new')
}

export async function deleteConversationAction(id: string) {
  ensureDbReady()
  dbDeleteConversation(id)
  revalidatePath('/chat', 'layout')
  redirect('/chat/new')
}

/** 10 MB cap on a single export payload — Server Actions stream over RPC, so
 *  unbounded blobs are a foot-gun. */
const MAX_EXPORT_BYTES = 10 * 1024 * 1024

/**
 * Build a self-contained Markdown export for the conversation.
 * Returned as a string so the client can trigger a download.
 */
export async function exportConversationAction(
  id: string,
): Promise<{ ok: true; filename: string; markdown: string } | { ok: false; error: string }> {
  ensureDbReady()
  const conversation = getConversation(id)
  if (!conversation) return { ok: false, error: 'Conversation not found' }
  const persona = getPersona(conversation.personaId)
  const messages = listMessages(id)

  const lines: string[] = []
  lines.push(`# ${conversation.title}`)
  lines.push('')
  lines.push(`- Persona: **${persona?.name ?? 'unknown'}**`)
  if (persona) lines.push(`- Model: \`${persona.provider} / ${persona.model}\``)
  lines.push(`- Created: ${new Date(conversation.createdAt).toISOString()}`)
  lines.push(`- Exported: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const message of messages) {
    const label =
      message.role === 'user'
        ? '## 🧑 User'
        : message.role === 'assistant'
          ? '## 🤖 Assistant'
          : '## System'
    lines.push(label)
    lines.push('')
    lines.push(message.content)
    lines.push('')
  }

  const markdown = lines.join('\n')
  const byteLength = Buffer.byteLength(markdown, 'utf8')
  if (byteLength > MAX_EXPORT_BYTES) {
    return {
      ok: false,
      error: `Export is too large (${(byteLength / 1024 / 1024).toFixed(1)} MB). Limit is ${MAX_EXPORT_BYTES / 1024 / 1024} MB.`,
    }
  }

  const slug =
    conversation.title
      .replace(/[^a-z0-9-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'chat'
  const date = new Date(conversation.createdAt).toISOString().slice(0, 10)
  const filename = `${date}-${slug}.md`

  return { ok: true, filename, markdown }
}

import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { db } from './index'
import {
  type Conversation,
  conversations,
  type Message,
  messages,
  type NewMessage,
  type NewPersona,
  type Persona,
  personas,
} from './schema'

// ---------- Personas ----------

export function listPersonas(): Persona[] {
  return db.select().from(personas).orderBy(personas.name).all()
}

export function getPersona(id: string): Persona | undefined {
  return db.select().from(personas).where(eq(personas.id, id)).get()
}

export function createPersona(values: Omit<NewPersona, 'createdAt' | 'updatedAt'>): Persona {
  return db.insert(personas).values(values).returning().get()
}

/**
 * Idempotent insert — used by the default-persona seeder to avoid
 * duplicating rows when multiple processes race to initialise the DB.
 */
export function upsertPersonaIfMissing(values: Omit<NewPersona, 'createdAt' | 'updatedAt'>): void {
  db.insert(personas).values(values).onConflictDoNothing().run()
}

export function updatePersona(
  id: string,
  values: Partial<Omit<NewPersona, 'id' | 'createdAt'>>,
): Persona | undefined {
  return db
    .update(personas)
    .set({ ...values, updatedAt: Date.now() })
    .where(eq(personas.id, id))
    .returning()
    .get()
}

export function deletePersona(id: string): void {
  db.delete(personas).where(eq(personas.id, id)).run()
}

// ---------- Conversations ----------

export function listConversations(options?: { includeArchived?: boolean }): Conversation[] {
  const where = options?.includeArchived ? undefined : isNull(conversations.archivedAt)
  const query = db.select().from(conversations).orderBy(desc(conversations.updatedAt))
  return where ? query.where(where).all() : query.all()
}

export function getConversation(id: string): Conversation | undefined {
  return db.select().from(conversations).where(eq(conversations.id, id)).get()
}

export function createConversation(personaId: string, title: string): Conversation {
  return db.insert(conversations).values({ personaId, title }).returning().get()
}

export function renameConversation(id: string, title: string): Conversation | undefined {
  return db
    .update(conversations)
    .set({ title, updatedAt: Date.now() })
    .where(eq(conversations.id, id))
    .returning()
    .get()
}

export function archiveConversation(id: string): void {
  db.update(conversations)
    .set({ archivedAt: Date.now(), updatedAt: Date.now() })
    .where(eq(conversations.id, id))
    .run()
}

export function deleteConversation(id: string): void {
  db.delete(conversations).where(eq(conversations.id, id)).run()
}

// ---------- Messages ----------

/**
 * Return messages in stable order: createdAt ascending, with id as tiebreaker.
 * The tiebreaker keeps order deterministic when two messages share a millisecond.
 */
export function listMessages(conversationId: string): Message[] {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt), asc(messages.id))
    .all()
}

export function getMessage(id: string): Message | undefined {
  return db.select().from(messages).where(eq(messages.id, id)).get()
}

/**
 * Append a message, bumping the conversation's updatedAt in the same transaction.
 *
 * If `values.id` is provided and a row with that id already exists, the existing
 * row is returned unchanged — this makes retries safe (e.g. when the AI SDK
 * resends a request with the same client message id).
 */
export function appendMessage(values: Omit<NewMessage, 'createdAt'>): Message {
  return db.transaction((tx) => {
    if (values.id) {
      const existing = tx.select().from(messages).where(eq(messages.id, values.id)).get()
      if (existing) return existing
    }
    const inserted = tx.insert(messages).values(values).returning().get()
    tx.update(conversations)
      .set({ updatedAt: Date.now() })
      .where(eq(conversations.id, values.conversationId))
      .run()
    return inserted
  })
}

/**
 * Most-recent N messages in chronological (ascending) order, suitable for
 * feeding into a model. We grab the tail by descending sort + limit, then
 * reverse so the oldest message is first.
 */
export function tailMessagesForChat(
  conversationId: string,
  limit = 50,
): Array<Pick<Message, 'role' | 'content'>> {
  const desc_rows = db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId)))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit)
    .all()
  return desc_rows.reverse()
}

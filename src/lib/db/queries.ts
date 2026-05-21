import { and, desc, eq, isNull } from 'drizzle-orm'
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

export function createPersona(values: Omit<NewPersona, 'id' | 'createdAt' | 'updatedAt'>): Persona {
  return db.insert(personas).values(values).returning().get()
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

export function listMessages(conversationId: string): Message[] {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .all()
}

export function appendMessage(values: Omit<NewMessage, 'id' | 'createdAt'>): Message {
  // Bump the conversation's updatedAt so it sorts to the top.
  const inserted = db.insert(messages).values(values).returning().get()
  db.update(conversations)
    .set({ updatedAt: Date.now() })
    .where(eq(conversations.id, values.conversationId))
    .run()
  return inserted
}

export function recentMessagesForChat(
  conversationId: string,
  limit = 50,
): Array<Pick<Message, 'role' | 'content'>> {
  return db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId)))
    .orderBy(messages.createdAt)
    .limit(limit)
    .all()
}

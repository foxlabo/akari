import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => nanoid())

const now = (name: string) =>
  integer(name)
    .notNull()
    .$defaultFn(() => Date.now())

export const personas = sqliteTable('personas', {
  id: id(),
  name: text('name').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  provider: text('provider', {
    enum: ['openai', 'anthropic', 'google', 'ollama'],
  }).notNull(),
  model: text('model').notNull(),
  temperature: real('temperature').notNull().default(0.7),
  createdAt: now('created_at'),
  updatedAt: now('updated_at'),
})

export const conversations = sqliteTable('conversations', {
  id: id(),
  personaId: text('persona_id')
    .notNull()
    .references(() => personas.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: now('created_at'),
  updatedAt: now('updated_at'),
  archivedAt: integer('archived_at'),
})

export const messages = sqliteTable('messages', {
  id: id(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  tokens: integer('tokens'),
  createdAt: now('created_at'),
})

export type Persona = typeof personas.$inferSelect
export type NewPersona = typeof personas.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

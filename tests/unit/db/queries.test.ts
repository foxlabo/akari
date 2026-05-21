/**
 * Integration tests for DB query helpers.
 *
 * We use an in-memory SQLite to avoid touching the dev DB file.
 * The schema is applied at runtime via Drizzle's better-sqlite3 dialect.
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as schema from '@/lib/db/schema'

type Db = ReturnType<typeof drizzle>

function buildInMemoryDb(): Db {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE personas (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      temperature REAL NOT NULL DEFAULT 0.7,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE conversations (
      id TEXT PRIMARY KEY NOT NULL,
      persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      archived_at INTEGER
    );
    CREATE TABLE messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tokens INTEGER,
      created_at INTEGER NOT NULL
    );
  `)
  return drizzle(sqlite, { schema })
}

// We mock the db module so queries.ts uses our in-memory instance.
let testDb: Db

vi.mock('@/lib/db', () => ({
  get db() {
    return testDb
  },
  schema,
}))

let queries: typeof import('@/lib/db/queries')

beforeEach(async () => {
  testDb = buildInMemoryDb()
  vi.resetModules()
  queries = await import('@/lib/db/queries')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('persona queries', () => {
  it('creates and retrieves a persona', () => {
    const created = queries.createPersona({
      name: 'Test',
      systemPrompt: 'You are a test persona.',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
    expect(created.id).toBeTypeOf('string')
    expect(created.name).toBe('Test')

    const fetched = queries.getPersona(created.id)
    expect(fetched?.id).toBe(created.id)
  })

  it('lists personas in name order', () => {
    queries.createPersona({
      name: 'Bravo',
      systemPrompt: 'b',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
    queries.createPersona({
      name: 'Alpha',
      systemPrompt: 'a',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
    const list = queries.listPersonas()
    expect(list.map((p) => p.name)).toEqual(['Alpha', 'Bravo'])
  })

  it('updates a persona and bumps updatedAt', async () => {
    const created = queries.createPersona({
      name: 'Test',
      systemPrompt: 'a',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
    // Ensure updatedAt advances by at least 1 ms.
    await new Promise((r) => setTimeout(r, 5))
    const updated = queries.updatePersona(created.id, { name: 'Renamed' })
    expect(updated?.name).toBe('Renamed')
    expect(updated?.updatedAt ?? 0).toBeGreaterThan(created.updatedAt)
  })

  it('deletes a persona', () => {
    const created = queries.createPersona({
      name: 'Test',
      systemPrompt: 'a',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
    queries.deletePersona(created.id)
    expect(queries.getPersona(created.id)).toBeUndefined()
  })
})

describe('conversation queries', () => {
  function seedPersona() {
    return queries.createPersona({
      name: 'P',
      systemPrompt: 'a',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.5,
    })
  }

  it('creates a conversation and appends messages', () => {
    const persona = seedPersona()
    const conv = queries.createConversation(persona.id, 'Hello')
    expect(conv.title).toBe('Hello')

    queries.appendMessage({ conversationId: conv.id, role: 'user', content: 'hi' })
    queries.appendMessage({
      conversationId: conv.id,
      role: 'assistant',
      content: 'hello there',
    })

    const messages = queries.listMessages(conv.id)
    expect(messages.map((m) => m.content)).toEqual(['hi', 'hello there'])
  })

  it('hides archived conversations by default', () => {
    const persona = seedPersona()
    const conv = queries.createConversation(persona.id, 'Archived chat')
    queries.archiveConversation(conv.id)
    const list = queries.listConversations()
    expect(list.find((c) => c.id === conv.id)).toBeUndefined()
    const all = queries.listConversations({ includeArchived: true })
    expect(all.find((c) => c.id === conv.id)).toBeDefined()
  })

  it('deletes a conversation and cascades messages', () => {
    const persona = seedPersona()
    const conv = queries.createConversation(persona.id, 'Doomed')
    queries.appendMessage({ conversationId: conv.id, role: 'user', content: 'hi' })
    queries.deleteConversation(conv.id)
    expect(queries.getConversation(conv.id)).toBeUndefined()
    expect(queries.listMessages(conv.id)).toEqual([])
  })

  it('renames a conversation', () => {
    const persona = seedPersona()
    const conv = queries.createConversation(persona.id, 'Old')
    const renamed = queries.renameConversation(conv.id, 'New')
    expect(renamed?.title).toBe('New')
  })
})

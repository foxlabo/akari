import { describe, expect, it } from 'vitest'
import { conversations, messages, personas } from '@/lib/db/schema'

describe('schema', () => {
  it('exposes persona table with required columns', () => {
    expect(personas).toBeDefined()
    expect(personas.name).toBeDefined()
    expect(personas.systemPrompt).toBeDefined()
    expect(personas.provider).toBeDefined()
    expect(personas.model).toBeDefined()
    expect(personas.temperature).toBeDefined()
  })

  it('exposes conversation table referencing personas', () => {
    expect(conversations).toBeDefined()
    expect(conversations.personaId).toBeDefined()
    expect(conversations.title).toBeDefined()
  })

  it('exposes message table referencing conversations', () => {
    expect(messages).toBeDefined()
    expect(messages.conversationId).toBeDefined()
    expect(messages.role).toBeDefined()
    expect(messages.content).toBeDefined()
  })
})

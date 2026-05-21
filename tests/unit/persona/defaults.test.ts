import { describe, expect, it } from 'vitest'
import { defaultPersonas } from '@/lib/persona/defaults'

describe('default personas', () => {
  it('contains stable ids and unique names', () => {
    const ids = defaultPersonas.map((p) => p.id)
    const names = defaultPersonas.map((p) => p.name)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
    for (const id of ids) {
      expect(id).toMatch(/^default-/)
    }
  })

  it('preserves Japanese persona names verbatim (no mojibake)', () => {
    const codeReview = defaultPersonas.find((p) => p.id === 'default-code-review')
    expect(codeReview?.name).toBe('コードレビュアー')

    const businessEmail = defaultPersonas.find((p) => p.id === 'default-business-email-jp')
    expect(businessEmail?.name).toBe('ビジネスメール添削')

    const translator = defaultPersonas.find((p) => p.id === 'default-translator-en-jp')
    expect(translator?.name).toBe('英日翻訳者')

    const writingCoach = defaultPersonas.find((p) => p.id === 'default-writing-coach-jp')
    expect(writingCoach?.name).toBe('日本語ライティングコーチ')

    const brainstorm = defaultPersonas.find((p) => p.id === 'default-brainstorm-jp')
    expect(brainstorm?.name).toBe('アイデア壁打ち')
  })

  it('every persona references a supported provider', () => {
    const supported = new Set(['openai', 'anthropic', 'google', 'ollama'])
    for (const persona of defaultPersonas) {
      expect(supported.has(persona.provider)).toBe(true)
    }
  })
})

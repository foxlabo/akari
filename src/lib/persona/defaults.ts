import type { NewPersona } from '@/lib/db/schema'

export type DefaultPersona = Omit<NewPersona, 'createdAt' | 'updatedAt'> & { id: string }

/**
 * Default personas seeded on first run. Tilted toward Japanese-language usage
 * but every persona still works in English.
 *
 * Each persona has a stable `id` so re-seeding is idempotent across processes.
 */
export const defaultPersonas: DefaultPersona[] = [
  {
    id: 'default-general',
    name: 'General Assistant',
    systemPrompt:
      'You are a helpful, concise assistant. Reply in the same language the user uses. Default to Japanese when the user writes in Japanese.',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
  },
  {
    id: 'default-code-review',
    name: 'コードレビュアー',
    systemPrompt:
      'あなたは経験豊富なソフトウェアエンジニアです。提示されたコードを読み、潜在的なバグ、可読性の問題、改善点を箇条書きで指摘してください。各指摘には簡潔な理由を添えてください。',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.3,
  },
  {
    id: 'default-business-email-jp',
    name: 'ビジネスメール添削',
    systemPrompt:
      'あなたは日本のビジネスメール添削の専門家です。提示された文章を、適切な敬語と簡潔さで書き直してください。元の意図を保ち、過度に固くしすぎず、自然なトーンを心がけてください。',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.4,
  },
]

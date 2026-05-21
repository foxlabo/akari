import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'ollama'

export interface ProviderModel {
  id: string
  label: string
}

export interface ProviderCatalogEntry {
  id: ProviderId
  label: string
  models: ProviderModel[]
}

export interface ConfiguredProviderInfo extends ProviderCatalogEntry {
  configured: boolean
}

/**
 * The static catalogue of provider + model combinations the UI exposes.
 * Pure data, safe to import from client components.
 */
const CATALOG: Record<ProviderId, { label: string; models: ProviderModel[] }> = {
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    models: [
      { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
      { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-7-sonnet-latest', label: 'Claude 3.7 Sonnet' },
    ],
  },
  google: {
    label: 'Google',
    models: [
      { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  ollama: {
    label: 'Ollama (local)',
    models: [
      { id: 'llama3.2', label: 'Llama 3.2' },
      { id: 'qwen2.5', label: 'Qwen 2.5' },
    ],
  },
}

/**
 * Static catalogue of provider + model options. Pure data — safe to call
 * from client components.
 */
export function getProviderCatalog(): ProviderCatalogEntry[] {
  return (Object.entries(CATALOG) as Array<[ProviderId, (typeof CATALOG)[ProviderId]]>).map(
    ([id, entry]) => ({
      id,
      label: entry.label,
      models: entry.models,
    }),
  )
}

/**
 * Whether the given provider/model combination is in the static catalogue.
 * Pure data — safe to call from client components.
 */
export function isKnownProviderModel(provider: string, model: string): boolean {
  if (!(provider in CATALOG)) return false
  const entry = CATALOG[provider as ProviderId]
  return entry.models.some((m) => m.id === model)
}

/**
 * Inspect environment variables to determine which providers have credentials.
 * **Server-only** — reads non-`NEXT_PUBLIC_` env vars; importing this from a
 * client component will yield empty/wrong results.
 */
export function getConfiguredProviderIds(): ProviderId[] {
  const configured: ProviderId[] = []
  if (process.env.OPENAI_API_KEY) configured.push('openai')
  if (process.env.ANTHROPIC_API_KEY) configured.push('anthropic')
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) configured.push('google')
  // Ollama doesn't need an API key — assume locally reachable unless we want
  // to add an active-probe later.
  configured.push('ollama')
  return configured
}

/**
 * Resolve a provider+model combination to a runnable LanguageModel.
 * **Server-only** — throws if the provider's credentials are missing.
 */
export function resolveModel(provider: ProviderId, model: string): LanguageModel {
  switch (provider) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
      return createOpenAI({ apiKey })(model)
    }
    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
      return createAnthropic({ apiKey })(model)
    }
    case 'google': {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
      return createGoogleGenerativeAI({ apiKey })(model)
    }
    case 'ollama': {
      const baseURL = `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/v1`
      // Ollama exposes an OpenAI-compatible endpoint.
      return createOpenAI({ baseURL, apiKey: 'ollama' })(model)
    }
    default: {
      const _exhaustive: never = provider
      throw new Error(`Unknown provider: ${String(_exhaustive)}`)
    }
  }
}

import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'ollama'

export interface ProviderModel {
  id: string
  label: string
}

export interface ProviderInfo {
  id: ProviderId
  label: string
  models: ProviderModel[]
  configured: boolean
}

/**
 * Resolve a provider+model combination to a runnable LanguageModel,
 * or throw a descriptive error if the provider is not configured.
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

/**
 * Static catalogue of provider+models exposed in the UI.
 * Adding a new model here surfaces it in the selector; no other change needed.
 */
export function listProviders(): ProviderInfo[] {
  return [
    {
      id: 'openai',
      label: 'OpenAI',
      configured: !!process.env.OPENAI_API_KEY,
      models: [
        { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
        { id: 'gpt-4o', label: 'GPT-4o' },
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      ],
    },
    {
      id: 'anthropic',
      label: 'Anthropic',
      configured: !!process.env.ANTHROPIC_API_KEY,
      models: [
        { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
        { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-7-sonnet-latest', label: 'Claude 3.7 Sonnet' },
      ],
    },
    {
      id: 'google',
      label: 'Google',
      configured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      models: [
        { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      ],
    },
    {
      id: 'ollama',
      label: 'Ollama (local)',
      configured: true,
      models: [
        { id: 'llama3.2', label: 'Llama 3.2' },
        { id: 'qwen2.5', label: 'Qwen 2.5' },
      ],
    },
  ]
}

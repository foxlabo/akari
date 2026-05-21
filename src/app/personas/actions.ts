'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isKnownProviderModel } from '@/lib/ai/providers'
import { ensureDbReady } from '@/lib/db/init'
import {
  createPersona as dbCreatePersona,
  deletePersona as dbDeletePersona,
  updatePersona as dbUpdatePersona,
} from '@/lib/db/queries'

const MAX_NAME_CHARS = 80
const MAX_SYSTEM_PROMPT_CHARS = 8_000

const personaSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(MAX_NAME_CHARS),
    systemPrompt: z
      .string()
      .trim()
      .min(1, 'System prompt is required')
      .max(MAX_SYSTEM_PROMPT_CHARS),
    provider: z.enum(['openai', 'anthropic', 'google', 'ollama']),
    model: z.string().min(1, 'Model is required').max(100),
    temperature: z.coerce.number().min(0).max(2),
  })
  .refine((v) => isKnownProviderModel(v.provider, v.model), {
    message: 'Model is not in the supported catalogue for this provider',
    path: ['model'],
  })

export type PersonaFormValues = z.infer<typeof personaSchema>

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function validationFailure(error: z.ZodError): ActionResult {
  return {
    ok: false,
    error: 'Validation failed',
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  }
}

export async function createPersonaAction(values: PersonaFormValues): Promise<ActionResult> {
  ensureDbReady()
  const parsed = personaSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  dbCreatePersona(parsed.data)
  revalidatePath('/personas')
  revalidatePath('/chat', 'layout')
  return { ok: true }
}

export async function updatePersonaAction(
  id: string,
  values: PersonaFormValues,
): Promise<ActionResult> {
  ensureDbReady()
  const parsed = personaSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  const updated = dbUpdatePersona(id, parsed.data)
  if (!updated) return { ok: false, error: 'Persona not found' }
  revalidatePath('/personas')
  revalidatePath('/chat', 'layout')
  return { ok: true }
}

export async function deletePersonaAction(id: string): Promise<ActionResult> {
  ensureDbReady()
  dbDeletePersona(id)
  revalidatePath('/personas')
  revalidatePath('/chat', 'layout')
  return { ok: true }
}

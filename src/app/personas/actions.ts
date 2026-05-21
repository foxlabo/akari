'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ensureDbReady } from '@/lib/db/init'
import {
  createPersona as dbCreatePersona,
  deletePersona as dbDeletePersona,
  updatePersona as dbUpdatePersona,
} from '@/lib/db/queries'

const personaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  provider: z.enum(['openai', 'anthropic', 'google', 'ollama']),
  model: z.string().min(1, 'Model is required'),
  temperature: z.coerce.number().min(0).max(2),
})

export type PersonaFormValues = z.infer<typeof personaSchema>

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createPersonaAction(values: PersonaFormValues): Promise<ActionResult> {
  ensureDbReady()
  const parsed = personaSchema.safeParse(values)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Validation failed',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }
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
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Validation failed',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }
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

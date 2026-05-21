'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  createPersonaAction,
  deletePersonaAction,
  type PersonaFormValues,
  updatePersonaAction,
} from '@/app/personas/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { listProviders, type ProviderId } from '@/lib/ai/providers'
import type { Persona } from '@/lib/db/schema'

interface PersonaFormProps {
  persona?: Persona
  onSaved?: () => void
}

const providers = listProviders()

export function PersonaForm({ persona, onSaved }: PersonaFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [values, setValues] = useState<PersonaFormValues>({
    name: persona?.name ?? '',
    systemPrompt: persona?.systemPrompt ?? '',
    provider: (persona?.provider ?? 'openai') as ProviderId,
    model: persona?.model ?? 'gpt-4o-mini',
    temperature: persona?.temperature ?? 0.7,
  })

  const currentProvider = providers.find((p) => p.id === values.provider)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    startTransition(async () => {
      const result = persona
        ? await updatePersonaAction(persona.id, values)
        : await createPersonaAction(values)
      if (!result.ok) {
        setError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }
      onSaved?.()
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!persona) return
    if (!confirm(`Delete "${persona.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deletePersonaAction(persona.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved?.()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" errors={fieldErrors.name}>
        <Input
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="e.g. Code reviewer"
          required
        />
      </Field>

      <Field label="System prompt" errors={fieldErrors.systemPrompt}>
        <Textarea
          rows={6}
          value={values.systemPrompt}
          onChange={(e) => setValues({ ...values, systemPrompt: e.target.value })}
          placeholder="Describe the persona's role, style, and constraints..."
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Provider" errors={fieldErrors.provider}>
          <Select
            value={values.provider}
            onValueChange={(v) => {
              const provider = v as ProviderId
              const firstModel = providers.find((p) => p.id === provider)?.models[0]?.id
              setValues({ ...values, provider, model: firstModel ?? values.model })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={!p.configured}>
                  {p.label}
                  {!p.configured ? ' (no API key)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Model" errors={fieldErrors.model}>
          <Select value={values.model} onValueChange={(v) => setValues({ ...values, model: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentProvider?.models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={`Temperature: ${values.temperature.toFixed(1)}`}
        errors={fieldErrors.temperature}
      >
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={values.temperature}
          onChange={(e) => setValues({ ...values, temperature: Number.parseFloat(e.target.value) })}
          className="w-full"
        />
      </Field>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        {persona ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={pending}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          {persona ? 'Save changes' : 'Create persona'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  errors,
  children,
}: {
  label: string
  errors?: string[]
  children: React.ReactNode
}) {
  // The input is rendered as children inside the label, which is a valid
  // implicit association per WHATWG HTML and the a11y spec, but Biome's static
  // rule can't see through the children boundary.
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: child input provides implicit association
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {errors?.length ? (
        <span className="block text-xs text-red-600 dark:text-red-400">{errors.join(', ')}</span>
      ) : null}
    </label>
  )
}

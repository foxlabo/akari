import { resolve } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { defaultPersonas } from '@/lib/persona/defaults'
import { db } from './index'
import { upsertPersonaIfMissing } from './queries'

let initialized = false

/**
 * Apply pending migrations and seed default personas idempotently.
 * Safe to call multiple times — protected by both a process-local flag
 * and `INSERT OR IGNORE` on the personas table (stable ids).
 *
 * Should be called once before the first DB query in any server context.
 */
export function ensureDbReady(): void {
  if (initialized) return

  const migrationsFolder = resolve(process.cwd(), 'drizzle')
  migrate(db, { migrationsFolder })

  for (const persona of defaultPersonas) {
    upsertPersonaIfMissing(persona)
  }

  initialized = true
}

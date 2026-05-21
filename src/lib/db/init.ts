import { resolve } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { defaultPersonas } from '@/lib/persona/defaults'
import { db } from './index'
import { personas } from './schema'

let initialized = false

/**
 * Apply pending migrations and seed default personas if the personas table is empty.
 * Idempotent: subsequent calls are no-ops within the same process.
 *
 * Should be called once before the first DB query in any server context.
 */
export function ensureDbReady(): void {
  if (initialized) return

  const migrationsFolder = resolve(process.cwd(), 'drizzle')
  migrate(db, { migrationsFolder })

  const existing = db.select({ id: personas.id }).from(personas).limit(1).all()
  if (existing.length === 0) {
    for (const persona of defaultPersonas) {
      db.insert(personas).values(persona).run()
    }
  }

  initialized = true
}

# CLAUDE.md — Akari

Context for AI coding agents (Claude Code, etc.) working on this repo.

## Project intent

Akari is a portfolio-grade clean-room reimagining of `lobe-chat`. The goal is
quality, not speed. Prefer fewer well-tested features over more shallow ones.

## Hard rules

- **No code copy from lobe-chat.** You may read its README and docs for
  understanding; you may NOT copy or transliterate code.
- **TypeScript strict.** No `any` without a `// reason:` comment.
- **No `console.log` in committed code.** Use a logger or remove.
- **Every new feature**: at least one Vitest unit test for pure logic, plus a
  Playwright E2E for user-visible flows.
- **Commits**: Conventional Commits. Keep them small and atomic.
- **Don't add a dependency without checking** if a smaller existing one
  covers the use case.

## Stack reminders

- Next.js **16** App Router (note: docs in `node_modules/next/dist/docs/`)
- React 19.2
- Tailwind **4** (no `tailwind.config.js`, configured via `@theme` in CSS)
- shadcn/ui components live in `src/components/ui/`
- AI SDK 5.x (`ai`, `@ai-sdk/openai`, etc.)
- Drizzle ORM with `better-sqlite3` for local DB

## Working style

- Read `docs/ARCHITECTURE.md` before non-trivial changes
- For new features, add an entry to `docs/ROADMAP.md` and check off when done
- Prefer Server Components by default; mark `'use client'` only where required
- Pure utility code (no React, no DB) goes in `src/lib/`
- Database access goes through `src/lib/db/`; routes import from there
- AI provider access goes through `src/lib/ai/`; never instantiate providers
  inside components

## When you're stuck

1. Check `node_modules/next/dist/docs/` for Next.js 16 specifics
2. Run `pnpm typecheck && pnpm check && pnpm test` before claiming done
3. If a third-party API surface changed, prefer reading its current docs over
   guessing from training data

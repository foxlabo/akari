# Architecture

This document records the design decisions for Akari. See [ROADMAP.md](./ROADMAP.md) for what is planned, and the git history for what is implemented.

## High-Level Decisions

| Concern | Choice | Why |
|---|---|---|
| Runtime | Next.js 16 (App Router) | Modern React Server Components + streaming primitives |
| Language | TypeScript strict | End-to-end type safety as a quality floor |
| AI provider abstraction | Vercel AI SDK 5.x | Single API across OpenAI / Anthropic / Google / Ollama, streaming and tool-call out of the box |
| Database | SQLite + Drizzle ORM | Local-first MVP, zero infra; migrating to Postgres later is a connection-string change |
| UI components | shadcn/ui + Radix + Tailwind 4 | Copy-paste components stay in repo, easy to customize, accessible by default |
| Lint / format | Biome | One tool, fast, no ESLint+Prettier juggling |
| Testing | Vitest (unit) + Playwright (E2E) | Both first-class TypeScript |
| Validation | Zod | Schema once, infer types, runtime checks |

## Repository Layout

```
akari/
├── docs/                       # Architecture, development, roadmap
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router (routes + layouts)
│   │   ├── (chat)/             # Main chat surface (route group)
│   │   ├── api/                # Edge / route handlers
│   │   └── layout.tsx
│   ├── components/             # React components (UI + features)
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── chat/               # Chat-specific components
│   ├── lib/                    # Pure utilities (no React)
│   │   ├── ai/                 # Provider configs, streaming helpers
│   │   ├── db/                 # Drizzle schema + client
│   │   └── persona/            # Persona model + defaults
│   └── styles/
├── tests/
│   ├── unit/                   # Vitest
│   └── e2e/                    # Playwright
├── drizzle/                    # Auto-generated migrations
├── biome.json                  # Lint / format config
├── drizzle.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

## Data Model (initial)

```text
Persona
  id: text (nanoid)
  name: text
  systemPrompt: text
  provider: text   -- 'openai' | 'anthropic' | 'google' | 'ollama'
  model: text      -- e.g. 'gpt-4o-mini', 'claude-3-5-sonnet'
  temperature: real
  createdAt: integer (unix ms)
  updatedAt: integer

Conversation
  id: text
  personaId: text  -- FK -> Persona
  title: text
  createdAt: integer
  updatedAt: integer
  archivedAt: integer | null

Message
  id: text
  conversationId: text  -- FK -> Conversation
  role: text  -- 'user' | 'assistant' | 'system'
  content: text
  tokens: integer | null
  createdAt: integer
```

## Streaming Flow

1. Client posts to `POST /api/chat` with `{ conversationId, message }`
2. Route handler loads persona + recent messages from SQLite
3. `streamText()` (AI SDK) issues request to the persona's provider
4. Response streams token-by-token via Server-Sent Events back to client
5. Client renders incrementally; on completion, message + token count are persisted

## Why "local-first"

- The user explicitly stated no server-hosting yet
- SQLite removes the entire "set up Postgres + manage migrations on a remote DB" burden
- All current logic stays compatible with a future Postgres backend via Drizzle dialect swap

## Inspired By, Not Copied From

This project's name, code, branding, and UX are independent from [lobe-chat](https://github.com/lobehub/lobe-chat). The source of lobe-chat may be read for understanding general patterns, but no code is copied; every line of Akari is written from scratch in this repository's git history.

## Open Questions

- Auth: skipped for MVP. When server-hosting becomes a goal, plug in Auth.js v5.
- Sync: local-first works, but cross-device sync is undefined. Possible answer: optional CRDT layer.
- Ollama discovery: assume `OLLAMA_BASE_URL` env, fall back to `http://localhost:11434`.

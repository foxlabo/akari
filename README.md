# Akari

Multi-provider AI chat with persona switching, conversation history, and local-first storage.

## Status

✅ **v1.0** — production-quality local chat: streaming, persistence, persona CRUD,
theme, search, export, archive, keyboard shortcuts. Two rounds of Codex review applied.

## Features

- 🤖 **Multi-provider** — OpenAI, Anthropic, Google Gemini, Ollama (local)
- 🎭 **Personas** — Custom system prompts, per-persona model + temperature, CRUD UI
- 💬 **Streaming** — Token-level streaming via AI SDK v6
- 📝 **Markdown** — `react-markdown` + GFM in assistant messages
- 💾 **Local-first** — SQLite (`better-sqlite3`) auto-migrated on first run
- 🗂 **Conversation history** — Sidebar, rename, delete, archive (archive UI in v0.2)
- 🌓 **Theme** — Light / dark / system with no-flash hydration
- 🌐 **Japanese-first UX** — Default personas include Japanese business email + code review

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19.2
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **AI**: Vercel AI SDK v6 (multi-provider abstraction)
- **DB**: SQLite (better-sqlite3) + Drizzle ORM
- **Validation**: Zod
- **Quality**: Biome (lint/format) + Vitest + Playwright
- **Language**: TypeScript strict mode

## Quick Start

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # add your API keys
pnpm db:push                  # apply schema to local SQLite
pnpm dev
```

Open <http://localhost:3000>.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — Design decisions and structure
- [Development](./docs/DEVELOPMENT.md) — Local setup and workflows
- [Roadmap](./docs/ROADMAP.md) — Planned milestones

## Security model

Akari is designed as a **single-user, local-only** application:

- No authentication / authorisation is built in
- All mutations (chat / persona / archive / delete / export) are reachable by
  any caller that can hit the server
- DB lives on the local filesystem (`./akari.db`)

If you deploy Akari beyond `localhost` (e.g. behind a tunnel, on a shared
network, on a public host), **you must add an auth layer in front of it**.
Reasonable starting points: Auth.js with a single provider, basic auth at the
reverse proxy, or Tailscale-only access.

## License

[MIT](./LICENSE)

# Akari

Multi-provider AI chat with persona switching, conversation history, and local-first storage.

> Inspired by [lobe-chat](https://github.com/lobehub/lobe-chat). Independently re-implemented from scratch as a portfolio project.

## Status

✅ **v0.1 MVP** — feature-complete chat with persona switching and persistence.

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
- **AI**: Vercel AI SDK 5.x (multi-provider abstraction)
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

## License

[MIT](./LICENSE)

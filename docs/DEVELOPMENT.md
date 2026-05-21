# Development

## Prerequisites

- Node 20+
- pnpm 10+
- (Optional) Ollama running locally for the Ollama provider

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm db:push        # apply Drizzle schema to local SQLite
pnpm dev
```

## Environment variables

| Key | Required for | Notes |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI provider | from <https://platform.openai.com> |
| `ANTHROPIC_API_KEY` | Anthropic provider | from <https://console.anthropic.com> |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google provider | from <https://aistudio.google.com> |
| `OLLAMA_BASE_URL` | Ollama provider (optional) | default `http://localhost:11434` |
| `DATABASE_URL` | DB | default `file:./akari.db` |

Missing keys disable only that provider; the app still runs.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server with HMR |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format (writes) |
| `pnpm check` | Biome lint + format check (CI-mode, no writes) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm db:generate` | Drizzle: generate migration from schema |
| `pnpm db:push` | Drizzle: push schema to local DB (dev) |
| `pnpm db:studio` | Drizzle Studio (DB explorer) |

## Workflow

- Branch: `feature/{topic}` or `fix/{topic}`
- Commit: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- PR: squash merge
- Tests: every new feature needs at least one unit test, critical flows need E2E
- Lint/format: enforced by pre-commit hook

## Troubleshooting

- **`better-sqlite3` build fails on Windows** — install Visual Studio Build Tools (C++ workload) or use the prebuilt binary fallback.
- **Provider errors silently in dev** — check the network tab and `OPENAI_API_KEY` etc. Errors surface as toast in production.

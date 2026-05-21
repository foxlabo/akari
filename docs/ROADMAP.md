# Roadmap

## v1.0 — Shipped ✅

After two rounds of Codex review and iteration, the following are in:

- Project scaffold (Next.js 16, Biome, Drizzle, Vitest, Playwright)
- SQLite schema (personas / conversations / messages) with auto-migrate +
  idempotent default-persona seeding (8 personas, JP + EN)
- `POST /api/chat` streaming endpoint
  - Server-authoritative history with tail cap (80 messages)
  - End-to-end idempotency via deterministic assistant ids
  - Validation + structured 4xx/5xx errors, internal logs sanitised
  - Rejects archived conversations (410)
  - Token usage persisted on assistant messages
- Chat UI
  - Streaming render with memoised message bubbles
  - Markdown + GFM + syntax-highlighted code (light/dark themes)
  - Server/client error display via role="alert"
  - Conversation rename / archive / delete / export (Markdown, 10 MB cap)
  - Sidebar conversation list + client-side search
  - Keyboard shortcuts: ⌘/Ctrl+K (focus composer), ⌘/Ctrl+⇧+N (new chat)
- Persona CRUD UI
  - Provider catalogue split from server env probe (no leak / no false disable)
  - Per-persona provider + model + temperature with auto-update on switch
  - Server-side validation (name ≤ 80, system prompt ≤ 8000, model ∈ catalogue)
- Theme: light / dark / system with pre-hydration FOUC guard
- Quality gates: TypeScript strict, Biome lint+format, Vitest (15 tests),
  Playwright config wired
- Documented as **local-only**; auth is out of scope for v1

## v1.1 — Polish

- Token-budget-aware history trimming (currently message-count based)
- Streaming export endpoint (currently buffers in memory before responding)
- Multi-worker safe migration lock (mutex / startup hook)
- Atomic upsert in `appendMessage` (currently select-then-insert in a
  transaction — fine for single-connection SQLite, not multi-process)
- Token counter UI on assistant messages
- Conversation tag and full-text search
- Playwright E2E for new-conversation + send-message flow
- i18n (ja / en)
- Persona import/export

## v2.0 — Beyond

- File attachments + vision-capable models
- Voice input
- Tool / MCP integration surface
- Optional sync (when a remote DB is introduced)
- Auth.js once a hosted version is planned

# Roadmap

## v0.1 — MVP ✅

- [x] Project scaffold (Next.js 16, Biome, Drizzle, Vitest, Playwright)
- [x] SQLite schema: Persona, Conversation, Message + auto-migrate + default seed
- [x] `POST /api/chat` streaming endpoint (AI SDK v6 + UIMessage)
- [x] Chat UI: message list, input, streaming render, error display
- [x] Persona CRUD UI (list, create, edit, delete via dialogs)
- [x] Conversation history sidebar + rename + delete
- [x] Markdown rendering (react-markdown + remark-gfm)
- [x] Provider switching (per-persona model selection with auto-update on provider change)
- [x] Four providers wired: OpenAI, Anthropic, Google, Ollama
- [x] Light / dark / system theme with no-flash hydration

## v0.2 — Polish

- [ ] Token counter + budget warnings
- [ ] Conversation archive UI (currently archive is in DB but no UI)
- [ ] Tag and search conversations
- [ ] Export conversation (Markdown / JSON)
- [ ] Keyboard shortcuts (palette, new chat, switch persona)
- [ ] Code-block syntax highlighting (Shiki)
- [ ] Japanese prompt pack (10+ personas covering business / dev / writing)
- [ ] i18n (ja / en)
- [ ] Playwright E2E for new-conversation + send-message flow

## v0.3 — Beyond

- [ ] File attachment + vision-capable models
- [ ] Voice input
- [ ] Tool/MCP integration surface
- [ ] Optional sync (when a remote DB is introduced)
- [ ] Auth.js once a hosted version is planned

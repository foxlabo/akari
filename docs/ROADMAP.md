# Roadmap

## v0.1 — MVP (target: 2 weeks)

- [ ] Project scaffold (Next.js 16, Biome, Drizzle, Vitest, Playwright)
- [ ] SQLite schema: Persona, Conversation, Message
- [ ] `POST /api/chat` streaming endpoint (OpenAI provider only)
- [ ] Chat UI: message list, input, streaming render
- [ ] Persona CRUD UI
- [ ] Conversation history sidebar
- [ ] Markdown + code syntax highlighting
- [ ] Provider switching (UI + per-persona model selection)
- [ ] Anthropic, Google, Ollama providers
- [ ] Light/dark theme
- [ ] Demo deployed to Vercel

## v0.2 — Polish

- [ ] Tag and search conversations
- [ ] Export conversation (Markdown / JSON)
- [ ] Keyboard shortcuts (palette, new chat, switch persona)
- [ ] Token counter + budget warnings
- [ ] Japanese prompt pack (10 personas: business / dev / writing)
- [ ] i18n (ja / en)

## v0.3 — Beyond

- [ ] File attachment + vision-capable models
- [ ] Voice input
- [ ] Optional sync (when remote DB is introduced)
- [ ] Plugin / tool-call surface

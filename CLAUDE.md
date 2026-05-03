# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.

## Commands

```bash
npm run dev          # Next.js dev server with Turbopack at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run setup        # First-time: npm install + prisma generate + prisma migrate dev
npm run db:reset     # Reset and re-migrate the SQLite database
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## What This App Does

UIGen is an AI-powered React component generator. Users describe components in chat; Claude Haiku generates them using tool calls that write to a virtual file system. The right pane shows a live preview (sandboxed iframe) and Monaco code editor.

## Architecture

### AI Integration

The core loop lives in `src/app/api/chat/route.ts`:
1. POST receives `{ messages, files, projectId }`
2. `streamText()` (Vercel AI SDK) calls Claude Haiku with two tools: `str_replace_editor` (create/view/edit files) and `file_manager` (rename/delete)
3. Tool calls mutate the in-memory `VirtualFileSystem`, streamed back to the client
4. On finish, messages + serialized file system are saved as JSON strings to the DB

The system prompt (`src/lib/prompts/generation.tsx`) uses Anthropic ephemeral prompt caching — it's sent every request but cached by Anthropic.

**Provider fallback** (`src/lib/provider.ts`): if `ANTHROPIC_API_KEY` is unset or a placeholder, a `MockLanguageModel` returns canned component code. Real Claude uses model `claude-haiku-4-5`, max 10k tokens, 40 agentic steps.

### Virtual File System

`src/lib/file-system.ts` — an in-memory Map-based tree, no disk writes. Claude's tool calls target this FS. It serializes to/from plain node arrays for DB storage and client/server transport. Parent directories are auto-created on file creation.

### State & Context

Two React contexts wire everything together:

- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): holds the `VirtualFileSystem` instance, selected file, and executes tool calls received from the chat stream
- **ChatContext** (`src/lib/contexts/chat-context.tsx`): wraps Vercel AI SDK's `useChat()`, integrates with FileSystemContext to apply tool results, tracks `projectId` for persistence

Tool execution flow: Claude outputs tool calls → `streamText` streams them → `ChatContext.onToolCall` → `FileSystemContext` applies changes → `refreshTrigger` increments → file tree and editor re-render.

### JSX Preview

`src/lib/transform/jsx-transformer.ts` transpiles JSX via Babel Standalone and builds an import map pointing React/React-DOM at esm.sh CDN and user files at blob URLs. This runs inside a sandboxed iframe (`src/components/preview/PreviewFrame`). Entry point resolution: looks for `App.jsx` → `App.tsx` → `index.jsx` → first `.jsx/.tsx` file.

### Auth

JWT-based, httpOnly cookie, 7-day expiry. `src/lib/auth.ts` handles session creation/verification. `middleware.ts` protects `/api/projects` and `/api/filesystem`. Server actions in `src/actions/index.ts` handle sign-up (bcrypt, 10 rounds), sign-in, and sign-out.

Anonymous users can work without logging in — `src/lib/anon-work-tracker.ts` persists their state to `sessionStorage` (lost on reload).

### Database

SQLite + Prisma. Two models: `User` and `Project`. Project stores `messages` and `data` (VirtualFileSystem state) as stringified JSON — no separate relations. Parse on retrieval with `JSON.parse`.

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Main AI streaming endpoint |
| `src/lib/provider.ts` | Real vs. mock Claude provider |
| `src/lib/file-system.ts` | Virtual FS implementation |
| `src/lib/prompts/generation.tsx` | Claude system prompt |
| `src/lib/tools/` | Tool definitions for Claude |
| `src/lib/contexts/` | FileSystemContext + ChatContext |
| `src/lib/transform/jsx-transformer.ts` | JSX → iframe preview |
| `src/lib/auth.ts` | JWT session helpers |
| `prisma/schema.prisma` | DB schema |

## Environment

Requires `ANTHROPIC_API_KEY` in `.env`. Without it, the mock provider activates automatically (max 4 steps, canned responses).

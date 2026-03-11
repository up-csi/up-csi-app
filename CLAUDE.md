# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UP CSI member application processing web app built with **SvelteKit 2** (Svelte 5), **TypeScript**, **Supabase** (auth + PostgreSQL), and **Google Drive API** (file storage). Uses **pnpm** as package manager.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build

pnpm fmt              # Check formatting (Prettier)
pnpm fmt:fix          # Auto-fix formatting
pnpm lint             # Run all linters in parallel (html, css, js, svelte)
pnpm lint:js          # ESLint only
pnpm lint:svelte      # Svelte type checking only
```

## Architecture

### Routing (SvelteKit file-based)

- `/` — Dashboard/home
- `/login` — Google OAuth login (restricted to `@up.edu.ph` emails, checked against Supabase `whitelist` table)
- `/login/callback` — OAuth callback with domain + whitelist validation
- `/sigsheet` — Signature sheet feature (member grid with modals)
- `/consti-quiz` — Constitution quiz (multiple question types: radio, checkbox, short/long text)
- `/api/answers` — POST quiz answers (upsert pattern)
- `/api/get_gdrive_folder` — Create/get Google Drive folders
- `/api/upload` — Upload files to Google Drive

### Auth Flow

Supabase SSR OAuth with Google. Server hook (`hooks.server.ts`) creates a Supabase client per request with cookie management. Browser client uses `createBrowserClient()`. `safeGetSession()` helper for auth state. Layout's `onAuthStateChange` invalidates data on auth changes.

### Data Layer

- **Database**: Supabase PostgREST — tables include `sigsheet`, `constiquiz-sections`, `constiquiz-questions`, `constiquiz-options`, `constiquiz-answers`, `constiquiz-submissions`, `constiquiz-availability`, `profiles`, `whitelist`, `pic-folders`
- **File storage**: Google Drive API with JWT service account auth
- **Client state**: Svelte writable stores in `$lib/shared.ts` (`uuid`, `username`, `gdrive_folder_id`, `filledSigsheet`, `applicant_names_list`)
- **Data loading**: Parallel fetching with `Promise.all()` in `+layout.ts`, dependency tracking with `depends()`

### Key Files

- `src/hooks.server.ts` — Server hook creating Supabase client per request
- `src/lib/supabaseClient.js` — Browser-side Supabase client
- `src/lib/shared.ts` — Global Svelte stores
- `src/routes/+layout.ts` — Root data loader (auth, quiz data)
- `src/routes/consti-quiz/constiquiz-types.ts` — Quiz question type definitions (discriminated unions)

### Environment Variables

```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
PUBLIC_SUPABASE_SERVICE_KEY
PUBLIC_GOOGLE_SERVICE_EMAIL
PUBLIC_GOOGLE_PRIVATE_KEY
```

## Code Conventions

- **Svelte 5 runes**: Uses `$props()`, `$state()`, snippet types for component composition
- **TypeScript strict mode** with `noUncheckedIndexedAccess` and `noImplicitOverride`
- **Prettier**: 4-space indentation, 120 char width, single quotes, Tailwind class sorting plugin
- **Tailwind CSS**: Custom CSI brand colors defined in `tailwind.config.ts` (`csi-blue: #00C6D7`, `csi-black: #212121`, `csi-yellow: #F7CF2F`, plus committee colors)
- **ESLint**: No unused vars, no console (warning), prefer const

## Deployment

- Docker multi-stage build (Node.js Alpine), port 3000
- CI runs on PRs/push to main: install → format check → lint → build
- Deploy triggers on push to `production` branch → builds Docker image → pushes to GitHub Container Registry

# Admin Roles Implementation Plan

> **Scope:** Database, auth, and backend changes only. No frontend.
> **Goal:** Add an "admin" role so org leaders can view/check applicant data (quiz responses, sigsheet progress, profiles).

---

## Current State Summary

- **Auth:** Google OAuth → `@up.edu.ph` domain check → `whitelist` table check → session created. All users treated identically as applicants.
- **Database:** `profiles` table has no role column. No RLS policies on any table.
- **Backend:** Two API endpoints (`/api/get_gdrive_folder`, `/api/upload`) have no auth checks and use a browser-side Supabase client on the server. Other endpoints check `safeGetSession()` but have no role awareness.
- **Hooks:** `hooks.server.ts` has a commented-out `authGuard`. The `sequence()` only runs the `supabase` handle.
- **Service key:** `PUBLIC_SUPABASE_SERVICE_KEY` exists in CI env vars but is never imported in code. The `PUBLIC_` prefix is wrong — it would expose the key to the browser.

---

## Phase 1: Database Schema Changes

### 1.1 Add role to profiles

Run this migration in Supabase SQL Editor (or via Supabase CLI migration):

```sql
-- Create enum type for roles (extensible: add 'member' later with ALTER TYPE)
CREATE TYPE public.app_role AS ENUM ('applicant', 'admin');

-- Add role column — all existing users default to 'applicant'
ALTER TABLE public.profiles
    ADD COLUMN role public.app_role NOT NULL DEFAULT 'applicant';

-- Index for fast role lookups (used on every request in hooks)
CREATE INDEX idx_profiles_role ON public.profiles (role);
```

**Design decision:** Role on `profiles` directly (not a separate table) because it's a 1:1 relationship with two values. If multi-role is needed later, migrate to a join table then.

### 1.2 Seed admin users

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users
    WHERE email IN (
        'admin1@up.edu.ph',
        'admin2@up.edu.ph'
        -- Replace with actual admin emails
    )
);
```

Ensure these emails are also in the `whitelist` table:

```sql
INSERT INTO public.whitelist (email)
VALUES ('admin1@up.edu.ph'), ('admin2@up.edu.ph')
ON CONFLICT (email) DO NOTHING;
```

### 1.3 Verify

```sql
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role, u.email;
```

---

## Phase 2: Server-Side Auth Infrastructure

### 2.1 Rename service key env var

The service key must NOT have the `PUBLIC_` prefix — SvelteKit exposes `PUBLIC_` vars to the browser.

**`.env`:** Rename `PUBLIC_SUPABASE_SERVICE_KEY` → `SUPABASE_SERVICE_KEY`

**`.github/workflows/deploy.yml`:** Update all references:

```yaml
# Change these lines:
PUBLIC_SUPABASE_SERVICE_KEY: ${{ vars.PUBLIC_SUPABASE_SERVICE_KEY }}
# To:
SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

**`.github/workflows/ci.yml`:** Same rename. Also update the GitHub Actions repo settings to use the new variable name (or move to a secret since it's a sensitive key).

### 2.2 Create service-role Supabase client

**New file: `src/lib/server/supabaseAdmin.ts`**

```typescript
import { SUPABASE_SERVICE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS.
 * ONLY use in server-side code for admin operations.
 */
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

The `src/lib/server/` directory is a SvelteKit convention — files here can only be imported from server-side code (`+server.ts`, `+page.server.ts`, `hooks.server.ts`). This prevents accidental browser exposure.

### 2.3 Create auth helper utilities

**New file: `src/lib/server/auth.ts`**

```typescript
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export type AppRole = 'applicant' | 'admin';

/**
 * Requires authenticated user. Throws 401 if not logged in.
 */
export function requireAuth(event: RequestEvent) {
    const { user, session } = event.locals;
    if (!session || !user) {
        throw error(401, 'Authentication required');
    }
    return { user, session };
}

/**
 * Requires a specific role. Throws 401 if not authenticated, 403 if wrong role.
 */
export function requireRole(event: RequestEvent, role: AppRole) {
    const { user, session } = requireAuth(event);
    if (event.locals.userRole !== role) {
        throw error(403, 'Insufficient permissions');
    }
    return { user, session };
}

/**
 * Check if current user is admin. Does not throw.
 */
export function isAdmin(event: RequestEvent): boolean {
    return event.locals.userRole === 'admin';
}
```

---

## Phase 3: Auth Flow — Role Resolution in Hooks

### 3.1 Update TypeScript types

**File: `src/app.d.ts`**

```typescript
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';
import type { AppRole } from '$lib/server/auth';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient<Database>;
            safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
            session: Session | null;
            user: User | null;
            userRole: AppRole | null;
        }
        interface PageData {
            session: Session | null;
            userRole: AppRole | null;
        }
    }
}

export {};
```

### 3.2 Add authGuard to hooks

**File: `src/hooks.server.ts`**

Replace the commented-out `authGuard` and update the `sequence()` export:

```typescript
import { type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { AppRole } from '$lib/server/auth';

const supabase: Handle = ({ event, resolve }) => {
    // ... KEEP EXISTING CODE (lines 8-48) EXACTLY AS-IS ...
};

const authGuard: Handle = async ({ event, resolve }) => {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;
    event.locals.userRole = null;

    if (user) {
        const { data: profile } = await event.locals.supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        event.locals.userRole = (profile?.role as AppRole) ?? 'applicant';
    }

    return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
```

**What this does:** On every request, after the Supabase client is set up, fetch the user's role from `profiles` and attach it to `event.locals.userRole`. All downstream handlers (layout loads, API endpoints) can read `event.locals.userRole` without an extra DB query.

### 3.3 Pass role to page data

**File: `src/routes/+layout.server.ts`**

```typescript
export const load = async ({ locals: { safeGetSession, userRole }, cookies }) => {
    const { session } = await safeGetSession();
    return {
        session,
        cookies: cookies.getAll(),
        userRole: userRole ?? null,
    };
};
```

### 3.4 Login callback — no changes needed

Admins log in via the same Google OAuth flow. They must be in the `whitelist` table. Their role is determined from `profiles.role`, not the login flow.

### 3.5 Verify

1. Add `console.log('userRole:', event.locals.userRole)` temporarily in the `authGuard`
2. Log in as a seeded admin → should print `'admin'`
3. Log in as a regular applicant → should print `'applicant'`
4. Access any page without logging in → should print `null`

---

## Phase 4: Fix Existing Unprotected Endpoints

Two endpoints currently have no auth checks and use the browser Supabase client singleton on the server.

### 4.1 Fix `/api/get_gdrive_folder`

**File: `src/routes/api/get_gdrive_folder/+server.js`**

Changes:

1. Remove `import { supabase } from '$lib/supabaseClient';`
2. Add auth check using `locals.safeGetSession()` (or import `requireAuth` if converting to `.ts`)
3. Use `locals.supabase` instead of the browser singleton
4. Use `user.id` from auth instead of `uuid` from request body (prevents spoofing)

```javascript
// Before:
import { supabase } from '$lib/supabaseClient';
export async function POST({ request }) {
    const { uuid, username } = await request.json();
    // ... uses uuid from body

// After:
export async function POST({ request, locals }) {
    const { user } = await locals.safeGetSession();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const uuid = user.id; // Use authenticated user's ID
    const { username } = await request.json();
    // ... replace all `supabase.` calls with `locals.supabase.`
```

### 4.2 Fix `/api/upload`

**File: `src/routes/api/upload/+server.js`**

Same pattern:

1. Remove `import { supabase } from '../../../lib/supabaseClient';`
2. Add auth check
3. Use `locals.supabase` for DB operations
4. Use `user.id` instead of `formData.get('uuid')`

```javascript
// Before:
import { supabase } from '../../../lib/supabaseClient';
export async function POST({ request }) {
    const formData = await request.formData();
    const uuid = formData.get('uuid');

// After:
export async function POST({ request, locals }) {
    const { user } = await locals.safeGetSession();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const uuid = user.id;
    const formData = await request.formData();
    // ... replace all `supabase.` calls with `locals.supabase.`
```

### 4.3 Verify

- Call `POST /api/get_gdrive_folder` without a session cookie → expect 401
- Call `POST /api/upload` without a session cookie → expect 401
- Call both while logged in → should work as before

---

## Phase 5: Admin API Endpoints

All new endpoints go under `src/routes/api/admin/`. Every endpoint:

- Calls `requireRole(event, 'admin')` as the first line
- Uses `supabaseAdmin` (service-role client) to bypass RLS for cross-user reads
- Returns JSON

### 5.1 List all applicant profiles

**New file: `src/routes/api/admin/applicants/+server.ts`**

```typescript
import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export async function GET(event) {
    requireRole(event, 'admin');

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, username, full_name, avatar_url, role')
        .eq('role', 'applicant');

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json({ applicants: data });
}
```

### 5.2 All quiz submissions with scores

**New file: `src/routes/api/admin/quiz-results/+server.ts`**

```typescript
import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export async function GET(event) {
    requireRole(event, 'admin');

    // Get all submissions with profile info
    const { data: submissions, error: subError } = await supabaseAdmin.from('constiquiz-submissions').select(`
            submission_id,
            submitted_at,
            user_id,
            profiles!inner ( username, full_name )
        `);

    if (subError) {
        return json({ error: subError.message }, { status: 500 });
    }

    // Get total scores per submitted user
    const userIds = submissions?.map(s => s.user_id).filter(Boolean) ?? [];

    if (userIds.length === 0) {
        return json({ results: [] });
    }

    const { data: answers, error: ansError } = await supabaseAdmin
        .from('constiquiz-answers')
        .select('user_id, points')
        .in('user_id', userIds);

    if (ansError) {
        return json({ error: ansError.message }, { status: 500 });
    }

    // Aggregate scores
    const scoreMap: Record<string, number> = {};
    for (const a of answers ?? []) {
        scoreMap[a.user_id] = (scoreMap[a.user_id] ?? 0) + (a.points ?? 0);
    }

    const results = submissions?.map(s => ({
        submission_id: s.submission_id,
        submitted_at: s.submitted_at,
        user_id: s.user_id,
        profile: s.profiles,
        total_score: scoreMap[s.user_id] ?? 0,
    }));

    return json({ results });
}
```

### 5.3 Single applicant's detailed quiz answers

**New file: `src/routes/api/admin/quiz-results/[userId]/+server.ts`**

```typescript
import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export async function GET(event) {
    requireRole(event, 'admin');
    const userId = event.params.userId;

    const [answersRes, profileRes, submissionRes] = await Promise.all([
        supabaseAdmin
            .from('constiquiz-answers')
            .select(
                `
                answer_id, question_id, answer_text, option_id, points, is_checked,
                question:constiquiz-questions!inner (
                    title, point_value, type,
                    section:constiquiz-sections!inner ( title )
                )
            `,
            )
            .eq('user_id', userId),
        supabaseAdmin.from('profiles').select('id, username, full_name').eq('id', userId).single(),
        supabaseAdmin.from('constiquiz-submissions').select('submitted_at').eq('user_id', userId).maybeSingle(),
    ]);

    if (answersRes.error) {
        return json({ error: answersRes.error.message }, { status: 500 });
    }

    return json({
        profile: profileRes.data,
        submitted_at: submissionRes.data?.submitted_at ?? null,
        answers: answersRes.data,
    });
}
```

### 5.4 All applicants' sigsheet progress

**New file: `src/routes/api/admin/sigsheet-progress/+server.ts`**

```typescript
import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export async function GET(event) {
    requireRole(event, 'admin');

    // Get total member count for progress calculation
    const { count: totalMembers } = await supabaseAdmin.from('members').select('*', { count: 'exact', head: true });

    const { data, error } = await supabaseAdmin.from('sigsheet').select(`
            sig_id, signed_at, question, answer, member_id, member_name,
            applicant:profiles!inner ( id, username, full_name )
        `);

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    // Group by applicant
    const byApplicant: Record<string, { profile: any; signatures: any[]; count: number }> = {};
    for (const row of data ?? []) {
        const key = row.applicant.id;
        if (!byApplicant[key]) {
            byApplicant[key] = { profile: row.applicant, signatures: [], count: 0 };
        }
        byApplicant[key].signatures.push({
            sig_id: row.sig_id,
            signed_at: row.signed_at,
            member_id: row.member_id,
            member_name: row.member_name,
        });
        byApplicant[key].count++;
    }

    return json({
        total_members: totalMembers,
        progress: Object.values(byApplicant),
    });
}
```

### Endpoint summary

| Method | Path                               | Purpose                                    |
| ------ | ---------------------------------- | ------------------------------------------ |
| GET    | `/api/admin/applicants`            | List all applicant profiles                |
| GET    | `/api/admin/quiz-results`          | All submissions with total scores          |
| GET    | `/api/admin/quiz-results/[userId]` | Single applicant's detailed answers        |
| GET    | `/api/admin/sigsheet-progress`     | All sigsheet progress grouped by applicant |

### Verify each endpoint

For each: unauthenticated → 401, applicant → 403, admin → 200 with data.

---

## Phase 6: Row Level Security (RLS)

RLS is defense-in-depth. Even if application code has a bug, the database enforces access rules. The `supabaseAdmin` client (service role) bypasses RLS by design — admin endpoints still work.

### 6.1 Create helper function

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid()
$$;
```

`SECURITY DEFINER` lets it read `profiles` even when RLS is enabled. `STABLE` allows caching within a transaction.

### 6.2 Enable RLS on all tables

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."constiquiz-availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigsheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pic-folders" ENABLE ROW LEVEL SECURITY;
```

> **Note:** Table names with hyphens must be double-quoted in SQL.

### 6.3 Policies — User-scoped tables

**profiles:**

```sql
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.get_user_role() = 'admin');
```

**constiquiz-answers:**

```sql
CREATE POLICY "Users can view own answers"
    ON public."constiquiz-answers" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
    ON public."constiquiz-answers" FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
    ON public."constiquiz-answers" FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all answers"
    ON public."constiquiz-answers" FOR SELECT
    USING (public.get_user_role() = 'admin');
```

**constiquiz-submissions:**

```sql
CREATE POLICY "Users can view own submissions"
    ON public."constiquiz-submissions" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
    ON public."constiquiz-submissions" FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
    ON public."constiquiz-submissions" FOR SELECT
    USING (public.get_user_role() = 'admin');
```

**sigsheet:**

```sql
CREATE POLICY "Users can view own sigsheet"
    ON public.sigsheet FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can insert own sigsheet"
    ON public.sigsheet FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Admins can view all sigsheet"
    ON public.sigsheet FOR SELECT
    USING (public.get_user_role() = 'admin');
```

**pic-folders:**

```sql
CREATE POLICY "Users can view own folder"
    ON public."pic-folders" FOR SELECT
    USING (auth.uid() = applicant_uuid);

CREATE POLICY "Users can insert own folder"
    ON public."pic-folders" FOR INSERT
    WITH CHECK (auth.uid() = applicant_uuid);

CREATE POLICY "Admins can view all folders"
    ON public."pic-folders" FOR SELECT
    USING (public.get_user_role() = 'admin');
```

### 6.4 Policies — Read-only reference tables

These are shared data all authenticated users can read:

```sql
CREATE POLICY "Authenticated can view sections"
    ON public."constiquiz-sections" FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view questions"
    ON public."constiquiz-questions" FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view options"
    ON public."constiquiz-options" FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view availability"
    ON public."constiquiz-availability" FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view members"
    ON public.members FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can check whitelist"
    ON public.whitelist FOR SELECT
    USING (auth.uid() IS NOT NULL);
```

### 6.5 Verify RLS

1. Open browser DevTools as an applicant. Try querying another user's answers via the Supabase JS client → should return empty
2. Admin API endpoints (which use `supabaseAdmin` / service role) should still return all data
3. Applicant flow (quiz, sigsheet, upload) should still work normally — own data is accessible

---

## File Change Summary

### New files

| File                                                    | Purpose                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/server/auth.ts`                                | `requireAuth()`, `requireRole()`, `isAdmin()` helpers + `AppRole` type |
| `src/lib/server/supabaseAdmin.ts`                       | Service-role Supabase client (bypasses RLS)                            |
| `src/routes/api/admin/applicants/+server.ts`            | List applicant profiles                                                |
| `src/routes/api/admin/quiz-results/+server.ts`          | All quiz submissions + scores                                          |
| `src/routes/api/admin/quiz-results/[userId]/+server.ts` | Single applicant quiz detail                                           |
| `src/routes/api/admin/sigsheet-progress/+server.ts`     | All sigsheet progress                                                  |

### Modified files

| File                                          | Change                                                          |
| --------------------------------------------- | --------------------------------------------------------------- |
| `src/app.d.ts`                                | Add `userRole: AppRole \| null` to Locals and PageData          |
| `src/hooks.server.ts`                         | Add `authGuard` handle that fetches role, add to `sequence()`   |
| `src/routes/+layout.server.ts`                | Pass `userRole` in returned data                                |
| `src/routes/api/get_gdrive_folder/+server.js` | Add auth check, use `locals.supabase` instead of browser client |
| `src/routes/api/upload/+server.js`            | Add auth check, use `locals.supabase` instead of browser client |
| `.env`                                        | Rename `PUBLIC_SUPABASE_SERVICE_KEY` → `SUPABASE_SERVICE_KEY`   |
| `.github/workflows/deploy.yml`                | Update env var name                                             |
| `.github/workflows/ci.yml`                    | Update env var name                                             |

### Unchanged files

- `src/routes/login/callback/+server.js` — login flow stays the same
- `src/routes/+layout.ts` — frontend concern
- `src/lib/supabaseClient.js` — browser client stays (used by frontend)
- All Svelte components — frontend concern

---

## Implementation Order

Phases **must** be done in order due to dependencies:

```
Phase 1 (DB schema)
    ↓ role column must exist
Phase 2 (auth infra)
    ↓ helpers + admin client must exist
Phase 3 (hooks + types)
    ↓ userRole must be on event.locals
Phase 4 (fix existing endpoints) ←── can be parallel with Phase 5
Phase 5 (admin endpoints)       ←── can be parallel with Phase 4
    ↓
Phase 6 (RLS policies)
```

Phase 4 and 5 can be done in parallel by different team members since they touch different files.

---

## Future: Adding "member" Role

When the time comes:

1. `ALTER TYPE public.app_role ADD VALUE 'member';`
2. Add member-specific RLS policies
3. Add endpoints under `/api/member/`
4. The `requireRole()` and `isAdmin()` pattern extends naturally — add `isMember()` etc.

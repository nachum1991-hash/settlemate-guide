# Pre-launch Auth/Email Flow Audit

Read-only trace of the current code. No edits proposed in this plan beyond a punch-list at the end.

## 1. Signup → confirmation

**Files:** `src/pages/Auth.tsx` (`handleSignUp`, lines ~37–69)

- `supabase.auth.signUp` is called with `options.emailRedirectTo: ${window.location.origin}/onboarding` and `data.full_name`.
- `window.location.origin` resolves to whatever host the browser is on when the user signs up — so on `id-preview--…lovable.app` it bakes the preview host into the email, on `settlemate-guide.lovable.app` it bakes that, and on a future custom domain it would bake that. It is **not** read from a config/env constant.
- After signup, if `data.session` is null the UI sets `showConfirmation=true` and `confirmedEmail=email`, rendering a "Check your inbox" card with the user's email, a Resend button, and a "← Back to sign in" link.

**Status: works**, but redirect host is "whatever the browser is on" rather than a single configured site URL. That's fine in practice for Lovable (origin == published host) **as long as users only sign up from the published/custom domain**. If anyone signs up from the preview URL, the confirmation link will send them back to the preview host. There is no canonical `SITE_URL` constant.

## 2. Resend confirmation

**Files:** `src/pages/Auth.tsx` (`handleResend`, `resendCooldown` effect)

- Button on the confirmation screen calls `supabase.auth.resend({ type: 'signup', email: confirmedEmail })`.
- Client-side rate limit: after a successful resend, `resendCooldown` is set to 60 and a `setInterval` decrements it each second; the button is `disabled` and shows `Resend in {n}s…` while >0.
- Server-side rate limiting is whatever Supabase Auth enforces by default (not customised in `supabase/config.toml`).

**Status: works.** Minor: cooldown is only client state — refreshing the page resets it. Acceptable pre-launch.

## 3. Confirmation link

**Files:** `src/App.tsx` routes, `src/contexts/AuthContext.tsx`, `src/components/OnboardingGate.tsx` (not re-read this turn but referenced by routes).

- The link in the email points at `${origin}/onboarding` with the Supabase auth tokens in the URL hash.
- `/onboarding` is wrapped in `<OnboardingGate>`. The Supabase client (`detectSessionInUrl` default = true) parses the hash, `AuthContext.onAuthStateChange` fires `SIGNED_IN`, and the gate then allows the page to render.
- New users land on `/onboarding` as intended (they haven't completed onboarding yet, so the gate keeps them there rather than bouncing to `/dashboard`).

**Status: works** — assuming `OnboardingGate` waits for `loading=false` before redirecting (it does in earlier audits; worth one more eyeball if you want me to re-read it in build mode).

## 4. Forgot password

**Files:** `src/pages/Auth.tsx` (`handleForgotPassword`, sign-in tab)

- "Forgot password?" button under the sign-in password field. If `email` is empty it toasts "Enter your email address first".
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${window.location.origin}/reset-password })`.
- Same caveat as signup: `redirectTo` is derived from `window.location.origin`, not a configured site URL.

**Status: works**, same hardcoded-to-current-origin caveat.

## 5. Reset password

**Files:** `src/pages/ResetPassword.tsx`, route in `src/App.tsx` (`/reset-password`, public).

- On mount, registers `onAuthStateChange`; when `PASSWORD_RECOVERY` or `SIGNED_IN` fires, sets `validSession=true`. Also calls `getSession()` as a fallback so a refresh with an active recovery session still works.
- Renders new/confirm password form → `supabase.auth.updateUser({ password })` → on success: toast "Password updated — please sign in", `supabase.auth.signOut()`, then `navigate('/auth?mode=signin')`. So the user is **not** auto-logged in; they sign in fresh. That matches the spec.
- If no recovery/sign-in event arrives and there's no session, shows "This link is invalid or has expired" with a link back to `/auth`.

**Status: works.** One nit: `validSession` starts as `null` and the page renders the form during that brief window — fine since `updateUser` will fail loudly on no session. Not a launch blocker.

## Redirect URLs hardcoded to "current origin" (the main thing you asked to catch)

`rg` across `src/` and `supabase/` shows exactly two redirect URL sites, both using `window.location.origin`:

- `src/pages/Auth.tsx:46` — `emailRedirectTo: \`${window.location.origin}/onboarding\``
- `src/pages/Auth.tsx:104` — `redirectTo: \`${window.location.origin}/reset-password\``

Neither reads from an env var or a shared constant. There is **no** `VITE_SITE_URL`, `SITE_URL`, or domain config in the repo. So today the email links will bind to whichever host the user happens to be on when they hit Sign Up / Forgot Password.

What this means at launch:
- If everyone signs up from `settlemate-guide.lovable.app` (or a future custom domain), they get correct links — good.
- If anyone signs up from the preview URL (e.g. you sharing a preview link, or a stray bookmark), the link goes back to the preview URL. Not catastrophic, but it's a footgun.
- The bigger gotcha is the **Supabase Auth allow-list**: every host you want in `emailRedirectTo` / `redirectTo` must be in the project's Auth → URL Configuration "Redirect URLs" list, otherwise Supabase rewrites to the Site URL. Worth verifying you've added the published domain (and any future custom domain) there.

## Punch-list (no code changes in this plan)

1. Introduce a single `SITE_URL` source of truth (env var `VITE_PUBLIC_SITE_URL` or a `src/config/site.ts` constant) and use it in both `emailRedirectTo` and `resetPasswordForEmail.redirectTo` instead of `window.location.origin`. Falls back to `window.location.origin` only in dev.
2. When you wire a custom domain, set that env var to the canonical host and add it (plus `/onboarding`, `/reset-password`) to Supabase Auth Redirect URLs. Also set the Supabase **Site URL** to the same canonical host.
3. Optional polish: persist resend cooldown across refresh (localStorage timestamp) — not a launch blocker.
4. Optional polish: tighten `ResetPassword` initial render to a brief loading state until `validSession` resolves, instead of showing the form immediately.
5. Confirm `OnboardingGate` doesn't redirect away from `/onboarding` while `AuthContext.loading === true` (quick re-read in build mode).
6. Decide whether you want branded auth emails via `scaffold_auth_email_templates`; if yes, that's an additional setup step before launch.

No files would be touched as part of this audit.
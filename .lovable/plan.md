## Goals

1. **Add a one-time onboarding flow** that captures origin country, university, and planned arrival date — stored on the user's profile so they never have to re-enter it.
2. **Wire that profile data** into the rest of the app (Visa Wizard, Floating Chat country community, Pre-Departure dates, City defaults) so the experience is personalized automatically.
3. **Fix the polish/launch blockers** identified in the readiness review.

---

## 1. Onboarding flow

### Database (migration)
Extend `profiles` with:
- `origin_country` text
- `university` text
- `arrival_date` date
- `onboarding_completed` boolean default false

Update the `handle_new_user` trigger to default `onboarding_completed = false`. No RLS changes (existing self-only policies still apply).

### New page: `/onboarding`
3-step wizard (with progress bar):
1. **Where are you coming from?** — searchable country dropdown (reuse `countries` list from `VisaWizard.tsx`)
2. **Which university?** — dropdown (Politecnico di Milano, Università di Milano, Bocconi, Sapienza Roma, Politecnico Torino, Università di Pavia, Other → free text) + auto-suggests a default city
3. **When do you plan to arrive in Italy?** — date picker (shadcn Calendar)

On submit: update `profiles` row, set `onboarding_completed = true`, navigate to `/`.

### Routing logic
- `ProtectedRoute` (and a new wrapper used on `/`) checks `profiles.onboarding_completed`. If false → redirect to `/onboarding`.
- After signup in `Auth.tsx`, redirect to `/onboarding` instead of `/`.
- Onboarding page itself is auth-gated but bypasses the completion check.

### Use the captured data everywhere
- **VisaWizard**: prefill `formData.country` and `formData.university` from profile; hide the country dropdown (show "Editing for 🇮🇳 India — change" link instead).
- **FloatingChat**: read country from profile instead of `localStorage` (`getStoredCountry` becomes a hook `useUserCountry()` backed by profile, with localStorage fallback for anonymous users).
- **CityContext**: seed default city from university choice (polimi→milano, sapienza→roma, etc.) on first load.
- **PreDepartureChecklist**: use `arrival_date` to compute countdown / suggested deadlines.

---

## 2. Launch-blocker fixes

- **Auth persistence**: switch `AuthContext` from `sessionStorage` back to `localStorage` so users stay signed in across browser restarts (current behavior forces re-login every tab, which conflicts with the new onboarding being a one-time event). Remove the localStorage-clearing effect.
- **Email confirmation**: keep email verification ON (already correct), but add a clear "check your inbox" toast/screen after signup and a resend-email button.
- **SEO**: update `index.html` with proper `<title>` (≤60 chars), meta description (≤160 chars), Open Graph tags, canonical link, and a single H1 verified on `/`.
- **404 page**: replace the bare `NotFound` with a branded one that links back to `/` and the 3 phases.
- **PWA install prompt**: only show after onboarding is complete (avoid interrupting first-run).
- **Edit-profile entry point**: small "Settings" item in the `Navbar` dropdown that opens an inline dialog to change country / university / arrival date later.

---

## 3. Out of scope (call out, don't build)

- Forgot/reset password page (separate task)
- Admin tooling for moderating chat
- Translating UI to other languages
- Real-time message moderation / abuse reporting

---

## Technical notes

- Files added: `src/pages/Onboarding.tsx`, `src/components/OnboardingGate.tsx`, `src/hooks/useProfile.ts`, `src/components/EditProfileDialog.tsx`.
- Files edited: `src/App.tsx` (route + gate), `src/pages/Auth.tsx` (post-signup redirect), `src/contexts/AuthContext.tsx` (storage swap), `src/pages/VisaWizard.tsx` (prefill from profile), `src/components/FloatingChat.tsx` (profile-backed country), `src/components/Navbar.tsx` (settings entry), `src/contexts/CityContext.tsx` (seed from profile), `src/pages/PreDepartureChecklist.tsx` (use arrival_date), `index.html` (SEO), `src/pages/NotFound.tsx` (branding).
- Migration: 1 SQL migration to add 4 columns + update trigger.
- No new dependencies needed (uses existing shadcn Calendar/Select/Dialog).

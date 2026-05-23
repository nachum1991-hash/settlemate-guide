
# SettleMate Pre-Launch Fixes

Implementation will go in three waves: P0 launch blockers, P1 broken functionality, P2 polish. After each wave I'll smoke-test in the preview.

## P0 — Launch blockers

### 1. Public landing page at `/`
- Rename current `Index.tsx` → `Dashboard.tsx` (stays gated by `OnboardingGate`).
- Create new `pages/Landing.tsx`: hero, 3-phase explainer (Visa → Arrival → Social), feature highlights, "Sign Up" / "Log In" CTAs, FAQ, footer.
- In `App.tsx`: route `/` → if `user` then `<Dashboard>` (via `OnboardingGate`), else `<Landing>`. Implement with a small `RootRoute` wrapper that reads `useAuth()`.
- Landing uses public `Navbar` variant (Sign In / Sign Up) and no auth required.

### 2. Global footer + legal pages
- New `components/Footer.tsx` rendered on every page (landing, dashboard, all gated pages). Sections: About blurb, Quick links, Legal (Privacy / Terms), Contact (`support@settlemate.app` placeholder — will confirm with user).
- New pages `/privacy` (GDPR-aware Privacy Policy: data collected — email, name, country, university, uploaded docs in private storage, chat messages; retention; user rights; contact) and `/terms` (informational service, no legal advice, account rules, IP, liability disclaimer).
- New `/about` page (brief mission + team placeholder).
- Footer also shown on `/auth`, `/onboarding`, `/install`.
- Include cookie/data-use note (no third-party analytics currently — note essential cookies only).

### 3. Remove Lovable badge
- Call `publish_settings--set_badge_visibility { hide_badge: true }` (requires user approval; pro plan).

### 4. Custom domain
- Cannot purchase/configure automatically. Will provide instructions and the `<presentation-open-publish>` action so the user can connect `settlemate.app` from Project Settings → Domains.

### 5. Disclaimer
- Add a compact `<Disclaimer>` component shown (a) inside the footer, (b) as a banner at the top of `/visa-wizard`, `/pre-departure`, `/arrival-italy`. Text: "SettleMate provides informational guidance only and is not official legal or immigration advice. Rules, fees, and processing times change — always confirm with official Italian government sources and your local Italian embassy/consulate."

## P1 — Broken functionality

### 6. "Watch Introduction" button
- `IntroVideoModal` currently embeds a Rickroll. Replace with a real placeholder or remove. Plan: remove the button until a real video URL is provided (ask user later). Keep modal code but don't render the trigger.

### 7. Bottom "Start Your Journey" CTA
- In Dashboard, change handler to `navigate('/visa-wizard')` (or `/home-country` if onboarded user hasn't started Phase 1).

### 8. "Watch Orientation Video" on `/home-country`
- Inspect and remove that list item (or hide it) until a real video URL exists.

### 9. Visa Wizard step stepper
- Track `maxStepReached` in state (also persisted to `sessionStorage` keyed by user id to fix the "reverts to Overview" bug — likely caused by `useEffect` prefill resetting `currentStep`).
- Make step indicators buttons: clickable if `step <= maxStepReached`, otherwise `disabled` with `cursor-not-allowed opacity-50`.
- Audit the `useEffect` that prefills profile data — ensure it doesn't reset `currentStep`. Use a `hasPrefilled` ref guard.

### 10. Wizard validation
- Personal Info step was removed in last turn, but re-audit: ensure each step's `canProceed` validates required fields. Country step: country required. Documents step: at least required docs checked (or allow skip with warning). Show inline error messages via `react-hook-form` + `zod`, or lightweight manual validation with toast + field-level error text.
- Note: item 10 references Personal Info step which no longer exists. Will still tighten validation on remaining steps and remove any stale reference.

### 11. Document checklist UI
- Audit `BureaucracyDetail.tsx` and the Documents step in `VisaWizard.tsx`. Replace dual circular controls with a single `Checkbox` ("Mark as ready") + chevron for expand.
- Wire "Uploaded" badge to actually appear only when a file exists in `useDocumentUploads` AND counter logic counts the same source of truth. Single derived state: `isReady = markedReady || hasUpload` (or strictly `markedReady` — confirm with user).

### 12. Verify PDF downloads
- Test `generatePDF` on Dashboard, `/pre-departure`, `/arrival-italy`. Fix any that throw or don't trigger download.

## P2 — Content & polish

### 13. Events dates on `/social-integration`
- Replace hardcoded "September 2024" with relative phrasing ("Welcome week each semester", "Weekly aperitivos", "Monthly meetups").

### 14. Expand `/arrival-italy`
- This contradicts the memory rule "Phase 2 strictly focuses on Codice Fiscale & Residence Permit". I will ask the user before adding SIM/bank/SSN/transport/anagrafica. **Will flag in chat after plan approval.**

### 15. Empty Community Chat
- Seed `/social-integration` Community tab with 3-4 pinned welcome messages from a "SettleMate Team" system author, OR hide the tab if message count = 0. Default: seed pinned messages.

### 16. Verify official figures
- Update text to add "(indicative — verify with official sources)" next to €506/month, €116, €30,000, 4-12 weeks. Quick web-check current values; if outdated, update.

### 17. Homepage roadmap cards
- Add `cursor-pointer`, hover lift, "View phase →" affordance to `PhaseCard`.

### 18. Floating chat mobile overlap
- In `FloatingChat.tsx`, raise `bottom` offset on mobile (`bottom-24 md:bottom-6`) and ensure `z-index` < modal but > content. Add safe-area padding.

### 19. Post-onboarding next step
- After `Onboarding.tsx` completes, `navigate('/visa-wizard')` instead of `/`. Or land on Dashboard but auto-scroll to a "Recommended next: Start Visa Wizard" highlighted card.

## Verification

After each wave: load `/` logged-out and logged-in, walk through wizard steps, click every CTA, generate each PDF, resize preview to 375px to check chat overlap.

## Open questions (will ask after approval)

1. Support email address for footer?
2. Item 14 — expand Phase 2 with new docs, or keep restricted per existing memory?
3. Doc "ready" semantics — checkbox only, or auto-mark when uploaded?
4. Provide a real intro video URL, or keep button removed?

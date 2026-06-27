## Goal

You're right — when I removed the "Personal Information" step earlier, I also removed the page that explained the visa journey tailored to the user's specific country (embassy, processing time, apostille, payment method, VFS/appointment links). I'll restore that as a dedicated step, but **without** asking the user to pick a country again — the country comes from their onboarding profile.

## New wizard structure (4 steps)

```
Step 0: Overview              (general D-Visa info — unchanged)
Step 1: Your Country Journey  (NEW — restored, read-only, from profile)
Step 2: Documents             (current Step 1)
Step 3: Timeline              (current Step 2)
```

The stepper, progress bar, and persisted `currentStep` will be updated to 4 steps.

## Step 1 — "Your Country Journey" content

Pulled from the existing `countries` array using `profile.origin_country`. No country selector — just a banner showing the detected country with a "Not correct? Update your profile" link to the EditProfileDialog.

For the user's country, render:

- **Header** — "Your visa journey from {Country} 🇽🇽" + processing time badge (e.g. "4–6 weeks")
- **Italian Embassy** card — link to `embassyUrl` (official embassy site)
- **Appointment booking** card — link to `vfsUrl` (if exists) and `appointmentUrl` (Prenot@Mi or VFS)
- **Apostille requirements** card — `apostilleInfo` text
- **Visa fee payment** card — `paymentMethod` text + €116 reminder
- **Passport renewal** card — link to `passportRenewalUrl` (if exists), with the "renew first if close to expiry" reminder
- **What's next** CTA — "Continue to documents" button → Step 2

Fallback: if `profile.origin_country` is missing or doesn't match the supported list, show a friendly card pointing to the generic `esteri.it` diplomatic network and a button to set the country in the profile.

## Other changes

- `totalSteps` → 4, stepper labels updated to `["Overview", "Your Country", "Documents", "Timeline"]`.
- `sessionStorage` step clamp updated from `<= 2` to `<= 3`.
- Step 0 "Start Application Wizard" button advances to the new Country Journey step.
- The country-specific links already shown inside Document cards (passport, embassy-appointment, fee, financial) stay as-is — they keep working off `profile.origin_country` via the existing `setStoredCountry` effect.
- No DB changes, no new packages.

## Files touched

- `src/pages/VisaWizard.tsx` — add Step 1 block, renumber Documents/Timeline, update stepper + totals.

Nothing else changes — Documents, Timeline, FAQ/Chat, FloatingChat, and "Mark as Ready" persistence all stay identical.
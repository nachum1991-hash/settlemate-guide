Remove the VFS link for Israel — Israeli applicants apply directly through the Italian Embassy (Prenot@Mi), not VFS.

## Change

In `src/pages/VisaWizard.tsx`, in the `countries` array, set Israel's `vfsUrl` from `"https://visa.vfsglobal.com/isr/en/ita"` to `null`.

## Effect

- Step 1 "Your Country Journey" → the "Book your appointment" card will only show the direct Prenot@Mi appointment link (the existing `appointmentUrl`), no VFS button.
- Step 2 Documents → the embassy-appointment country-specific links will skip VFS for Israel.

No other countries are affected.
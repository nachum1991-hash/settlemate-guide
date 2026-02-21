

# Align Arrival Phase Document Checklist with Visa Phase Style

## Overview
Update the document cards in the Arrival Phase (BureaucracyDetail) to match the visual style used in the Visa Wizard's document checklist (Step 3).

## Key Style Differences to Fix

| Element | Current Arrival Style | Target (Visa Style) |
|---|---|---|
| Card wrapper | Custom `rounded-xl border` div | `Card` component with success/ring states |
| Document image | Small fixed 14x14/16x16 | Full-width on mobile, 16x16 on desktop |
| Ready indicator | Pill badge in header | Checkbox + status icon (CheckCircle2/Circle) |
| "Required" badge | Not shown | Red "Required" pill |
| Expanded content width | Full width | Constrained with `max-w-xl mx-auto` |
| Close mechanism | Dedicated "Close" button at bottom | Click header to toggle (no separate close button) |
| Header layout | Single row with chevron | Image above on mobile, beside on desktop; checkbox + chevron + status icon |

## Technical Changes

### 1. Update `DocumentCard` in `src/components/BureaucracyDetail.tsx`
- Replace the custom div wrapper with the `Card` component, adding conditional `bg-success/5 border-success/30` when ready and `ring-2 ring-primary/20` when expanded
- Change document image to be full-width (h-40) on mobile, 16x16 on desktop -- matching the visa wizard layout
- Replace the "Ready" pill and "Mark as Ready" button with a checkbox (same `Checkbox` component from the visa wizard) plus a `CheckCircle2`/`Circle` status icon
- Add a red "Required" pill badge (all arrival documents are required)
- Wrap expanded content in `max-w-xl mx-auto` for centered readability
- Remove the standalone "Close" button at the bottom -- toggling is handled by clicking the header
- Keep all existing content sections (Key Info, Acceptance Rules, Common Mistakes, etc.) as they already match the visa wizard's style

### 2. No data changes needed
The `ArrivalDocument` interface and data in `arrivalDocuments.ts` already have the same fields (keyInfo, acceptanceRules, commonMistakes, tips, etc.) so no data restructuring is required.


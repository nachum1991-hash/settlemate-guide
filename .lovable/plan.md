
# Payment Gate Modal for Premium Phases

## Overview
Create a UI-only payment modal that appears when users attempt to access the **Arrival in Italy** (Phase 2) or **Social Integration** (Phase 3) pages. The modal will display the subscription cost and benefits without actual payment processing.

## What You'll Get

When trying to enter Phase 2 or Phase 3, users will see a popup explaining:
- **Cost**: 20 EUR per year
- **Benefits**:
  - Complete arrival guide (bureaucracy steps, documents, timelines)
  - Verified service providers (SIM cards, banks, accommodation)
  - City-specific community chats

The modal will include a "Subscribe Now" button (placeholder for future payment integration) and a "Maybe Later" option to close.

---

## Technical Implementation

### 1. Create Payment Modal Component

**New file**: `src/components/PaymentModal.tsx`

A reusable dialog component featuring:
- Attractive header with lock/crown icon
- Price display (20 EUR/year)
- Benefits list with checkmarks:
  - Step-by-step arrival guide
  - Trusted service providers  
  - Community chat access
- Two buttons:
  - **Subscribe Now** - placeholder (shows toast for now)
  - **Maybe Later** - closes modal and returns to homepage

### 2. Create Premium Route Wrapper

**New file**: `src/components/PremiumRoute.tsx`

A wrapper component that:
- Wraps the existing `ProtectedRoute` (keeps auth requirement)
- Checks if user has premium access (for now, always shows modal)
- Displays `PaymentModal` when premium access is not detected
- Passes through to children when access is granted

### 3. Update App Router

**File**: `src/App.tsx`

Replace `ProtectedRoute` with `PremiumRoute` for:
- `/arrival-italy` route
- `/social-integration` route

Phase 1 (`/home-country`) remains free with just `ProtectedRoute`.

---

## User Flow

```text
User clicks Phase 2 or Phase 3
          |
          v
    Is user logged in?
      /         \
    No           Yes
     |            |
     v            v
  Go to       Show Payment
  /auth         Modal
                  |
          +-------+-------+
          |               |
    Subscribe Now    Maybe Later
          |               |
          v               v
    (Toast shown)   Navigate to
    "Coming soon"    homepage
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/PaymentModal.tsx` | Create - Modal with pricing and benefits |
| `src/components/PremiumRoute.tsx` | Create - Route wrapper with payment gate |
| `src/App.tsx` | Modify - Use PremiumRoute for Phase 2 & 3 |

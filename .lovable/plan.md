

# Remove Registration Requirement

## Overview
Make all pages accessible without needing to sign up or log in. Users can browse the full app freely.

## Changes

### 1. Remove ProtectedRoute wrappers (src/App.tsx)
Remove the `ProtectedRoute` wrapper from all routes so every page loads directly without an auth check.

### 2. Make hooks and components handle anonymous users
Several hooks and components use `useAuth()` to get the current user. They need to gracefully handle the case where `user` is `null`:

- **`src/hooks/useUserProgress.ts`** -- Skip database calls when no user; progress won't persist for anonymous users
- **`src/hooks/useDocumentUploads.ts`** -- Skip upload/fetch when no user; document uploads require auth
- **`src/components/TaskChat.tsx`** -- Show a "sign in to chat" message instead of the chat input when not logged in
- **`src/components/MessageReactions.tsx`** -- Disable reactions for anonymous users
- **`src/components/BureaucracyDetail.tsx`** -- Hide upload sections for anonymous users
- **`src/pages/VisaWizard.tsx`** -- Skip database persistence when no user

### 3. Update Navbar (src/components/Navbar.tsx)
Keep the Sign In button visible for anonymous users so they can optionally log in (e.g., to save progress or use chat).

### 4. Update Index page (src/pages/Index.tsx)
Remove the auth check from "Start Your Journey" -- always navigate directly to `/home-country` instead of redirecting to `/auth`.

### 5. Keep Auth infrastructure
The `AuthProvider`, `Auth` page, and `ProtectedRoute` component will remain in the codebase. Users can still optionally sign in to unlock features like progress saving, document uploads, and community chat.

## What stays locked behind login
- Saving progress to the cloud
- Document uploads
- Posting in community chats
- Message reactions

Everything else (reading guides, browsing steps, viewing FAQs) will be fully open.


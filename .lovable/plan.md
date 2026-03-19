

# Generate Complete Project Documentation for NotebookLM

I've read every single file in the project. I'll generate a comprehensive markdown document covering every detail -- architecture, routes, components, data, database schema, edge functions, design system, and all content -- and save it to `/mnt/documents/` for you to download.

## What the document will contain

1. **Project Overview** - Name, purpose, tech stack, dependencies
2. **Architecture** - Provider hierarchy, routing, navigation model, three-phase journey structure
3. **Design System** - Complete CSS variables (light/dark), color tokens, typography, shadows, Tailwind config
4. **All Routes** - Every route with full component logic described
5. **All Pages** - Complete content and behavior for Index, Auth, HomeCountry, VisaWizard (all 5 steps with all 8 documents and country data for 8 countries), PreDepartureChecklist (all 14 items with subtasks), ArrivalItaly, SocialIntegration (all 4 tabs with all data), Install, NotFound
6. **All Components** - Every component with props, behavior, and rendering logic: Navbar, PhaseCard, BureaucracyTimeline (2 steps with full city-specific details), BureaucracyDetail (with DocumentCard), TaskChat, TaskFAQ, FloatingChat, DocumentUpload, MessageReactions, CitySelector, IntroVideoModal, InstallPrompt, ProtectedRoute
7. **All Data Files** - Complete arrivalDocuments.ts (codiceFiscaleDocuments + residencePermitDocuments with all city-specific links), cityData.ts (all 4 cities with questura, transport, university groups, events, ESN chapters, neighborhoods)
8. **All Hooks** - useUserProgress, useDocumentUploads, usePWAInstall, use-mobile, use-toast
9. **All Contexts** - AuthContext (sessionStorage strategy), CityContext (localStorage persistence, 4 cities)
10. **Database Schema** - All 6 tables with columns, types, defaults, constraints, RLS policies, foreign keys, indexes, triggers, functions (handle_new_user, update_updated_at_column, get_profile_display_info), all seeded FAQ data
11. **Storage** - user-documents bucket with RLS policies
12. **Edge Functions** - send-chat-message (rate limiting, XSS sanitization, reply validation) and toggle-reaction (emoji whitelist, toggle logic)
13. **PWA Configuration** - Manifest, service worker, icons, caching strategies
14. **Authentication Flow** - Sign up/in forms, sessionStorage auth, profile auto-creation trigger, email verification
15. **All Migration SQL** - Complete migration history in order

## Technical approach

- Generate a single markdown file using `lov-exec`
- Write to `/mnt/documents/settlemate-complete-hld.md`
- Include every piece of content, every data entry, every URL, every configuration value
- No summaries or abbreviations -- full detail for NotebookLM ingestion


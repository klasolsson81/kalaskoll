# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### Fas 1: Projektsetup
- Initial project setup with Next.js 16, TypeScript 5.9, Tailwind CSS 4
- shadcn/ui component library (button, card, input, label, checkbox)
- Vitest 4 + Testing Library + Playwright test configuration
- Project directory structure per CLAUDE.md spec
- ESLint + Prettier configuration
- GitHub Actions CI/CD pipeline
- Environment configuration with mock mode flag (.env.example, .env.local)

#### Fas 2: Auth & Profiler
- Supabase Auth integration (email/password sign up, sign in, sign out)
- Server actions for login, register, logout with Zod validation
- Functional login and register pages with error handling and loading states
- Protected dashboard layout with server-side auth check
- Logout button in dashboard header
- SubmitButton component with useFormStatus pending state
- Profiles table migration with RLS policies and auto-creation trigger

#### Fas 3: Kalas CRUD
- Parties + invitations SQL migration with RLS policies and indexes
- Party CRUD server actions (create, update, delete) with Zod validation
- PartyForm component with all fields (reusable for create and edit)
- Dashboard page listing all parties with theme badges and status
- Party detail page with guest count summary and QR token
- Party edit page pre-populated with existing data
- Guest list page with attending/declined breakdown
- Delete party with confirmation dialog
- Auto-creation of invitation token on party create

#### Fas 4: QR & RSVP
- RSVP responses + allergy data SQL migration with GDPR-compliant RLS
- Public RSVP page at /r/[token] with party details (mobile-first, no auth)
- RsvpForm with attending toggle, child info, parent contact, message
- AllergyCheckboxes with 8 common Swedish allergies + freetext + GDPR consent
- POST /api/rsvp endpoint with Zod validation and upsert support
- In-memory rate limiting (10 req/min per IP) on RSVP endpoint
- Allergy data stored separately with consent and auto-delete (party_date + 7d)
- QR code display on party detail page with copy-link button

#### Fas 5: Realtid & Dashboard
- Supabase Realtime subscriptions for live guest list updates
- GuestListRealtime component with automatic refresh on changes
- Allergy info display for party owners on guest list page
- Guest status counters (attending/total) on dashboard party cards

#### Fas 6: AI-inbjudningar (Mock)
- SVG placeholder images for 5 themes (default, dino, princess, superhero, football)
- POST /api/invitation/generate endpoint with mock/real AI toggle
- InvitationCard component with image + party details + QR overlay
- InvitationSection with generate and print buttons
- Ideogram API integration with OpenAI DALL-E fallback
- Print-friendly CSS for invitation cards

#### Fas 7: Landing & SEO
- Enhanced landing page with hero, how-it-works, features, FAQ, CTA sections
- JSON-LD structured data (WebApplication + FAQPage schemas)
- Full metadata: OpenGraph, Twitter Cards, robots, sitemap
- Swedish locale (lang="sv") throughout

### Fixed
- Post-registration redirect now goes to /check-email instead of /dashboard
- Auth callback route (/auth/callback) handles email verification code exchange
- Confirmed page (/confirmed) shown after successful email verification
- Middleware now protects both /dashboard and /kalas routes

#### Cross-cutting
- Supabase client/server/middleware setup with SSR cookie handling
- Auth middleware protecting /dashboard and /kalas routes
- Database types matching full Supabase schema (5 tables)
- Shared types for PartyDetails, RsvpResponse, AllergyData, API types
- Utility functions: formatPhoneNumber, formatDate, formatTime
- Validation schemas: login, register, party, RSVP (all with Zod)
- SEO helper for generating metadata
- Constants: app config, mock mode, common allergies, party themes
- Shared components: DevBadge, LoadingSpinner, ErrorBoundary, QRCode
- Custom hooks: useParty, useGuests, useRealtime
- 46 unit tests across 4 test files (format, auth, party, RSVP validation)

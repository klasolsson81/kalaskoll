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

#### Auth improvements
- Check-email page shown after registration with instructions
- Auth callback route (/auth/callback) handles email verification code exchange
- Confirmed page (/confirmed) shown after successful email verification
- Supabase admin client (service role) for server-side user management
- Temporary delete account button in dashboard header (for testing)

#### Multipla RSVP-svar per inbjudan
- Multiple RSVP responses per invitation via shared QR code
- Email required as identifier: UNIQUE(invitation_id, parent_email)
- Upsert logic: same email + same QR updates existing response
- RSVP page shows guest list with names and attending status
- Email field moved to top of form, marked required with helper text
- Confirmation page shows update-specific message and re-scan instructions
- Case-insensitive email matching via Zod lowercase transform and DB index
- SQL migration with constraint swap and backfill for existing data
- 17 RSVP validation tests including email requirement and normalization

#### Bekräftelsemail & säker edit-token
- Resend integration for RSVP confirmation emails (Swedish, mobile-friendly HTML)
- Cryptographic `edit_token` (64 hex chars) generated per RSVP response
- Secure edit flow: only token holder can modify their response
- Edit page at `/r/[token]/edit?token=xyz` with pre-filled form
- GET `/api/rsvp/edit` returns RSVP + allergy data for pre-fill
- POST `/api/rsvp/edit` validates edit_token, updates response, sends new confirmation
- Duplicate email on same invitation returns 409 with "check your email" message
- Removed upsert logic from POST `/api/rsvp` (insert-only now)
- Fire-and-forget email sending (RSVP saved even if email fails)
- Defense-in-depth: edit page verifies both edit_token and invitation_token
- PartyHeader shared component extracted for RSVP and edit pages
- AllergyCheckboxes supports initial values for edit mode
- RsvpForm supports create/edit modes with defaultValues prop
- SQL migration 00005: edit_token column with backfill, NOT NULL, UNIQUE, index
- `rsvpEditSchema` Zod validation + 13 new test cases (60 total tests)
- Resend dependency added, RESEND_API_KEY + RESEND_FROM_EMAIL env vars

### Fixed
- Post-registration redirect now goes to /check-email instead of /dashboard
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
- 60 unit tests across 4 test files (format, auth, party, RSVP validation)

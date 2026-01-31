# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

#### UI/UX Refaktor: Festlig Skandinavisk Minimalism
- Complete visual redesign based on "Festlig Skandinavisk Minimalism" design philosophy
- New color palette: Konfetti Rosa (primary), Ballong Turkos (secondary), Celebration Gold (accent) with warm off-white background
- Switched from Geist Sans to Inter font for better Swedish character support
- New warm shadow utilities: `shadow-soft`, `shadow-warm`, `shadow-lifted`
- Gradient celebration buttons with `gradient-celebration` utility
- Warm decorative background blobs throughout auth and landing pages
- Landing page: sticky header with blur, gradient hero text, feature cards with icons, FAQ cards, CTA with gradient
- Auth pages: card-based forms with brand logo, decorative background elements, warmer inputs
- Dashboard: welcome section with quick stats, gradient accent strips on party cards, empty state with CTA
- Party detail page: icon-based detail sections, better information hierarchy, badge-based status
- RSVP page: festive gradient header on PartyHeader, larger touch targets (h-12/h-14 inputs), warm success state
- Forms: consistent h-10/h-11 input heights, rounded-xl borders, icon-enhanced card headers
- Badge component added (success, warning, outline, destructive variants)
- Confetti animations on account verification and successful RSVP (via canvas-confetti)
- Animation utilities library (`src/lib/animations.ts`) with spring physics, fade-in, stagger variants
- `useConfetti` hook with reduced-motion respect
- Improved SEO metadata: more keywords, format detection, alternates, better descriptions
- All existing functionality preserved (auth, RSVP, GDPR, edit mode, email, etc.)

#### Större foto + zoom/beskär-verktyg
- Child photo on invitation card enlarged from 96px to 144px (inline) and 208px (print)
- PhotoFrame component refactored to use wrapper-div approach, allowing Tailwind className to override size
- New `PhotoCropDialog` component: zoom/pan editor with frame-shape overlay, opened on file upload
- Drag-to-pan (mouse + touch) and zoom slider (1x–3x) for precise cropping
- Frame shape selector (circle/star/heart/diamond) integrated into crop dialog
- SVG evenodd overlay shows the selected frame shape as a transparent cutout over darkened area
- Canvas export crops to the visible viewport area at `PHOTO_OUTPUT_SIZE` resolution
- Replaced auto-center-crop with interactive crop — users control exactly what part of the photo is visible
- Photo layout changed from stacked (own row) to inline beside "Hipp hipp hurra!" subtitle, preventing photo from pushing headline into background illustrations on image-based templates
- Photo size: 80px inline / 112px print (side-by-side with subtitle text)
- Inline frame picker removed from InvitationSection (now lives in crop dialog)
- `PHOTO_CROP_SIZE` constant (300px) for crop dialog viewport

### Added

#### Personligt foto på inbjudningskortet
- Upload a child photo (JPEG/PNG/WebP, max 10MB) displayed in a decorative frame on template-based invitation cards
- Client-side image processing: center-crop to 400x400, WebP compression (~30-60KB base64)
- Four frame shapes: circle, star, heart, diamond — selectable via inline frame picker
- PhotoFrame component using CSS `clip-path` (circle/star/diamond) and SVG `<clipPath>` (heart)
- `POST /api/invitation/upload-photo` endpoint with Zod validation and ownership check
- Photo stored as base64 data-URL in `parties.child_photo_url` (no external storage needed)
- Frame choice stored in `parties.child_photo_frame` with CHECK constraint
- Photo renders between "Hipp hipp hurra!" subtitle and party details on TemplateCard
- Works in print output with clip-path preserved
- Optional feature — invitation cards work perfectly without a photo
- SQL migration 00012 (child_photo_url + child_photo_frame columns)

### Changed

#### Illustrerade inbjudningsmallar (Gemini AI)
- Replaced CSS-only gradient templates with 9 hand-crafted AI-generated background images
- Each template now uses a high-quality illustration as full-bleed background with CSS text overlay
- Images stored in `public/assets/templates/` (default, dinosaurier, prinsessor, superhjältar, fotboll, rymden, djungel, enhörningar, pirater)
- TemplateCard uses Next.js Image for optimized loading (WebP, lazy load, responsive sizes)
- Emoji decorations removed from image-based templates (illustrations have their own visual frames)
- Text shadow added to dark-background themes (superhjältar, fotboll, rymden, djungel) for readability
- Pirater template text colors changed from light to dark to match light parchment background
- CSS gradients and patterns kept as fallback for any future templates without images
- Auto-select matching template when creating a party with a known theme (e.g. theme "dinosaurier" → dinosaurier template)

### Added
- Manual guest management: add, edit, and delete guests directly on the guest list
- "Lägg till gäst" inline form on guest list page (name, attending, parent info, message)
- Edit and delete buttons on each guest row with inline edit form and delete confirmation
- `manualGuestSchema` Zod validation for manual guest data
- Server actions: `createGuest`, `updateGuest`, `deleteGuest` in guests/actions.ts
- 16 unit tests for manual guest validation schema
- Party description shown on invitation cards (both template and AI variants)
- TemplateCard: description displayed as italic text between party details and QR section
- InvitationCard: description displayed in the details overlay area
- Description max length reduced from 1000 to 200 characters (fits on card without overflow)
- Character counter on description textarea in PartyForm with maxLength enforcement
- Label updated to clarify description appears on the invitation

### Fixed
- Print: full-bleed invitation card fills entire page — no white margins to cut away
- Print: `@page { margin: 0 }` removes browser page margins, card border/radius removed in print
- Print: TemplateCard fills full page height with centered content and edge-to-edge gradient
- Print: duplicate invitation card (2 pages) caused by `position: fixed` repeating on every printed page — changed to `position: absolute`
- Print: missing background colors/gradients — added `print-color-adjust: exact` globally
- Print: dashboard header, share section, and details/guests cards no longer leak into print output

### Changed

#### Visuellt unika inbjudningsmallar
- Redesigned all 9 templates to be visually distinct from each other
- Before: 3 near-identical light greens, 2 similar pinks, 2 similar ambers — only Rymden stood out
- After: each template has a unique color intensity and palette:
  - Klassiskt kalas: light amber/gold with confetti dots
  - Dinosaurier: medium lime-to-emerald with leaf-vein lines
  - Prinsessor: saturated pink/magenta with shimmer sparkles
  - Superhjältar: bold red→yellow→blue comic-book gradient with action lines
  - Fotboll: deep green pitch with white center stripe
  - Rymden: dark indigo/purple with stars (unchanged)
  - Djungel: dark teal/emerald with gold accents
  - Enhörningar: rainbow pastel gradient (pink→violet→cyan) with sparkle dots
  - Pirater: dark brown/sepia parchment with treasure-map texture

#### Unified thumbnail gallery for invitations
- Replaced separate template/AI flows with a single horizontal thumbnail strip
- Thumbnail strip always visible — even when card is collapsed — showing all available options
- Mall thumbnail, AI-image thumbnails, "+ Ny AI-bild" button, and "Byt mall" button in one row
- Active selection shown with blue ring + check mark; only one active at a time
- Collapsed state now shows header + thumbnail strip (no more blank collapsed view)
- Expanded state shows full-size card above the thumbnail strip
- "Byt mall" opens template picker overlay replacing the full-size card area
- `select-image` API now clears `invitation_template` when selecting an AI image (mutual exclusivity)

### Added
- Guest list page now shows sent invitations (email/SMS) with response status

#### Gratis HTML/CSS inbjudningsmallar
- 9 free CSS-based invitation templates (1 per theme + 1 default) with integrated text design
- `TemplateCard` component: full-size printable invitation with themed borders, gradients, emoji decorations, and QR code
- `TemplatePicker` component: responsive grid (2-3 columns) showing all templates with real party data preview
- Theme configurations (`theme-configs.ts`): 9 distinct visual identities (default, dinosaurier, prinsessor, superhjältar, fotboll, rymden, djungel, enhörningar, pirater)
- `POST /api/invitation/select-template` endpoint: saves template choice, clears AI image as active
- `invitation_template` column on `parties` table (SQL migration 00011)
- InvitationSection updated with three-state flow: template picker → template view → AI image view
- "Byt mall" and "Byt till gratis mall" links for switching between template and AI modes
- Templates are mutually exclusive with AI images (selecting one clears the other as active)

### Changed

#### Dela inbjudan-hub
- Replaced separate QR code card with unified "Dela inbjudan" section
- Quick-share buttons: copy link, toggle QR code, native share (Web Share API)
- QR code shown inline as collapsible panel within the share section
- Removed `QRCodeSection.tsx` (functionality absorbed into `SendInvitationsSection`)

### Added

#### Kollapsbar inbjudan + AI-bildgalleri
- Collapsible InvitationSection: collapsed by default, expand to see image + gallery
- `party_images` table for storing multiple AI-generated images per party
- Image gallery: generate up to 5 images, select the best one as active
- `POST /api/invitation/select-image` endpoint for choosing active image
- Generate route now inserts into `party_images` and returns `imageId`/`imageCount`
- Admins bypass image limit (unlimited generations)
- Thumbnail grid with selection indicator and dashed "+" button for new images
- SQL migration 00010 (party_images table with RLS)
- `AI_MAX_IMAGES_PER_PARTY` constant (5)

#### SMS-inbjudningar via 46elks
- E-post/SMS toggle in SendInvitationsSection for choosing invite method
- `POST /api/invitation/send-sms` endpoint with auth, ownership check, and SMS limits
- 46elks SMS client (`src/lib/sms/elks.ts`) with auto-shortened message for 160-char limit
- `sms_usage` table tracking SMS count per user per month (survives party deletion)
- Anti-abuse: max 15 SMS per party, max 1 party with SMS per month per user
- Admin bypass for SMS limits (configurable via `ADMIN_EMAILS` constant)
- `invited_guests` extended with `phone`, `invite_method` columns (email now nullable)
- Phone normalization (07x → +46x) in `sendSmsInvitationSchema` Zod validation
- `formatDateShort()` utility for compact Swedish dates in SMS ("15 mar")
- Guest list shows icons for invite method (email vs SMS) with response status
- 15 new tests: SMS validation (12) + formatDateShort (3)
- SQL migration 00009 (sms_usage table, invited_guests SMS columns)
- Pre-fill phone number in RSVP form when opened via SMS invitation link (`?phone=` query param)

#### Superadmin-roller
- `ADMIN_EMAILS` bypass: superadmins skip SMS limits (15/party, 1 party/month)
- `ADMIN_EMAILS` bypass: superadmins use real AI image generation even in mock mode (`forceLive`)
- Configured admins: `klasolsson81@gmail.com`, `zeback_@hotmail.com`

### Fixed
- Child birth date validation: reject future dates in schema + `max` attribute on date inputs
- Party theme selector: add "Annat..." option with free-text input for custom themes
- Add helper text under "Sista OSA-datum" explaining the field for parents unfamiliar with OSA

### Added

#### Sparade barn på profilen
- `children` table with RLS for saving children (name + birth date) per user
- `child_id` optional FK on parties (backwards-compatible, ON DELETE SET NULL)
- `ChildrenSection` dashboard component: add, edit, delete children inline
- `calculateAge(birthDate, atDate)` utility for dynamic age calculation
- `childSchema` Zod validation for child form data
- `childId` field on `partySchema` (optional UUID or empty string)
- PartyForm child selector dropdown: choose saved child or enter manually
- Age auto-recalculates when party date changes
- Server actions: `createChild`, `updateChild`, `deleteChild`
- Children fetched and passed to PartyForm on new/edit pages
- SQL migration 00008 (children table + child_id on parties)
- 15 new tests: `calculateAge` (8), `childSchema` (4), `childId` validation (3)

#### Sluttid, gästlista & inbjudningsmail
- Optional end time (`party_time_end`) on parties with `formatTimeRange()` display
- End time shown across all views: detail, dashboard, RSVP, edit, invitation card
- `invited_guests` table for tracking email invitations per party with RLS
- `SendInvitationsSection` component: send invitations via email, view invited guests with response status
- `POST /api/invitation/send` endpoint: auth-protected, sends HTML emails via Resend, saves to `invited_guests`
- `sendPartyInvitation()` email function with party details, AI image link, and RSVP button
- `sendInvitationSchema` Zod validation for email sending
- SQL migrations 00006 (party_time_end) and 00007 (invited_guests with RLS)
- 8 new tests: `formatTimeRange` (6 cases) + `partyTimeEnd` validation (2 cases)

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

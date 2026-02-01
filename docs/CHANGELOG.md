# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### Code Review Fixes (LO-02, CR-09)
- **E2E test suite** (CR-09): 5 Playwright test files with ~41 test cases covering landing page, footer modals, auth pages, RSVP flow, navigation/SEO, and accessibility
- **Playwright config**: Support for `PLAYWRIGHT_BASE_URL` env var to run tests against deployed apps (skips webServer when external URL)

#### Code Review Fixes (HI-10, MI-03, MI-05, MI-06, MI-09, MI-10)
- **Loading skeletons** (MI-03): `loading.tsx` for dashboard and party detail pages with spinner + skeleton cards
- **Per-user AI rate limiting** (MI-06): Factory-based rate limiter in `rate-limit.ts`. AI generation limited to 10 req/hour per user (admins exempt). RSVP limiter unchanged (backward-compatible).
- **Composite index** (LO-04): `parties(owner_id, party_date DESC)` for faster dashboard queries (migration `00018`)
- **CI/CD improvements** (LO-03): Coverage reporting with artifact upload, E2E job (Playwright on PRs) with artifact upload
- **Supabase security fixes**: Migration `00019` — immutable `search_path` on `update_updated_at`, tightened INSERT policies on `audit_log` and `rsvp_responses`

### Changed

- **Hardcoded URL replaced** (LO-02): All hardcoded `kalaskoll.se` references replaced with `APP_URL` constant from `NEXT_PUBLIC_APP_URL` env var (layout.tsx, sitemap.ts, robots.ts, seo.ts, page.tsx JSON-LD)
- **Footer brand link**: "KalasKoll" in footer is now a clickable link to the landing page (`/`)
- **PartyHeader description label**: Description field on RSVP page now shows "Info" label above the text for clarity
- **"Om oss" personal story**: Updated footer modal with Klas Olsson's personal backstory — son Alexander, 20 preschool kids, free-first philosophy
- **Hero subtitle**: Landing page hero now emphasizes the QR-in-the-cubby workflow
- **FAQ "Vem ligger bakom?"**: New FAQ entry (visible + JSON-LD) about Klas and the origin of KalasKoll

#### Code Review Fixes (HI-10, MI-03, MI-05, MI-06, MI-09, MI-10)
- **Delete party modal** (MI-10): Replaced browser `confirm()` with accessible modal dialog (`role="dialog"`, `aria-modal`, Escape key, backdrop click, loading/error states)
- **SMS quota reuse** (MI-05): Users can now reuse SMS quota for a new party after the previous one is deleted, respecting the remaining count limit
- **SMS text for non-gold users**: Changed "SMS ej tillgängligt" to "Köp Guldpaket för att få tillgång till SMS-aviseringar"

### Fixed

- **RSVP submission crash**: Added defensive try-catch to rate limiter (`rate-limit.ts`) and top-level error handlers to RSVP API routes, so they always return JSON even on unexpected failures
- **RSVP client error message**: Improved catch-all error to suggest checking internet connection instead of generic "Försök igen"
- **Theme badge hidden from guests**: Removed theme badge from PartyHeader (RSVP page) — theme is an internal field for card design, not guest-facing info
- **Allergy consent for free-text**: Consent checkbox now appears when typing in "Annat (fritext)" field, not only when selecting predefined allergies (GDPR fix)

#### Code Review Fixes (HI-10, MI-03, MI-05, MI-06, MI-09, MI-10)
- **Image header validation** (HI-10): Server-side magic byte validation in `uploadPhotoToStorage()` rejects files with mismatched MIME type and actual content (JPEG/PNG/WebP)
- **Allergy consent filter** (MI-09): Allergy data query now includes `consent_given_at` in SELECT and filters out rows without consent
- **Visual consistency** (LO-01): Standardized QR background to `bg-white` across all templates, replaced hardcoded `blue-500` with `primary` in TemplatePicker and PhotoCropDialog, textarea styling now matches Input component pattern
- **Magic number comments** (LO-05): Documented Bézier circle constant (0.5523), star inner radius (0.38), and heart path control points in PhotoCropDialog
- **Lint warnings** (LO-06): Suppressed 2 `no-unused-vars` warnings for intentional destructuring-to-omit pattern in test file
- **CI coverage dependency**: Added `@vitest/coverage-v8` for `pnpm test:coverage` in CI pipeline
- **SMS superadmin bypass**: Fixed client-side SMS availability logic when previous party was deleted (party_id IS NULL)
- **Mobile child buttons**: Action buttons in "Mina barn" now wrap on mobile instead of overflowing

#### Tech Debt Sprint (TD-01 till TD-19)
- **AES-256-GCM allergy encryption** (TD-08): All allergy data encrypted at rest with AES-256-GCM. `src/lib/utils/crypto.ts` with `encrypt`/`decrypt`, `encryptAllergyData`/`decryptAllergyData`. Graceful fallback for legacy unencrypted data and missing `ALLERGY_ENCRYPTION_KEY`.
- **Supabase Storage for photos** (TD-03): Child photos uploaded to `child-photos` Supabase Storage bucket with RLS policies. Falls back to base64 data-URL if storage unavailable. `src/lib/utils/storage.ts` with `uploadPhotoToStorage`/`deletePhotoFromStorage`. Migration `00017`.
- **Audit trail** (TD-10): `audit_log` table (migration `00016`) with RLS and pg_cron cleanup (90 days). Fire-and-forget logging via `src/lib/utils/audit.ts`. Events: `rsvp.submit`, `party.create`, `account.delete`.
- **Unit tests** (TD-06): 11 new tests — crypto round-trip, random IV, legacy fallback (7); SMS message builder content, length, long-input fallback (4). Total: **133 tests across 9 files**.
- **ARIA accessibility** (TD-18): `role="alert"` on error messages, `aria-pressed` on RSVP toggles, `role="dialog"` + `aria-modal` + `aria-labelledby` on dialogs, `role="img"` on QR code, `role="group"` on allergy checkboxes.
- **Client-side Zod validation** (TD-05): RSVP form validates with `rsvpSchema.safeParse()` before API call, showing Swedish error messages without server round-trip.
- **Client-side phone validation** (TD-11): SMS phone input validated with `sendSmsInvitationSchema.safeParse()` before API call.
- **SEO domain env var** (TD-13): `NEXT_PUBLIC_SITE_URL` environment variable replaces hardcoded `kalaskoll.se` in SEO metadata.
- **Image error fallbacks** (TD-19): `onError` handlers on `next/image` components with graceful fallback UI.

### Changed

#### Tech Debt Sprint (TD-01 till TD-19)
- **Refactored InvitationSection** (TD-01): Extracted `useInvitation` hook with all state + API logic. Component reduced from ~400 to ~170 lines.
- **Refactored GuestListRealtime** (TD-02): Extracted `AddGuestForm`, `EditGuestForm`, `GuestRow`, and shared `types.ts`. Component reduced from ~460 to ~160 lines.
- **Email/SMS delivery logging** (TD-17): Structured `console.log`/`console.error` logging with `SendResult` pattern for both Resend email and 46elks SMS. Email functions return `{ success, error? }` instead of throwing.
- **Tightened RSVP UPDATE RLS** (TD-09): RLS policy restricts updates to own response via `edit_token` column match (migration `00015`).

### Added
- **Allergy auto-delete** (MVP-1): pg_cron job (migration `00014`) that deletes expired allergy data daily at 03:00 UTC. GDPR art. 9 compliance. Also includes Edge Function fallback.
- **Persistent rate limiting** (MVP-2): Replaced in-memory `Map` with Upstash Redis (`@upstash/ratelimit`) on RSVP routes. Falls back to allow-all if Upstash not configured (dev-friendly).
- Shared `isRateLimited()` utility in `src/lib/utils/rate-limit.ts`
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.example`

### Fixed

#### Säkerhet & Robusthet (QW-01 till QW-14 + MVP Blockers)
- **SMS fail-closed** (QW-01): `smsAllowed` defaults to `false` instead of `true` when DB query fails
- **Server-only guard** (QW-02): Admin client throws if imported client-side, preventing service role key leak
- **Admin emails to env var** (QW-03): `ADMIN_EMAILS` read from environment variable instead of hardcoded
- **Delete account error handling** (QW-04): Wrapped in try/catch with user-friendly error message
- **Zod schemas** (QW-05): `select-image` and `select-template` routes use Zod `.safeParse()` instead of manual validation
- **API response validation** (QW-06/07): OpenAI and 46elks responses validated with Zod schemas instead of unsafe casts
- **HTML-escape email templates** (QW-08): All user input (`childName`, `venueName`, `description`, etc.) escaped with `escapeHtml()` in both email templates
- **RSVP deadline check** (QW-09): API returns 400 and UI shows message when `rsvp_deadline` has passed
- **RSVP loading state** (QW-10): Added `loading.tsx` with spinner for RSVP page
- **Better QR error** (QW-11): Invalid/expired QR codes show helpful Swedish message instead of generic 404
- **Dashboard error boundaries** (QW-12): `Promise.all` wrapped in try/catch with graceful fallback
- **API timeouts** (QW-13): AbortController (30s) on OpenAI and 46elks calls; Promise.race (60s) on Replicate
- **Ownership checks** (QW-14): Explicit `owner_id` check on generate, select-image, select-template, upload-photo routes

### Added

#### Fullständig code review (6 experter)
- `CODE_REVIEW_REPORT.md`: Komplett rapport med findings från Security, Error Handling, UX/A11y, Product, Performance/Code, UI/Design
- `MVP_BLOCKERS.md`: 8 issues som måste fixas innan MVP-lansering 27 mars
- `TECH_DEBT_LOG.md`: 19 dokumenterade tech debt-items prioriterade efter MVP
- `QUICK_WINS.md`: 14 snabba fixar sorterade efter impact/effort-ratio

#### Professionell footer med modaler
- Sitewide `Footer` component in root layout, visible on all pages (landing, auth, dashboard, RSVP)
- `FooterModal` reusable modal shell with backdrop click, Escape key, scroll support, and ARIA attributes
- Three-column layout: brand, navigation, legal — stacks vertically on mobile
- 5 modal pages: Om oss, Priser, Integritetspolicy, Användarvillkor, Cookiepolicy
- All policy text in Swedish with GDPR-relevant privacy sections
- `print:hidden` on footer to keep print output clean
- Removed inline footer from landing page (replaced by global footer)

### Changed

#### Flux Dev + Eget tema + Bättre laddnings-UX
- Switched AI model from Flux Schnell to Flux Dev for higher image quality (`guidance_scale: 3.5`, `num_inference_steps: 28`)
- Custom theme input ("Eget tema...") in AI generate dialog — freetext motif with client-side content validation blocklist
- Prompt builder (`buildPrompt`) falls back to raw theme text for custom themes not in THEME_DESCRIPTION
- Animated loading card in AI column: shimmer effect with rotating status messages during generation
- Success notification banner ("Din AI-bild är klar!") after image generation, auto-dismisses after 4 seconds
- Invitation card QR text clarified: "Välkomna!" → "Kan du komma?", "Scanna för att OSA" → "Scanna och tacka ja eller nej" (both AI and template cards)

### Added

#### Riktig AI-bildgenerering med Replicate Flux + Premium-kortrendering
- Replicate Flux Schnell as primary AI image provider (3:4 portrait, webp)
- OpenAI DALL-E 3 as fallback provider (1024x1792 portrait)
- `AiGenerateDialog` modal: 4 style choices (Tecknat, 3D-render, Akvarell, Fotorealistisk) with amber Guldkalas styling
- `AiInvitationCard` component: fullbleed AI background with dark gradient overlay, white text + text-shadow, QR in white container
- `buildPrompt()` prompt builder: maps style + theme to detailed image prompts with "no text" enforcement
- `generateImageSchema` Zod validation for style parameter
- Child photo support on AI-generated cards (same PhotoFrame component as templates)
- Photo upload enabled for both template and AI invitation modes
- `replicate` SDK for Flux Schnell image generation
- `REPLICATE_API_TOKEN` environment variable
- Next.js `images.remotePatterns` for replicate.delivery and OpenAI blob domains
- `AI_STYLES` constant with 4 style options and `AiStyle` type

### Changed

- Email RSVP pre-fill: guests clicking an email invitation link now have their email address pre-filled and locked (read-only) in the RSVP form, matching the edit-mode behavior
- AI generation API route (`/api/invitation/generate`) now accepts `style` parameter and uses Replicate Flux as primary provider
- Ideogram API deprecated — `ideogram.ts` simplified to mock-only, `@fal-ai/client` removed
- `openai.ts` updated to use `buildPrompt()` and portrait format (1024x1792)
- AI invitation cards now render with fullbleed background + text overlay instead of image-above-text layout

### Changed

#### Inbjudnings-sektionen — Tvåkolumnslayout med Guldkalas-branding
- Replaced flat thumbnail strip with two-column layout: "Gratis-mallar" (left) and "AI-kort / Guldkalas" (right)
- Template 3×3 grid always visible — no more "Byt mall" overlay toggle
- AI column shows Guldkalas badge, generation counter (X/5), and upgrade text when limit reached
- Admin users see "Superadmin — inga begränsningar" instead of counter
- Extracted `InvitationPreview`, `PhotoUploadSection`, `TemplateColumn`, `AiColumn` sub-components from monolithic InvitationSection (605 → ~250 lines orchestrator)
- Columns stack vertically on mobile with horizontal divider; vertical divider on desktop
- Card heading renamed from "Inbjudan" to "Inbjudningskort"
- AI column styled as premium card: amber gradient background, gold border, amber-tinted selection rings and generate button
- Guldkalas badge upgraded: gradient fill, border, shadow — feels premium instead of flat
- Column headings promoted from gray `text-muted-foreground` to darker `text-foreground`/`text-amber-900` with icon chips
- PartyForm: added Guldkalas info box under theme selector explaining AI cards are available after party creation
- `createParty`: new parties without a matching theme template now default to 'default' (Klassiskt kalas)

### Added

#### Barnfoto — foto på sparade barn + auto-kopiera till kalas
- Optional photo upload on saved children (same crop/frame dialog as party invitation)
- `PhotoFrame` displayed (40px) next to child name in "Mina barn" list
- "Foto" / "Byt foto" / "Ta bort foto" buttons per child row
- `POST /api/children/upload-photo` endpoint with Zod validation and ownership check
- Photo stored as base64 data-URL in `children.photo_url` column
- Frame choice stored in `children.photo_frame` with CHECK constraint
- Auto-copy: when creating a party with a saved child that has a photo, the photo and frame are copied to `child_photo_url`/`child_photo_frame` on the party
- SQL migration 00013 (photo_url + photo_frame columns on children table)
- `uploadChildPhotoSchema` Zod validation schema

#### Profilsidor
- New `/profile` page for editing name and phone number
- New `/profile/password` page for changing password
- Server actions: `updateProfile` (updates auth metadata + profiles table) and `updatePassword` (Supabase auth)
- Zod validation schemas: `profileSchema` and `passwordSchema`
- ProfileDropdown now navigates to profile and password pages

### Changed

#### Könsneutral färgpalett och profilmeny
- Replaced pink/purple color palette with gender-neutral Festblå (primary), Ballong Turkos (secondary), Celebration Amber (accent)
- Gradient celebration now blue-to-indigo instead of pink-to-purple
- Shadow tints updated from pink to blue for warm/lifted shadows
- Confetti colors updated to blue, teal, gold, orange, green (no pink/purple)
- Landing page hero gradient text uses indigo instead of purple
- New ProfileDropdown component replaces inline nav buttons (logout, delete account)
- Dropdown menu with: Ändra profil, Ändra lösenord, Köp Guldkalas (premium, disabled), Radera konto, Logga ut
- Added shadcn DropdownMenu component (Radix UI)
- User avatar initial and email shown in dropdown header

#### UI/UX Refaktor: Festlig Skandinavisk Minimalism
- Complete visual redesign based on "Festlig Skandinavisk Minimalism" design philosophy
- New color palette: Festblå (primary), Ballong Turkos (secondary), Celebration Amber (accent) with warm off-white background
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

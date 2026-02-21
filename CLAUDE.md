# CLAUDE.md – KalasKoll

> Instruktionsfil for Claude Code. Senast uppdaterad: 2026-02-21

---

## Projektoversikt

**KalasKoll** ar en svensk webapp for barnkalas-inbjudningar med AI-genererade kort, QR-kod-baserad OSA och GDPR-sakrad allergihantering.

**Skapare:** Klas Olsson — byggde appen for sin son Alexanders kalas (20 forskolebarn).

### Karnflode

```
Foralder skapar konto → Verifierar e-post → Dashboard
→ Skapar kalas med AI-inbjudan eller gratis mall
→ Delar inbjudan via e-post, lank eller QR-utskrift (SMS med Guldkalas)
→ Gaster oppnar lanken → Mobil OSA-sida
→ Svarar ja/nej + allergiinfo (krypterad)
→ Foralder ser svar i realtid
```

---

## Tech Stack

| Omrade | Teknologi |
|--------|-----------|
| Framework | Next.js 16 (App Router), TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui (glass-morphism theme) |
| 3D | Three.js, React Three Fiber, drei |
| Databas | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Rate Limiting | Upstash Redis |
| AI-bilder | Replicate Flux Schnell / OpenAI DALL-E 3 |
| SMS | 46elks API |
| E-post | Resend |
| Hosting | Vercel |
| Tester | Vitest (153 unit) + Playwright (41 E2E) |

---

## Kommandon

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Produktionsbygge
pnpm lint             # ESLint
pnpm test             # Unit + integration (Vitest)
pnpm test:e2e         # E2E (Playwright)
pnpm test:coverage    # Coverage-rapport
```

---

## Projektstruktur

```
src/
  app/
    (auth)/              # Login, register, check-email, confirmed
    (dashboard)/         # Dashboard, kalas CRUD, gastlista, profil (inkl. losenordsbyte)
    api/                 # RSVP, invitation, auth, children
    r/[token]/           # Publik RSVP-sida + redigera svar
    sitemap.ts           # Sitemap (/, /login, /register, /forgot-password)
    robots.ts            # Robots (disallow /api, /dashboard, /admin, /r)
    icon.tsx             # Favicon 32x32 (edge-genererad)
    apple-icon.tsx       # Apple Touch Icon 180x180
    opengraph-image.png  # OG-bild for social delning
  components/
    beta/                # BetaBanner, BetaLimitsDisplay, BetaProgressBar (DEMO)
    landing/             # GradientMeshBg, Balloons3D, ConfettiTrigger
    templates/           # TemplateCard, TemplatePicker, theme-configs
    cards/               # AiInvitationCard, InvitationCard, PartyHeader
    forms/               # RsvpForm, PartyForm, AllergyCheckboxes, WaitlistForm
    layout/              # Header, Footer, FooterModal, Sidebar
    shared/              # PhotoFrame, PhotoCropDialog, QRCode, FeedbackWidget
  lib/
    supabase/            # Client, server, admin, middleware
    ai/                  # Replicate + OpenAI + promptbyggare
    sms/                 # 46elks
    email/               # Resend
    utils/               # Validation (Zod), format, crypto, audit, storage, rate-limit, seo
    constants.ts         # APP_URL, ADMIN_EMAILS, etc
tests/
  unit/                  # 9 testfiler, 133 tester
  e2e/                   # 5 spec-filer, 41 tester
docs/
  CHANGELOG.md           # Alla andringar
  API.md                 # API-dokumentation
  DATABASE.md            # Schema, RLS, migrations
  KALASKOLL_BETA_MASTERPLAN.md  # Beta-system design (DEMO)
  KALASKOLL_CODE_REVIEW_MASTERPLAN.md
  KALASKOLL_UI_REFACTOR_MASTERPLAN.md
```

---

## Environment Variables

Se `.env.example` for fullstandig lista. Kritiska:

| Variabel | Beskrivning |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |
| `REPLICATE_API_TOKEN` | AI-bildgenerering |
| `OPENAI_API_KEY` | Fallback AI (DALL-E 3) |
| `RESEND_API_KEY` | E-post |
| `ELKS_API_USERNAME` / `ELKS_API_PASSWORD` | SMS (46elks) |
| `ALLERGY_ENCRYPTION_KEY` | AES-256-GCM (base64, 32 bytes) |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Rate limiting |
| `NEXT_PUBLIC_APP_URL` | App-URL (default: http://localhost:3000) |
| `NEXT_PUBLIC_MOCK_AI` | `true` = mock-bilder, `false` = riktiga AI-anrop |

> ALDRIG commita `.env.local` eller secrets.

---

## SEO

### Metadata-monster

- Root layout (`src/app/layout.tsx`) har default-metadata med template `%s | KalasKoll`
- Varje `page.tsx` exporterar `export const metadata` eller `generateMetadata` med unik `title` + `description`
- For `'use client'`-sidor: klientkomponenten ar extraherad till en egen fil (t.ex. `LoginForm.tsx`), och `page.tsx` ar en serverkomponent som exporterar metadata och renderar klientkomponenten
- Dynamiska routes (kalas/[id], r/[token]) anvander `generateMetadata` for dynamiska titlar

### SEO-filer i `src/app/`

| Fil | Beskrivning |
|-----|-------------|
| `sitemap.ts` | Genererar `/sitemap.xml` med publika sidor |
| `robots.ts` | Genererar `/robots.txt` — disallow /api, /dashboard, /admin, /r |
| `icon.tsx` | Edge-genererad 32x32 favicon (PNG) |
| `apple-icon.tsx` | Edge-genererad 180x180 Apple Touch Icon |
| `opengraph-image.png` | Statisk OG-bild for social delning |
| `favicon.ico` | Legacy favicon |

### Regler vid nya sidor

1. Varje ny `page.tsx` MASTE ha `export const metadata` med unik `title`
2. Interna sidor (bakom auth) ska ha `robots: { index: false, follow: false }`
3. Publika sidor ska ha `alternates: { canonical: '/path' }`
4. Nya publika routes ska laggas till i `sitemap.ts`

---

## GDPR — Allergidata

Allergidata ar halsodata (GDPR artikel 9). Krav:

1. **Separat samtycke** — checkbox kravs for bade forvalda allergier och fritext
2. **AES-256-GCM kryptering** — `src/lib/utils/crypto.ts`
3. **Auto-radering** — `party_date + 7 dagar` via `auto_delete_at`
4. **RLS** — bara kalasagaren kan lasa allergidata
5. **Consent-filter** — query filtrerar bort poster utan `consent_given_at`

---

## Superadmin

Definieras i `src/lib/constants.ts`:

```typescript
export const ADMIN_EMAILS = ['klasolsson81@gmail.com'];
```

Superadmins har: obegransat SMS, obegransade AI-bilder, forceLive i mock mode.

---

## Git & Commit

### Commit-konvention

```
feat(scope): ny funktionalitet
fix(scope):  buggfix
docs:        dokumentation
test:        tester
chore:       build, config, deps
```

### Innan varje commit

```bash
pnpm lint && pnpm test && pnpm build
```

Uppdatera `docs/CHANGELOG.md` for feat/fix. Pusha till GitHub efter commit.

---

## Demo/Beta-testning (PAGAR)

Demo-testning pagar med riktiga anvandare. Appen kors i "beta-lage" dar testare far gratis AI-bilder och SMS.

**VIKTIGT:** Nar agaren ger order om att "ta bort demo-grejer" ska foljande tas bort — men INTE forbattringar (UI, funktioner, bugfixar) som gjorts under demo-perioden:

### Ta bort vid demo-avslut

**Komponenter:**
- `src/components/beta/BetaBanner.tsx` — registreringsbanner
- `src/components/beta/BetaLimitsDisplay.tsx` — dashboard-status
- `src/components/beta/BetaProgressBar.tsx` — platser-kvar bar

**Sidor/formulär:**
- `src/app/(auth)/register/BetaRegisterForm.tsx` — beta-registrering
- `src/app/(auth)/beta-ended/page.tsx` — "betan har avslutats"-sida
- `src/components/forms/WaitlistForm.tsx` — vantelista

**API-routes:**
- `src/app/api/beta/register/route.ts`
- `src/app/api/beta/stats/route.ts`
- `src/app/api/waitlist/route.ts`
- `src/app/api/cron/cleanup-testers/route.ts`

**Konfiguration:**
- `src/lib/beta-config.ts` — all beta-logik (datum, limits, statuscheck)
- `src/hooks/useBetaStatus.ts` — klient-hook for beta-status

**I befintliga filer (rensa, ta inte bort filen):**
- `src/app/(auth)/register/page.tsx` — ta bort beta-villkor, gör till vanlig registrering
- `src/app/(dashboard)/dashboard/page.tsx` — ta bort `<BetaLimitsDisplay />`
- Databasschema: `profiles.role` behåll men ta bort `beta_*`-fält

### Beháll

Alla UI-forbattringar: glass-morphism, 3D-ballonger, gradient mesh, font-display, hover-animationer, feedback-widget, etc. Dessa ar permanenta forbattringar, inte demo-specifika.

---

## Regler for Claude Code

1. Kor `pnpm lint && pnpm test` innan commit
2. Uppdatera `docs/CHANGELOG.md` for feat/fix
3. Commita med konventionella meddelanden
4. Pusha till GitHub efter commit
5. Anvand TypeScript-typer (ingen `any`)
6. Validera input med Zod
7. Tank pa GDPR vid allergidata
8. Testa mobil (RSVP ar 99% mobil)
9. Aldrig commita secrets
10. Mock mode (`NEXT_PUBLIC_MOCK_AI=true`) under utveckling, utom superadmins

---

## Lankar

- **Produktion**: https://kalaskoll.se
- **GitHub**: https://github.com/klasolsson81/kalaskoll
- **Docs**: `docs/CHANGELOG.md`, `docs/API.md`, `docs/DATABASE.md`

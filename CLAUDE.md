# CLAUDE.md – KalasKoll

> Instruktionsfil for Claude Code. Senast uppdaterad: 2026-02-01

---

## Projektoversikt

**KalasKoll** ar en svensk webapp for barnkalas-inbjudningar med AI-genererade kort, QR-kod-baserad OSA och GDPR-sakrad allergihantering.

**Skapare:** Klas Olsson — byggde appen for sin son Alexanders kalas (20 forskolebarn).

### Karnflode

```
Foralder skapar konto → Verifierar e-post → Dashboard
→ Skapar kalas med AI-inbjudan eller gratis mall
→ Skriver ut inbjudan med QR-kod
→ Gaster skannar QR → Mobil OSA-sida
→ Svarar ja/nej + allergiinfo (krypterad)
→ Foralder ser svar i realtid
```

---

## Tech Stack

| Omrade | Teknologi |
|--------|-----------|
| Framework | Next.js 16 (App Router), TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Databas | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Rate Limiting | Upstash Redis |
| AI-bilder | Replicate Flux Schnell / OpenAI DALL-E 3 |
| SMS | 46elks API |
| E-post | Resend |
| Hosting | Vercel |
| Tester | Vitest (133 unit) + Playwright (41 E2E) |

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
    (dashboard)/         # Dashboard, kalas CRUD, gastlista, profil
    api/                 # RSVP, invitation, auth, children
    r/[token]/           # Publik RSVP-sida + redigera svar
  components/
    templates/           # TemplateCard, TemplatePicker, theme-configs
    cards/               # AiInvitationCard, InvitationCard, PartyHeader
    forms/               # RsvpForm, PartyForm, AllergyCheckboxes
    layout/              # Header, Footer, FooterModal, Sidebar
    shared/              # PhotoFrame, PhotoCropDialog, QRCode, DevBadge
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

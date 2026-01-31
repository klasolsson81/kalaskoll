# KalasKoll Code Review Report

**Datum:** 2026-01-31
**Reviewers:** Anders (Security), Beatrice (Error Handling), Carlos (UX/A11y), Diana (Product), Erik (Performance/Code), Fiona (UI/Design)
**Projekt-version:** `88795fe` (main)
**MVP-deadline:** 27 mars 2026

---

## Executive Summary

KalasKoll har en solid grund med bra arkitektur, genomtänkt databasschema och heltäckande Zod-validering. Koden är generellt välskriven med konsekvent TypeScript. Dock finns **3 kritiska säkerhetsproblem** (GDPR auto-delete saknas, in-memory rate limiting, XSS i e-postmallar), **saknade loading states** på den mest trafikerade sidan (RSVP), och **noll integrations-/E2E-tester**. Projektet behöver cirka 15-20 timmar fokuserat arbete innan det kan lanseras tryggt den 27 mars.

**Teamets bedömning: Projektet behöver fixar innan MVP, men grundstrukturen är stark.**

---

## Critical Issues (🔴)

### CR-01: Allergy data auto-delete saknas (GDPR)
**Reporter:** Anders (Security) + Database audit
**Plats:** `supabase/functions/` (saknas)
**Problem:** Schemat har `auto_delete_at`-kolumn och index, men ingen Edge Function kör raderingen. Allergidata (hälsodata under GDPR artikel 9) finns kvar permanent.
**Risk:** GDPR-brott. IMY kan utdöma sanktionsavgift.
**Fix:** Skapa `supabase/functions/cleanup-allergy-data/index.ts` med daglig cron.
**Effort:** S (30 min)

### CR-02: In-memory rate limiting fungerar inte i produktion
**Reporter:** Anders (Security) + Beatrice (Reliability)
**Plats:** `src/app/api/rsvp/route.ts`, `src/app/api/rsvp/edit/route.ts`
**Problem:** Använder JavaScript `Map` som nollställs vid varje serverless-instans/omstart. På Vercel skapas nya instanser per request, vilket gör rate limitern meningslös.
**Risk:** RSVP-spam, allergidata-injektion, DoS.
**Fix:** Ersätt med Upstash Redis (@upstash/ratelimit).
**Effort:** M (1-2h)

### CR-03: XSS/HTML-injektion i e-postmallar
**Reporter:** Anders (Security)
**Plats:** `src/lib/email/resend.ts:82, 162, 209, 214`
**Problem:** Användarinput (`description`, `childName`, `venueName`) sätts direkt i HTML utan escaping. `href="${rsvpUrl}"` kan injiceras med quotes.
**Risk:** HTML/script-injektion via kalas-beskrivning som skickas i e-post till andra föräldrar.
**Fix:** HTML-escapa all användarinput i e-postmallar. Validera/sanitera URL:er.
**Effort:** S (30 min)

### CR-04: Saknade loading states på RSVP-sidan
**Reporter:** Carlos (UX) + Beatrice (Errors)
**Plats:** `src/app/r/[token]/page.tsx`
**Problem:** 99% av trafiken (gäster som scannar QR) ser blank skärm 1-3 sekunder medan invitation, party och responses hämtas. Ingen Suspense boundary eller skeleton UI.
**Risk:** Användare tror appen är trasig och lämnar. Direkt påverkan på OSA-svarsfrekvens.
**Fix:** Lägg till Suspense boundary med skeleton/loading UI.
**Effort:** S (30 min)

### CR-05: Inga error boundaries på dashboard
**Reporter:** Beatrice (Error Handling)
**Plats:** `src/app/(dashboard)/dashboard/page.tsx`
**Problem:** `Promise.all()` utan try/catch. Om en av Supabase-frågorna (invitations, responses) failar kraschar hela dashboarden.
**Risk:** En databas-hicka gör hela appen oanvändbar.
**Fix:** Lägg till error boundaries + try/catch med fallback-UI.
**Effort:** M (1h)

### CR-06: RSVP-deadline kontrolleras inte
**Reporter:** Diana (Product) + Carlos (UX)
**Plats:** `src/app/r/[token]/page.tsx`, `src/app/api/rsvp/route.ts`
**Problem:** `rsvp_deadline` lagras men kontrolleras aldrig. Gäster kan OSA efter deadline.
**Risk:** Förälder sätter deadline, planerar mat baserat på svar, sen kommer fler OSA.
**Fix:** Kontrollera deadline i API + visa "Sista svarsdatum har passerat" i UI.
**Effort:** S (30 min)

### CR-07: Delete account utan error handling
**Reporter:** Beatrice (Error Handling)
**Plats:** `src/app/api/auth/delete-account/route.ts`
**Problem:** Ingen try/catch. Om radering misslyckas kan användaren bli delvis raderad.
**Risk:** Dataintegritetsproblem, oanvändbart konto.
**Fix:** Lägg till try/catch + verifiering att radering lyckades.
**Effort:** S (15 min)

### CR-08: SMS-default är `true` istället för `false`
**Reporter:** Diana (Product) + Erik (Code)
**Plats:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx:171-173`
**Problem:** `smsAllowed` defaultar till `true` om `sms_usage`-frågan misslyckas. Bör fail-closed.
**Risk:** Användare kan skicka obegränsade SMS om databasen inte svarar.
**Fix:** Ändra default till `false`.
**Effort:** S (5 min)

### CR-09: Noll integrations- och E2E-tester
**Reporter:** Erik (Performance/Code)
**Plats:** `tests/integration/`, `tests/e2e/`
**Problem:** 122 unit-tester (utmärkt), men 0 integrationstester och 0 E2E-tester. Playwright konfigurerat men oanvänt. Ingen API-route testas.
**Risk:** Regressioner i RSVP-flödet, auth, CRUD upptäcks inte.
**Fix:** Skriv minst E2E-tester för kärnflödet: registrering → skapa kalas → RSVP → gästlista.
**Effort:** L (4-6h)

---

## High Priority Issues (🟠)

### HI-01: Saknade ownership-checks på 4 API-routes
**Reporter:** Anders (Security)
**Plats:** `/api/invitation/generate`, `select-image`, `select-template`, `upload-photo`
**Problem:** Förlitar sig enbart på RLS utan explicit `party.owner_id === user.id` i kod.
**Fix:** Lägg till explicit ägarkontroll i varje route.
**Effort:** S (30 min)

### HI-02: Allergidata okrypterad i databasen
**Reporter:** Anders (Security)
**Plats:** `allergy_data.allergies` (JSONB)
**Problem:** Hälsodata lagras i klartext. GDPR rekommenderar kryptering för artikel 9-data.
**Fix:** Använd Supabase Vault eller pgcrypto för kolumnkryptering.
**Effort:** M (1.5h)

### HI-03: RSVP UPDATE RLS-policy för bred
**Reporter:** Anders (Security)
**Plats:** Migration `00003`, policy "Anyone can update response"
**Problem:** `USING (true)` tillåter alla att uppdatera alla RSVP-svar. App-lagret validerar edit_token, men RLS bör vara sista försvarslinjen.
**Fix:** Begränsa UPDATE-policy med token-validering via `current_setting()`.
**Effort:** M (1h)

### HI-04: Admin-e-postadresser hårdkodade i källkod
**Reporter:** Anders (Security) + Erik (Code)
**Plats:** `src/lib/constants.ts:23`
**Problem:** `ADMIN_EMAILS = ['klasolsson81@gmail.com', 'zeback_@hotmail.com']` exponerar privilegierade konton.
**Fix:** Flytta till miljövariabel `ADMIN_EMAILS`.
**Effort:** S (15 min)

### HI-05: Admin-client saknar server-only guard
**Reporter:** Anders (Security)
**Plats:** `src/lib/supabase/admin.ts`
**Problem:** Kan av misstag importeras i klient-kod, vilket exponerar service role key.
**Fix:** Lägg till `if (typeof window !== 'undefined') throw new Error('Server-only')`.
**Effort:** S (5 min)

### HI-06: Ingen timeout på externa API-anrop
**Reporter:** Beatrice (Reliability)
**Plats:** `src/lib/ai/replicate.ts`, `openai.ts`, `src/lib/sms/elks.ts`
**Problem:** Om Replicate/OpenAI/46elks hänger väntar servern i evighet.
**Fix:** Lägg till AbortController med 30s timeout.
**Effort:** S (30 min)

### HI-07: OpenAI-response valideras inte
**Reporter:** Beatrice (Reliability) + Erik (Code)
**Plats:** `src/lib/ai/openai.ts:40`
**Problem:** `data.data[0].url` antas existera utan validering. Kraschar om API-svaret ändras.
**Fix:** Lägg till Zod-schema för API-response.
**Effort:** S (15 min)

### HI-08: E-postutskick saknar felhantering
**Reporter:** Beatrice (Reliability)
**Plats:** `src/lib/email/resend.ts:100-105, 225-232`
**Problem:** Misslyckade e-postutskick ignoreras tyst. Användaren vet inte om inbjudan skickades.
**Fix:** Returnera status till anroparen, visa feedback i UI.
**Effort:** M (1h)

### HI-09: SMS API-response ovaliderad
**Reporter:** Beatrice (Reliability)
**Plats:** `src/lib/sms/elks.ts:87`
**Problem:** `response.json() as ElksResponse` utan verifiering.
**Fix:** Lägg till Zod-validering av 46elks-svaret.
**Effort:** S (15 min)

### HI-10: Filuppladdning valideras bara client-side
**Reporter:** Erik (Code) + Anders (Security)
**Plats:** `src/app/(dashboard)/kalas/[id]/PhotoUploadSection.tsx`
**Problem:** Filtyp och storlek kontrolleras bara i webbläsaren. Servern accepterar vad som helst.
**Fix:** Lägg till server-side validering i upload-photo routes.
**Effort:** S (30 min)

### HI-11: GuestListRealtime minnesläcka
**Reporter:** Erik (Performance)
**Plats:** `src/app/(dashboard)/kalas/[id]/guests/GuestListRealtime.tsx`
**Problem:** `fetchGuests` återskapas vid varje render. Realtime-subscription saknar `useCallback`.
**Risk:** Minnesanvändning ökar över tid.
**Fix:** Wrappa i `useCallback`, extrahera subkomponenter.
**Effort:** M (1h)

### HI-12: Saknade Zod-scheman på 2 routes
**Reporter:** Anders (Security)
**Plats:** `/api/invitation/select-image`, `/api/invitation/select-template`
**Problem:** Manuell strängvalidering istället för Zod.
**Fix:** Skapa Zod-scheman och använd `.safeParse()`.
**Effort:** S (20 min)

---

## Medium Priority Issues (🟡)

### MI-01: Saknade ARIA-attribut och tillgänglighetsluckor
**Reporter:** Carlos (A11y)
- Felmeddelanden saknar `aria-live="polite"` (ej upplästa av skärmläsare)
- QR-kod saknar alt-text/tillgänglighetsattribut
- Modul-fokus kan lämna FooterModal via Tab
- Sliders/knappar i PhotoCropDialog saknar `aria-label`
- `aria-required` saknas på obligatoriska fält
**Effort:** M (2h totalt)

### MI-02: Generiska 404 på publika sidor
**Reporter:** Carlos (UX) + Beatrice (Errors)
**Plats:** `src/app/r/[token]/page.tsx`, `edit/page.tsx`
**Problem:** `notFound()` ger generic 404 utan kontext. Bör visa "Ogiltig eller utgången inbjudan".
**Effort:** S (20 min)

### MI-03: Saknade loading states på dashboard och kalassida
**Reporter:** Carlos (UX)
**Plats:** Dashboard, `/kalas/[id]`
**Problem:** Inga skeleton loaders medan data hämtas.
**Effort:** M (1-2h)

### MI-04: Base64-bilder i databasen
**Reporter:** Erik (Performance)
**Plats:** `upload-photo` endpoints
**Problem:** ~100KB base64-strängar direkt i PostgreSQL. Orsakar onödig databasbelastning.
**Fix:** Migrera till Supabase Storage med filreferenser.
**Effort:** L (3-4h)

### MI-05: SMS-kvotlogik förvirrande och exploaterbar
**Reporter:** Anders (Security) + Diana (Product)
**Plats:** `/api/invitation/send-sms`
**Problem:** "En SMS-party per månad" — om användaren raderar partyt kan de inte SMS:a till nytt.
**Effort:** M (1h)

### MI-06: Ingen per-user rate limiting på AI-generering
**Reporter:** Erik (Performance)
**Plats:** `/api/invitation/generate`
**Problem:** Bara per-party-limit (5 bilder). Användare kan tömma Replicate-kvot.
**Effort:** S (30 min)

### MI-07: Inga säkerhetsloggar
**Reporter:** Anders (Security)
**Plats:** Generellt
**Problem:** Middleware-redirects, misslyckade inloggningar, raderade konton loggas inte.
**Effort:** M (1h)

### MI-08: InvitationSection för stor (400 rader, 11 state-variabler)
**Reporter:** Erik (Code Quality)
**Plats:** `src/app/(dashboard)/kalas/[id]/InvitationSection.tsx`
**Problem:** Bryter SRP, svår att testa och underhålla.
**Fix:** Dela upp i InvitationModeSelector + InvitationImagePicker.
**Effort:** M (2h)

### MI-09: GDPR-samtycke kontrolleras inte före allergidata visas
**Reporter:** Anders (GDPR) + Diana (Product)
**Plats:** Guest list page
**Problem:** Allergidata visas utan att verifiera `consent_given_at`.
**Effort:** S (15 min)

### MI-10: DeletePartyButton använder `confirm()`
**Reporter:** Fiona (UI) + Carlos (A11y)
**Plats:** `DeletePartyButton.tsx`
**Problem:** Deprecated browser-dialog, ingen felhantering.
**Fix:** Använd proper Modal-komponent.
**Effort:** S (30 min)

---

## Low Priority Issues (🟢)

### LO-01: Visuella inkonsekvenser
**Reporter:** Fiona (UI)
- QR-bakgrund opacity varierar (`bg-white/90` vs `bg-white`)
- TemplatePicker använder `blue-500` istf primärfärg
- Textarea i RsvpForm har inline CSS, matchar inte Input-komponent
- Character counter-styling inkonsekvent

### LO-02: SEO-domän hårdkodad
**Reporter:** Erik (Code)
- `kalaskoll.se` hårdkodat i `layout.tsx`. Bör använda `NEXT_PUBLIC_APP_URL`.

### LO-03: CI/CD-luckor
**Reporter:** Erik (Code)
- Ingen code coverage-rapportering
- E2E-tester körs inte i CI
- Inget deployment-steg

### LO-04: Saknade index (låg påverkan)
**Reporter:** Erik (Performance)
- `parties(owner_id, party_date)` för dashboard-sortering

### LO-05: Magic numbers utan kommentarer
**Reporter:** Erik (Code)
- Bezier-konstant (0.5523), stjärnradie (0.38), procentsatser i PhotoCropDialog

### LO-06: Ohanterande lint-varningar
**Reporter:** Erik (Code)
- 2 `no-unused-vars` warnings i `rsvp-validation.test.ts`

---

## Enhancement Suggestions (🔵)

### EN-01: Toast-notifikationer för alla actions
Ge användaren feedback vid sparande, raderande, e-post/SMS-utskick.

### EN-02: Exportera gästlista (CSV/PDF)
Klas vill kunna skriva ut gästlista med allergier.

### EN-03: Retry-mekanismer för misslyckade API-anrop
Exponential backoff för Replicate, OpenAI, 46elks, Resend.

### EN-04: Suspense boundaries på alla server-komponenter
Progressiv laddning istället för allt-eller-inget.

### EN-05: Dark mode
Efterfrågas ofta men inte MVP-kritiskt.

### EN-06: Migrera bilder till Supabase Storage
Bättre prestanda, CDN-cache, och lägre databasbelastning.

### EN-07: Haptic feedback på mobil
`navigator.vibrate()` vid lyckad OSA.

---

## Per-Reviewer Detailed Findings

### 🔐 Anders (Security)

**Styrkor:**
- RLS aktiverat på alla 9 tabeller
- Separerad hälsodata-tabell (GDPR best practice)
- 256-bit kryptografiska edit-tokens
- Zod-validering på 9 av 11 API-routes
- Inga secrets i källkod (utom admin-e-post)
- Supabase hanterar SQL injection

**Svagheter:**
- In-memory rate limiting (CR-02)
- XSS i e-postmallar (CR-03)
- RSVP UPDATE RLS `USING(true)` (HI-03)
- Admin-e-post i källkod (HI-04)
- Ingen server-only guard på admin-client (HI-05)
- Ingen kryptering av hälsodata (HI-02)

**Slutsats:** Grundstrukturen är säker, men 3 kritiska och 5 höga problem måste fixas.

---

### 🚨 Beatrice (Error Handling & Reliability)

**Styrkor:**
- Fire-and-forget mönster för e-post (RSVP sparas även om e-post failar)
- Konsekvent JSON-format på API-felmeddelanden
- ErrorBoundary-komponent finns
- SubmitButton med loading state

**Svagheter:**
- Ingen loading state på RSVP-sida (CR-04)
- Ingen error boundary på dashboard (CR-05)
- Delete account utan try/catch (CR-07)
- Ingen timeout på externa anrop (HI-06)
- E-post/SMS-fel ignoreras tyst (HI-08, HI-09)
- OpenAI-response ovaliderad (HI-07)

**Slutsats:** Grundläggande felhantering finns, men saknas på de mest kritiska ställena.

---

### 📱 Carlos (UX & Accessibility)

**Styrkor:**
- Mobile-first design genomgående
- Bra responsiva breakpoints (sm/lg)
- Semantisk HTML (header, main, section)
- Touch targets generellt tillräckliga
- Viewport korrekt konfigurerad

**Svagheter:**
- Saknade ARIA-attribut på formulär (MI-01)
- Generisk 404 på publika sidor (MI-02)
- Inga loading skeletons (CR-04, MI-03)
- Ofullständig fokus-fälla i modaler (MI-01)
- QR-kod otillgänglig för skärmläsare (MI-01)

**Slutsats:** Bra grund men behöver tillgänglighetsarbete för WCAG 2.1 AA.

---

### 📋 Diana (Product / Feature Completeness)

**MVP Core Flow — Status:**

| Funktion | Status | Notering |
|----------|--------|----------|
| Registrering + verifiering | ✅ Fungerar | |
| Login/logout | ✅ Fungerar | |
| Skapa kalas | ✅ Fungerar | |
| Välj inbjudningsmall | ✅ Fungerar | 9 mallar |
| Se QR-kod | ✅ Fungerar | |
| Skriva ut inbjudan | ✅ Fungerar | |
| RSVP via QR (mobil) | ⚠️ Fungerar men... | Saknar deadline-check, dålig loading |
| Se gästlista | ✅ Fungerar | Realtid |
| Redigera kalas | ✅ Fungerar | |
| Ta bort kalas | ⚠️ Fungerar men... | `confirm()` dialog, ingen felhantering |

**Blockers för Klas kalas 27 mars:**
1. RSVP-deadline måste kontrolleras (CR-06)
2. RSVP-sidan behöver loading state (CR-04)
3. Generiska felmeddelanden på QR-scan (MI-02)

**Slutsats:** Kärnflödet fungerar. 3 issues blockerar en bra användarupplevelse.

---

### ⚡ Erik (Performance & Code Quality)

**Styrkor:**
- TypeScript strict mode aktiverat
- Konsekvent namnkonvention
- Bra Zod-scheman med 122 unit-tester
- Tailwind plugin i Prettier
- Path aliases korrekt konfigurerade

**Svagheter:**
- 0 integrationstester, 0 E2E-tester (CR-09)
- InvitationSection 400 rader, 11 state-variabler (MI-08)
- GuestListRealtime 464 rader, minnesläcka (HI-11)
- Base64-bilder i databasen (MI-04)
- CI kör inte E2E-tester (LO-03)

**Slutsats:** Bra kodkvalitet men testpyramiden är inverterad och 2 komponenter behöver refaktorering.

---

### 🎨 Fiona (UI/Visual Design)

**Styrkor:**
- Konsekvent "Festlig Skandinavisk Minimalism" designspråk
- shadow-soft/shadow-warm konsekvent applicerade
- 9 visuellt distinkta inbjudningsmallar
- Print-styles implementerade
- Confetti-animationer vid framgång
- Professionell footer med modaler

**Svagheter:**
- Visuella inkonsekvenser i QR-bakgrund och TemplatePicker (LO-01)
- Inga bild-fallbacks vid laddningsfel
- DeletePartyButton använder browser-`confirm()` (MI-10)
- SubmitButton visar text istf spinner
- Ingen 404-sida med branding

**Slutsats:** Visuellt professionell med några polerings-möjligheter.

---

## Team Meeting Simulation

**Anders (Security):** "De tre viktigaste problemen är GDPR auto-delete, rate limiting och XSS i e-postmallar. Utan dessa kan vi inte lansera med gott samvete."

**Beatrice (Errors):** "Jag håller med Anders. Dessutom — RSVP-sidan är den viktigaste sidan i hela appen och den har varken loading state eller bra felmeddelanden. Det är det första gästerna möter."

**Carlos (UX):** "Exakt. 99% av trafiken landar på RSVP via QR. Om den sidan känns trasig eller långsam tappar vi gäster direkt. Loading skeleton + bra felmeddelande vid ogiltig QR = högsta prioritet."

**Diana (Product):** "Kan Klas använda detta 27 mars? Ja, med reservationer. Kärnflödet fungerar, men tre saker blockerar en bra upplevelse: deadline-check, loading state och felmeddelanden. SMS-defaulten till `true` är farlig — det kan bli dyrt."

**Erik (Code):** "Tekniskt sett är koden välstrukturerad. Min största oro är att vi har noll integrationstester. Om vi ändrar en API-route och nåt går sönder har vi inget skyddsnät. Jag vill se åtminstone happy-path E2E-tester för RSVP-flödet."

**Fiona (UI):** "Visuellt är jag nöjd. Mallarna ser bra ut, print fungerar, och footern med policyer ger ett professionellt intryck. Jag vill fixa bild-fallbacks och byta ut `confirm()`-dialogen, men det blockerar inte MVP."

**Teamet enas:** Fixa CR-01 till CR-08 innan launch. CR-09 (tester) är önskvärt men inte en hård blocker om vi manuellt testar kärnflödet.

---

## Prioritized Action Plan

### Fas 1: Kritiska säkerhetsfixar (före lansering)
1. **CR-01** — Implementera allergy data auto-delete Edge Function (S)
2. **CR-02** — Ersätt in-memory rate limiting med Upstash Redis (M)
3. **CR-03** — HTML-escapa all användarinput i e-postmallar (S)
4. **CR-08** — Ändra SMS-default till `false` (S)
5. **HI-04** — Flytta admin-e-post till miljövariabel (S)
6. **HI-05** — Lägg till server-only guard på admin-client (S)

### Fas 2: Kritisk UX (före lansering)
7. **CR-04** — Loading state/skeleton på RSVP-sida (S)
8. **CR-06** — Implementera RSVP-deadline-kontroll (S)
9. **CR-07** — Error handling på delete account (S)
10. **MI-02** — Byt generisk 404 till hjälpsamt meddelande på publika sidor (S)
11. **CR-05** — Error boundaries på dashboard (M)

### Fas 3: Höga issues (före lansering om tid finns)
12. **HI-01** — Ownership-checks på 4 API-routes (S)
13. **HI-06** — Timeout på externa API-anrop (S)
14. **HI-07** — Zod-validering av OpenAI-response (S)
15. **HI-10** — Server-side filvalidering (S)
16. **HI-12** — Zod-scheman på select-image/select-template (S)

### Fas 4: Efter MVP
17. **HI-02** — Kryptera allergidata (M)
18. **HI-03** — Strama åt RSVP UPDATE RLS (M)
19. **HI-11** — Fixa minnesläcka i GuestListRealtime (M)
20. **CR-09** — Skriv integrations- och E2E-tester (L)
21. **MI-04** — Migrera base64-bilder till Supabase Storage (L)
22. **MI-08** — Refaktorera InvitationSection (M)

---

## Sign-off

**Projektet är INTE redo för MVP i nuvarande skick**, men det är nära.

**Vad som krävs:**
- **Fas 1 + Fas 2** (11 items, mestadels S-effort) = uppskattningsvis fokuserat arbete
- Alla CR-items utom CR-09 måste fixas
- CR-09 (tester) kan kompenseras med manuell testning av kärnflödet

**Efter Fas 1+2 är projektet redo för MVP.**

Grundstrukturen är stark: bra arkitektur, korrekt databasdesign, konsekvent kodstil. De problem vi hittat är fixbara och typiska för ett projekt i denna fas. Med de rekommenderade fixarna kommer Klas kunna använda KalasKoll tryggt för Alexanders kalas den 27 mars.

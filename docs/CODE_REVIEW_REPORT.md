# KalasKoll Code Review Report

**Datum:** 2026-02-14
**Reviewers:** Anders (Security), Beatrice (Error Handling), Carlos (UX/A11y), Diana (Product), Erik (Performance), Fiona (UI/Design)
**Projekt-version:** `4fe89f4` (main)
**MVP-deadline:** 27 mars 2026

---

## Executive Summary

KalasKoll ar en **valbyggd och funktionellt komplett** MVP med solid arkitektur, stark GDPR-implementation och professionell UI. Alla karnfloden (registrering, skapa kalas, RSVP, gastlista) fungerar. Vi identifierade **6 CRITICAL**, **8 HIGH**, **14 MEDIUM** och **12 LOW/ENHANCEMENT** issues. De kritiska problemen handlar om felhantering, GDPR auto-delete, och SMS fail-open — alla fixbara pa 3-4 timmar.

**Bedomning: Projektet ar REDO for MVP efter att CRITICAL issues fixats.**

---

## Critical Issues (6 st)

### C1. Allergidata krypterings-fallback till klartext (GDPR)
**Reviewer:** Anders (Security) + Beatrice (Errors)
**Fil:** `src/lib/utils/crypto.ts:54-71`
**Problem:** Om `ALLERGY_ENCRYPTION_KEY` saknas lagras allergidata okrypterat — GDPR-brott for halsodata.
**Fix:** Kasta fel i produktion istallet for fallback. `if (process.env.NODE_ENV === 'production') throw new Error('ALLERGY_ENCRYPTION_KEY required');`
**Effort:** S (15 min)

### C2. Allergidata auto-delete saknas
**Reviewer:** Diana (Product) + Anders (Security)
**Fil:** Saknas (`supabase/functions/cleanup-allergy-data/`)
**Problem:** `auto_delete_at` falt finns men ingen cron-funktion raderar data. Allergidata lagras permanent = GDPR-brott.
**Fix:** Skapa Next.js cron-route (`/api/cron/cleanup-allergy`) som dagligen raderar rader dar `auto_delete_at < NOW()`.
**Effort:** M (30 min)

### C3. Dashboard saknar error boundary
**Reviewer:** Beatrice (Errors) + Diana (Product)
**Fil:** `src/app/(dashboard)/dashboard/page.tsx:53`
**Problem:** `Promise.all()` utan try/catch — om Supabase-query misslyckas kraschar hela dashboarden.
**Fix:** Wrappa i try/catch, visa fallback-UI.
**Effort:** S (15 min)

### C4. SMS fail-open vid DB-fel
**Reviewer:** Diana (Product)
**Fil:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx`
**Problem:** `smsAllowed ?? true` — om kvotcheck misslyckas tillats obegransade SMS (kostnad!).
**Fix:** Andra till `?? false` (fail-closed).
**Effort:** S (5 min)

### C5. Tyst allergy insert-failure i RSVP
**Reviewer:** Beatrice (Errors)
**Fil:** `src/app/api/rsvp/route.ts:162-169`
**Problem:** Allergidata-insert saknar felkontroll — om insert misslyckas returneras anda success, data forloras.
**Fix:** Lagg till `{ error }` check efter insert.
**Effort:** S (15 min)

### C6. Kontoradering ignorerar fel
**Reviewer:** Diana (Product) + Beatrice (Errors)
**Fil:** `src/app/(dashboard)/ProfileDropdown.tsx:38-44` + `src/app/api/auth/delete-account/route.ts`
**Problem:** `catch { }` — fetch-fel ignoreras tyst. Konto kan bli halvraderat.
**Fix:** Visa felmeddelande, lagg till try/catch i API-routen.
**Effort:** S (15 min)

---

## High Priority Issues (8 st)

### H1. Rate limiting fail-open vid Redis-fel
**Reviewer:** Anders (Security)
**Fil:** `src/lib/utils/rate-limit.ts:40-45`
**Problem:** Om Upstash Redis ar nere tillats alla requests obegransat.
**Fix:** Logga varning, overvag att blocka vid Redis-fel i produktion.
**Effort:** S (15 min)

### H2. Saknar error.tsx och not-found.tsx
**Reviewer:** Beatrice (Errors) + Fiona (UI)
**Filer:** Saknas i `src/app/`
**Problem:** Vid crash eller 404 visas Next.js standardsida — bryter varumarke.
**Fix:** Skapa brandade `error.tsx` och `not-found.tsx`.
**Effort:** S (30 min)

### H3. HMAC-signering anvander service role key
**Reviewer:** Anders (Security)
**Fil:** `src/app/api/admin/invite/route.ts:16-22`
**Problem:** `SUPABASE_SERVICE_ROLE_KEY` anvands som HMAC-nyckel for invite-signering — blandar syften.
**Fix:** Skapa separat `INVITE_SIGNING_SECRET`.
**Effort:** S (20 min)

### H4. Saknar felkontroll i RSVP edit-endpoint
**Reviewer:** Beatrice (Errors)
**Fil:** `src/app/api/rsvp/edit/route.ts:197-223`
**Problem:** Flera DB-operationer (update, delete, insert) utan felkontroll.
**Fix:** Lagg till `{ error }` check efter varje operation.
**Effort:** S (15 min)

### H5. SMS-credentials check pa fel niva
**Reviewer:** Beatrice (Errors)
**Fil:** `src/lib/sms/elks.ts:64-70`
**Problem:** Kastar generiskt Error istallet for HTTP 503 pa API-route-niva.
**Fix:** Kontrollera credentials i route och returnera `{ error: 'SMS inte konfigurerat' }`.
**Effort:** S (10 min)

### H6. RSVP-sidan saknar loading.tsx
**Reviewer:** Diana (Product) + Carlos (UX)
**Fil:** `src/app/r/[token]/loading.tsx` (saknas)
**Problem:** Gaster ser tom sida 1-3 sekunder efter QR-scan — ser trasigt ut.
**Fix:** Skapa skeleton-loader for RSVP-sidan.
**Effort:** S (20 min)

### H7. Extern API timeout saknas
**Reviewer:** Diana (Product) + Beatrice (Errors)
**Filer:** `src/lib/ai/replicate.ts`, `src/lib/ai/openai.ts`
**Problem:** AI-generering kan hanga utan timeout pa OpenAI-fallback.
**Fix:** Lagg till AbortController med 30s timeout.
**Effort:** S (20 min)

### H8. Inkonsekvent HTTP-felmeddelanden (SV/EN)
**Reviewer:** Beatrice (Errors)
**Filer:** Flera API-routes
**Problem:** Vissa returnerar "Unauthorized" (engelska), andra "Ej inloggad" (svenska).
**Fix:** Standardisera alla anvandarvanda fel till svenska.
**Effort:** S (20 min)

---

## Medium Priority Issues (14 st)

### M1. Toggle-knappar saknar aria-label
**Reviewer:** Carlos (UX)
**Fil:** `src/components/forms/RsvpForm.tsx:229-254`
**Fix:** Lagg till `aria-label="Ja, vi kommer pa kalaset"`.

### M2. Multi-child knappar for sma for touch (< 44x44px)
**Reviewer:** Carlos (UX)
**Fil:** `src/components/forms/RsvpForm.tsx:329-352`
**Fix:** Oka padding fran `p-2` till `p-3`.

### M3. Felmeddelanden ej lankade till falt
**Reviewer:** Carlos (UX)
**Fil:** `src/components/forms/RsvpForm.tsx:218-220`
**Fix:** Lagg till `aria-describedby` och `aria-invalid`.

### M4. Allergi-consent saknar visuell kravmarkering
**Reviewer:** Carlos (UX)
**Fil:** `src/components/forms/AllergyCheckboxes.tsx:69-84`
**Fix:** Lagg till visuell `*` markering.

### M5. Dashboard N+1 query-monster
**Reviewer:** Erik (Performance)
**Fil:** `src/app/(dashboard)/dashboard/page.tsx:46-103`
**Fix:** Kombinera 4 sekventiella queries till 2 med JOINs. Uppskattad 50-70% laddtidsforbattring.

### M6. Impersonation-cookie 1h (for lang)
**Reviewer:** Anders (Security)
**Fil:** `src/app/api/admin/impersonate/route.ts:27`
**Fix:** Sank till 15-30 min for kanslliga admin-operationer.

### M7. Dekrypterings-failure returnerar tom array tyst
**Reviewer:** Beatrice (Errors)
**Fil:** `src/lib/utils/crypto.ts:93-104`
**Fix:** Logga och flagga `decryptionFailed: true`.

### M8. Email-URL ej escaped
**Reviewer:** Beatrice (Errors)
**Fil:** `src/lib/email/resend.ts:104`
**Fix:** `encodeURIComponent(primaryEditToken)`.

### M9. Fire-and-forget email utan retry
**Reviewer:** Beatrice (Errors)
**Fil:** `src/app/api/rsvp/route.ts:177-189`
**Fix:** Returnera `emailSent: false` i svaret vid fel.

### M10. Toggle-knappar saknar focus-visible ring
**Reviewer:** Fiona (UI)
**Fil:** `src/components/forms/RsvpForm.tsx:228-255`
**Fix:** Lagg till `focus-visible:ring-ring/50 focus-visible:ring-[3px]`.

### M11. Favicon gron vs primarfarg bla
**Reviewer:** Fiona (UI)
**Fil:** `src/app/icon.tsx`
**Fix:** Uppdatera favicon till primart bla fran designsystemet.

### M12. Text-shadow saknas pa 5 av 9 mallar
**Reviewer:** Fiona (UI)
**Fil:** `src/components/templates/theme-configs.ts`
**Fix:** Lagg till text-shadow pa mallar med lag kontrast (Dinosaurier, Prinsessor, Enhorningar, Klassiskt, Pirater).

### M13. SubmitButton saknar aria-busy
**Reviewer:** Carlos (UX)
**Fil:** `src/components/forms/SubmitButton.tsx`
**Fix:** Lagg till `aria-busy={pending}`.

### M14. Select(*) queries pa 13 stallen
**Reviewer:** Erik (Performance)
**Filer:** Flera hooks och pages
**Fix:** Specificera kolumner istallet for `select('*')`.

---

## Low Priority Issues (8 st)

| # | Issue | Fil |
|---|-------|-----|
| L1 | LoginForm saknar autoFocus pa email | `login/LoginForm.tsx:45` |
| L2 | Loading spinner saknar aria-label | `r/[token]/loading.tsx` |
| L3 | Kod-duplicering: telefon-normalisering x3 | Flera filer |
| L4 | Textarea byter font-size pa desktop (md:text-sm) | `RsvpForm.tsx:420` |
| L5 | RSVP success saknar focus management | `RsvpForm.tsx:179-213` |
| L6 | Partysida 370 rader — kan delas upp | `kalas/[id]/page.tsx` |
| L7 | Knappstorlekar inkonsekvent (h-10/11/12/14) | Flera |
| L8 | SMS-fel regex-baserad parsning | `send-sms/route.ts:134` |

---

## Enhancement Suggestions (4 st)

| # | Forslag | Effort |
|---|---------|--------|
| E1 | Beta-system cleanup (ta bort demo-kod) | M |
| E2 | Integrationstester for API-routes | L |
| E3 | React cache() for RSVP metadata queries | S |
| E4 | Onboarding for forstagangare pa dashboard | M |

---

## Per-Reviewer Bedomning

| Reviewer | Omrade | Betyg | Styrkor | Svagheter |
|----------|--------|-------|---------|-----------|
| Anders | Security | 8/10 | RLS, kryptering, Zod, audit log | Krypto-fallback, HMAC-nyckel, rate limit |
| Beatrice | Errors | 6/10 | Konsekvent JSON-format, Zod | Tysta failures, saknar error boundaries |
| Carlos | UX/A11y | 7/10 | Kontrast, focus-visible, reduced-motion | aria-labels, touch targets |
| Diana | Product | 9/10 | Komplett funktionalitet, multi-child | GDPR auto-delete, SMS fail-open |
| Erik | Performance | 7/10 | Server-renderad RSVP, ren kodbas | N+1 queries, select(*) |
| Fiona | UI/Design | 9/10 | Glass-morphism, 3D, mallar, print | Favicon-farg, text-shadow |

---

## Prioritized Action Plan

### Fas 1: CRITICAL (fore lansering, ~2 timmar)
1. C4 — SMS default false (5 min)
2. C5 — Allergy insert felkontroll (15 min)
3. C6 — Kontoradering felhantering (15 min)
4. C1 — Kryptering: kasta fel i prod (15 min)
5. C3 — Dashboard error boundary (15 min)
6. C2 — Allergidata auto-delete cron (30 min)

### Fas 2: HIGH (fore lansering, ~2 timmar)
7. H2 — error.tsx + not-found.tsx (30 min)
8. H6 — RSVP loading.tsx (20 min)
9. H1 — Rate limit logga vid disable (15 min)
10. H4 — RSVP edit felkontroll (15 min)
11. H8 — Standardisera felmeddelanden till SV (20 min)
12. H7 — API timeouts (20 min)

### Fas 3: MEDIUM (efter lansering, 1-2 veckor)
13-26. Accessibility, performance, UI polish

### Fas 4: LOW/ENHANCEMENT (backlog)
27+. Sma forbattringar och framtida arbete

---

## Sign-off

### Teamets gemensamma bedomning:

**Projektet ar REDO for MVP efter att Critical-issues fixats (6 st, ~2 timmar).**

KalasKoll har en stark teknisk grund med komplett funktionalitet, solid sakerhet, professionell UI och bra mobil-UX. De kritiska problemen ar alla enkla att fixa och blockerar inte arkitekturen.

**Konfidensgrad med fixar: 95%**
**Konfidensgrad utan fixar: 70%**

---

*Rapport genererad 2026-02-14 av review-teamet.*

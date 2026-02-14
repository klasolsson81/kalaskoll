# Tech Debt Log — KalasKoll

**Datum:** 2026-02-14

> Issues som kan vanta men bor dokumenteras for framtida arbete.

---

## Performance

### TD1. Dashboard N+1 query-monster
**Fil:** `src/app/(dashboard)/dashboard/page.tsx:46-103`
**Problem:** 4 sekventiella queries (parties, children, invitations, responses).
**Fix:** Kombinera till 2 queries med JOINs. Uppskattad 50-70% laddtidsforbattring.
**Effort:** M

### TD2. Select(*) overanvandning
**Filer:** 13 stallen med `.select('*')`
**Problem:** Hamtar alla kolumner nar bara nagra behover.
**Fix:** Specificera kolumner i varje query.
**Effort:** M

### TD3. RSVP page duplicerar metadata-queries
**Fil:** `src/app/r/[token]/page.tsx`
**Problem:** generateMetadata och page-render kor samma queries.
**Fix:** Anvand React `cache()` for att deduplicera.
**Effort:** S

### TD4. Partysida 370+ rader
**Fil:** `src/app/(dashboard)/kalas/[id]/page.tsx`
**Problem:** Stor komponent, svar att underhalla.
**Fix:** Extrahera till sub-komponenter (DetailsCard, ShareSection).
**Effort:** M

---

## Kodkvalitet

### TD5. Telefon-normalisering duplicerad x3
**Filer:** `kalas/[id]/page.tsx`, `guests/page.tsx`, `validation.ts`
**Problem:** Samma normalizePhone-logik pa tre stallen.
**Fix:** Extrahera till `src/lib/utils/phone.ts`.
**Effort:** S

### TD6. Inkonsekvent knappstorlekar
**Filer:** Flera formularsidor
**Problem:** h-10, h-11, h-12, h-14 pa submit-knappar utan system.
**Fix:** Standardisera via shared SubmitButton props.
**Effort:** S

### TD7. SMS-fel regex-baserad parsning
**Fil:** `src/app/api/invitation/send-sms/route.ts:134-175`
**Problem:** Felmeddelanden fran 46elks parsas med regex — fragilt.
**Fix:** Strukturerad error-objekt istallet.
**Effort:** S

### TD8. HMAC-nyckel delar syfte med service role key
**Fil:** `src/app/api/admin/invite/route.ts:16-22`
**Problem:** SUPABASE_SERVICE_ROLE_KEY anvands for bade DB-access och HMAC-signering.
**Fix:** Separat INVITE_SIGNING_SECRET.
**Effort:** S

---

## Beta/Demo-kod att rensa

### TD9. Beta-system cleanup
**Filer:** Se CLAUDE.md "Ta bort vid demo-avslut"
**Problem:** Beta-specifik kod (BetaBanner, BetaRegisterForm, beta-config, useBetaStatus, waitlist) ska bort nar demo avslutas.
**Effort:** M (2 timmar)

---

## Tester

### TD10. Saknar integrationstester for API-routes
**Nuvarande:** 153 unit-tester, 41 E2E
**Saknas:** Tester for RSVP API, invitation API, auth API
**Effort:** L (4+ timmar)

### TD11. E2E-tackning for dashboard-floden
**Saknas:** Party creation, editing, guest list, admin features
**Effort:** L (4+ timmar)

---

## Sakerhet

### TD12. Impersonation-cookie 1h expiry
**Fil:** `src/app/api/admin/impersonate/route.ts:27`
**Problem:** 1 timmes giltighetstid for kansllig admin-operation.
**Fix:** Sank till 15-30 min.
**Effort:** S

### TD13. Rate limit fail-open
**Fil:** `src/lib/utils/rate-limit.ts:40-45`
**Problem:** Vid Redis-failure tillats alla requests.
**Fix:** Overvag fail-closed i produktion.
**Effort:** S

---

## UI/Design

### TD14. Favicon-farg matchar inte primarfarg
**Fil:** `src/app/icon.tsx`
**Problem:** Gron favicon (#10b981) vs bla primarfarg i designsystemet.
**Fix:** Uppdatera till primart bla.
**Effort:** S

### TD15. Text-shadow inkonsekvent pa mallar
**Fil:** `src/components/templates/theme-configs.ts`
**Problem:** 4 av 9 mallar har text-shadow, 5 saknar det.
**Fix:** Lagg till pa mallar med lagkontrastbakgrund.
**Effort:** S

---

## Prioritering

| Prioritet | Issues | Effort |
|-----------|--------|--------|
| Sprint 1 (efter MVP) | TD1, TD5, TD8, TD12, TD13, TD14 | ~3h |
| Sprint 2 | TD2, TD3, TD6, TD7, TD15 | ~4h |
| Sprint 3 | TD4, TD9 | ~4h |
| Backlog | TD10, TD11 | ~8h+ |

---

*Genererad 2026-02-14*

# MVP Blockers — KalasKoll

**Datum:** 2026-01-31
**MVP-deadline:** 27 mars 2026
**Kontext:** Issues som MÅSTE fixas innan Klas använder appen för Alexanders kalas.

---

## Sammanfattning

**8 blockers** identifierade. De flesta är snabba fixar (S = under 30 min).
Total estimerad effort: ~6-8 timmar.

---

## 🔴 MUST FIX — Säkerhet & GDPR

### 1. Implementera allergy data auto-delete
**Fil:** `supabase/functions/cleanup-allergy-data/index.ts` (skapa ny)
**Problem:** Allergidata (hälsodata, GDPR art. 9) raderas aldrig trots att `auto_delete_at` finns i schemat. Ingen Edge Function existerar.
**Fix:** Skapa Edge Function med daglig cron som raderar rader där `auto_delete_at < NOW()`.
**Effort:** S
**Varför blocker:** GDPR-krav. Utan detta lagrar vi hälsodata permanent utan laglig grund.

### 2. Ersätt in-memory rate limiting med persistent lösning
**Fil:** `src/app/api/rsvp/route.ts`, `src/app/api/rsvp/edit/route.ts`
**Problem:** JavaScript `Map` nollställs vid varje serverless cold start. Meningslöst på Vercel.
**Fix:** Installera `@upstash/ratelimit` + `@upstash/redis`. Skapa gratis Upstash-konto.
**Effort:** M
**Varför blocker:** Utan fungerande rate limiting kan vem som helst spamma RSVP-formuläret.

### 3. HTML-escapa användarinput i e-postmallar
**Fil:** `src/lib/email/resend.ts`
**Problem:** `${description}`, `${childName}`, `${venueName}` injiceras rakt in i HTML.
**Fix:** Skapa `escapeHtml()` utility och applicera på alla användarinput i e-postmallar.
**Effort:** S
**Varför blocker:** En förälder kan (avsiktligt eller oavsiktligt) injicera HTML/script i sin kalasbeskrivning som skickas till andras barns föräldrar.

### 4. Ändra SMS-default till `false`
**Fil:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx:171-173`
**Problem:** `smsAllowed` defaultar till `true` om databasen inte svarar. Fail-open.
**Fix:** Ändra `?? true` till `?? false`.
**Effort:** S (5 min)
**Varför blocker:** Om Supabase-frågan misslyckas kan obegränsade SMS skickas (kostar pengar).

---

## 🔴 MUST FIX — Användarupplevelse

### 5. Loading state på RSVP-sidan
**Fil:** `src/app/r/[token]/page.tsx`
**Problem:** Gäster som scannar QR-koden ser en blank skärm i 1-3 sekunder.
**Fix:** Lägg till `loading.tsx` med skeleton UI eller Suspense boundary.
**Effort:** S
**Varför blocker:** RSVP-sidan är den enda sidan 99% av gästerna ser. Blank skärm = "appen funkar inte".

### 6. Implementera RSVP-deadline-kontroll
**Fil:** `src/app/r/[token]/page.tsx` + `src/app/api/rsvp/route.ts`
**Problem:** `rsvp_deadline` lagras men kontrolleras aldrig. Gäster kan svara efter deadline.
**Fix:** (1) API: returnera 400 om `rsvp_deadline < today`. (2) UI: visa "Sista svarsdatum har passerat".
**Effort:** S
**Varför blocker:** Klas sätter deadline → planerar mat → fler svar trillar in efteråt.

### 7. Error handling på delete account
**Fil:** `src/app/api/auth/delete-account/route.ts`
**Problem:** Ingen try/catch. Delvis raderat konto om det misslyckas.
**Fix:** Wrappa i try/catch, returnera felmeddelande.
**Effort:** S (15 min)
**Varför blocker:** Klas kan fastna med ett oanvändbart konto.

### 8. Error boundaries på dashboard
**Fil:** `src/app/(dashboard)/dashboard/page.tsx`
**Problem:** `Promise.all()` utan felhantering. En misslyckad query kraschar allt.
**Fix:** Lägg till try/catch med fallback-rendering.
**Effort:** M
**Varför blocker:** Om Supabase hickar ser Klas en kraschad sida istf dashboard.

---

## Prioritetsordning

| # | Fix | Effort | Blockerar |
|---|-----|--------|-----------|
| 4 | SMS-default → false | 5 min | Kostnadskontroll |
| 7 | Delete account error handling | 15 min | Kontosäkerhet |
| 3 | HTML-escapa e-postmallar | 30 min | Säkerhet |
| 6 | RSVP-deadline-kontroll | 30 min | Funktionalitet |
| 5 | Loading state RSVP | 30 min | UX |
| 1 | Allergy auto-delete | 30 min | GDPR |
| 8 | Dashboard error boundaries | 1h | Stabilitet |
| 2 | Persistent rate limiting | 1-2h | Säkerhet |

**Gör de 6 snabbaste först** (under 2h totalt), sedan rate limiting som kräver nytt beroende.

---

## Vad som INTE blockerar MVP

Följande är viktigt men kan vänta:
- Integrations-/E2E-tester (kompensera med manuell testning)
- Kryptering av allergidata (RLS skyddar redan åtkomst)
- Striktare RLS på RSVP UPDATE (edit_token skyddar i app-lagret)
- Admin-e-post i miljövariabel (låg risk, bara 2 konton)
- Timeout på externa API-anrop (påverkar bara AI-generering)
- Refaktorering av stora komponenter
- Tillgänglighetsförbättringar (bör göras men blockerar inte launch)

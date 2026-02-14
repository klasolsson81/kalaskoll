# MVP Blockers — KalasKoll

**Datum:** 2026-02-14
**Deadline:** 27 mars 2026

> Issues som MASTE fixas innan lansering.
> Uppskattad total tid: **~4 timmar**

---

## CRITICAL (maste fixas, ~2 timmar)

### 1. SMS fail-open vid DB-fel (5 min)
**Fil:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx`
**Problem:** `smsAllowed ?? true` — om kvotcheck misslyckas skickas obegransade SMS.
**Fix:** Andra till `?? false`.

### 2. Allergy insert-failure tyst i RSVP (15 min)
**Fil:** `src/app/api/rsvp/route.ts:162-169`
**Problem:** Allergidata-insert utan felkontroll — data kan forsvinna tyst.
**Fix:** Lagg till `const { error } = await ...` och kontrollera.

### 3. Kontoradering ignorerar fel (15 min)
**Filer:** `ProfileDropdown.tsx:38-44` + `api/auth/delete-account/route.ts`
**Problem:** Fel vid radering ignoreras — konto halvraderat.
**Fix:** Visa felmeddelande, try/catch i API-routen.

### 4. Kryptering faller tillbaka till klartext (15 min)
**Fil:** `src/lib/utils/crypto.ts:54-71`
**Problem:** Om ALLERGY_ENCRYPTION_KEY saknas lagras halsodata okrypterat.
**Fix:** Kasta fel i produktion istallet for fallback.

### 5. Dashboard saknar error boundary (15 min)
**Fil:** `src/app/(dashboard)/dashboard/page.tsx:53`
**Problem:** Promise.all utan try/catch — dashboard kraschar vid DB-fel.
**Fix:** Wrappa i try/catch, returnera fallback-rendering.

### 6. Allergidata auto-delete saknas (30 min)
**Fil:** Ny — `src/app/api/cron/cleanup-allergy/route.ts`
**Problem:** auto_delete_at-falt finns men ingen cleanup kors. GDPR-brott.
**Fix:** Skapa cron-route som raderar rader dar `auto_delete_at < NOW()`.

---

## HIGH (bor fixas, ~2 timmar)

### 7. error.tsx och not-found.tsx saknas (30 min)
**Filer:** Nya — `src/app/error.tsx` + `src/app/not-found.tsx`
**Problem:** Default Next.js-sidor vid crash/404. Bryter varumarke.

### 8. RSVP loading.tsx saknas (20 min)
**Fil:** Ny — `src/app/r/[token]/loading.tsx`
**Problem:** Gaster ser tom sida 1-3 sek efter QR-scan.

### 9. Rate limit loggar inte vid disable (15 min)
**Fil:** `src/lib/utils/rate-limit.ts`
**Problem:** Om Redis ar nere: tyst fail-open.

### 10. RSVP edit saknar felkontroll (15 min)
**Fil:** `src/app/api/rsvp/edit/route.ts:197-223`
**Problem:** update/delete/insert utan error-check.

### 11. Felmeddelanden pa engelska (20 min)
**Filer:** Flera API-routes
**Problem:** "Unauthorized" istallet for "Ej inloggad".

### 12. API timeouts saknas (20 min)
**Filer:** `src/lib/ai/openai.ts`
**Problem:** Ingen AbortController pa OpenAI-fallback.

---

## Checklista

- [ ] C1: SMS `?? false`
- [ ] C2: Allergy insert felkontroll
- [ ] C3: Kontoradering felhantering
- [ ] C4: Kryptering fail i prod
- [ ] C5: Dashboard try/catch
- [ ] C6: Allergy cleanup cron
- [ ] H1: error.tsx + not-found.tsx
- [ ] H2: RSVP loading.tsx
- [ ] H3: Rate limit logging
- [ ] H4: RSVP edit felkontroll
- [ ] H5: Svenska felmeddelanden
- [ ] H6: API timeouts

---

*Genererad 2026-02-14*

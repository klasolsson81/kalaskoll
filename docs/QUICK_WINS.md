# Quick Wins — KalasKoll

**Datum:** 2026-02-14

> Enkla fixar (<30 min) som forbattrar mycket.

---

## Sakerhet (3 st)

### 1. SMS default till false (5 min)
**Fil:** `src/app/(dashboard)/kalas/[id]/SendInvitationsSection.tsx`
**Andra:** `smsAllowed ?? true` -> `smsAllowed ?? false`
**Effekt:** Forhindrar obegransade SMS vid DB-fel.

### 2. Kryptering: kasta fel i produktion (10 min)
**Fil:** `src/lib/utils/crypto.ts:54-71`
**Andra:** Lagg till `if (process.env.NODE_ENV === 'production') throw new Error(...)` i catch-blocket.
**Effekt:** Garanterar att allergidata aldrig lagras okrypterat i prod.

### 3. Rate limit logging (10 min)
**Fil:** `src/lib/utils/rate-limit.ts`
**Andra:** Lagg till `console.warn('[RateLimit] Upstash not configured')` och `console.error('[RateLimit] Redis error:', err)`.
**Effekt:** Synlighet nar rate limiting ar inaktiverat.

---

## Felhantering (4 st)

### 4. Dashboard try/catch (15 min)
**Fil:** `src/app/(dashboard)/dashboard/page.tsx:53`
**Andra:** Wrappa `Promise.all()` i try/catch, visa "Nagot gick fel"-fallback.
**Effekt:** Dashboard kraschar inte vid DB-fel.

### 5. Allergy insert felkontroll (10 min)
**Fil:** `src/app/api/rsvp/route.ts:162-169`
**Andra:** `const { error } = await supabase.from('allergy_data').insert(...)` + kontrollera.
**Effekt:** Allergidata-forlust upptacks och loggas.

### 6. RSVP edit felkontroll (15 min)
**Fil:** `src/app/api/rsvp/edit/route.ts:197-223`
**Andra:** Lagg till `{ error }` check efter varje DB-operation.
**Effekt:** Edit-failures upptacks.

### 7. Kontoradering felmeddelande (15 min)
**Fil:** `ProfileDropdown.tsx:38-44`
**Andra:** Visa felmeddelande istallet for tom catch.
**Effekt:** Anvandare ser om radering misslyckades.

---

## UX/Accessibility (5 st)

### 8. RSVP toggle aria-labels (5 min)
**Fil:** `src/components/forms/RsvpForm.tsx:229-254`
**Andra:** Lagg till `aria-label="Ja, vi kommer pa kalaset"` pa Ja-knapp, liknande for Nej.
**Effekt:** Skarmlasar-anvandare forstar knapparna.

### 9. SubmitButton aria-busy (5 min)
**Fil:** `src/components/forms/SubmitButton.tsx`
**Andra:** Lagg till `aria-busy={pending}` pa Button.
**Effekt:** Skarmlasar meddelar laddar-tillstand.

### 10. Allergi-consent visuell markering (5 min)
**Fil:** `src/components/forms/AllergyCheckboxes.tsx:72`
**Andra:** Lagg till `<span className="text-destructive font-semibold">*</span>` fore texten.
**Effekt:** Tydligare att samtycke kravs.

### 11. Multi-child knappar touch targets (5 min)
**Fil:** `src/components/forms/RsvpForm.tsx:329-352`
**Andra:** `p-2` -> `p-3` for att na 44x44px minimum.
**Effekt:** Lattare att trycka pa mobil.

### 12. Toggle focus-visible ring (5 min)
**Fil:** `src/components/forms/RsvpForm.tsx:228-255`
**Andra:** Lagg till `focus-visible:ring-ring/50 focus-visible:ring-[3px]` pa toggle-knappar.
**Effekt:** Tangentbordsnavigering synlig.

---

## UI Polish (3 st)

### 13. Felmeddelanden till svenska (20 min)
**Filer:** `api/auth/delete-account`, `api/admin/impersonate`, `api/invitation/send`
**Andra:** "Unauthorized" -> "Ej inloggad", "Forbidden" -> "Atkomst nekad", etc.
**Effekt:** Konsekvent sprak genom appen.

### 14. Loading spinner aria-label (5 min)
**Fil:** `src/app/r/[token]/loading.tsx` (och andra loading.tsx)
**Andra:** Lagg till `role="status" aria-label="Laser in"`.
**Effekt:** Skarmlasar meddelar laddning.

### 15. LoginForm autoFocus (2 min)
**Fil:** `src/app/(auth)/login/LoginForm.tsx:45`
**Andra:** Lagg till `autoFocus` pa email-input.
**Effekt:** Snabbare inloggning.

---

## Sammanfattning

| Kategori | Antal | Total tid |
|----------|-------|-----------|
| Sakerhet | 3 | ~25 min |
| Felhantering | 4 | ~55 min |
| UX/A11y | 5 | ~25 min |
| UI Polish | 3 | ~27 min |
| **Totalt** | **15** | **~2 timmar** |

Alla 15 quick wins kan goras pa en eftermiddag och forbattrar sakerhet, tillganglighet och anvandbarhet avsevart.

---

*Genererad 2026-02-14*

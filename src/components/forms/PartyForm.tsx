'use client';

import { useState, useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { PARTY_THEMES } from '@/lib/constants';

interface SavedChild {
  id: string;
  name: string;
  birth_date: string;
}

interface PartyFormProps {
  action: (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  defaultValues?: {
    childName?: string;
    childAge?: number;
    childId?: string;
    partyDate?: string;
    partyTime?: string;
    partyTimeEnd?: string;
    venueName?: string;
    venueAddress?: string;
    description?: string;
    theme?: string;
    rsvpDeadline?: string;
    maxGuests?: number;
  };
  savedChildren?: SavedChild[];
  submitLabel: string;
}

const CUSTOM_THEME_VALUE = '__custom__';

function isPresetTheme(theme: string): boolean {
  return PARTY_THEMES.some((t) => t.value === theme);
}

export function PartyForm({ action, defaultValues, savedChildren = [], submitLabel }: PartyFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [selectedChildId, setSelectedChildId] = useState(defaultValues?.childId ?? '');
  const [partyDate, setPartyDate] = useState(defaultValues?.partyDate ?? '');

  const defaultTheme = defaultValues?.theme ?? '';
  const defaultIsCustom = defaultTheme !== '' && !isPresetTheme(defaultTheme);
  const [themeSelect, setThemeSelect] = useState(defaultIsCustom ? CUSTOM_THEME_VALUE : defaultTheme);
  const [customTheme, setCustomTheme] = useState(defaultIsCustom ? defaultTheme : '');

  const selectedChild = savedChildren.find((c) => c.id === selectedChildId);
  const isManual = !selectedChildId;

  function getBirthdayAge(child: SavedChild, partyDateStr?: string): number {
    const birthYear = new Date(child.birth_date).getFullYear();
    const partyYear = partyDateStr
      ? new Date(partyDateStr).getFullYear()
      : new Date().getFullYear();
    return partyYear - birthYear;
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm">👶</span>
            Om barnet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedChildren.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="childSelect">Välj barn</Label>
              <select
                id="childSelect"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Ange manuellt</option>
                {savedChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isManual ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="childName">Barnets namn</Label>
                <Input
                  id="childName"
                  name="childName"
                  placeholder="t.ex. Klas"
                  defaultValue={defaultValues?.childName}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childAge">Ålder (fyller)</Label>
                <Input
                  id="childAge"
                  name="childAge"
                  type="number"
                  min={1}
                  max={19}
                  placeholder="t.ex. 7"
                  defaultValue={defaultValues?.childAge}
                  className="h-10"
                  required
                />
              </div>
            </div>
          ) : (
            selectedChild && (
              <p className="text-sm text-muted-foreground">
                {selectedChild.name}, fyller {getBirthdayAge(selectedChild, partyDate || undefined)} år
                {partyDate ? ' vid kalaset' : ''}
              </p>
            )
          )}

          {/* Hidden inputs ensure FormData always has childName, childAge, childId */}
          {!isManual && selectedChild && (
            <>
              <input type="hidden" name="childId" value={selectedChild.id} />
              <input type="hidden" name="childName" value={selectedChild.name} />
              <input
                type="hidden"
                name="childAge"
                value={getBirthdayAge(selectedChild, partyDate || undefined)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-sm">📅</span>
            Datum & Plats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="partyDate">Datum</Label>
              <Input
                id="partyDate"
                name="partyDate"
                type="date"
                value={partyDate}
                onChange={(e) => setPartyDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyTime">Starttid</Label>
              <Input
                id="partyTime"
                name="partyTime"
                type="time"
                defaultValue={defaultValues?.partyTime}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyTimeEnd">Sluttid (valfritt)</Label>
              <Input
                id="partyTimeEnd"
                name="partyTimeEnd"
                type="time"
                defaultValue={defaultValues?.partyTimeEnd}
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueName">Plats</Label>
            <Input
              id="venueName"
              name="venueName"
              placeholder="t.ex. Leo's Lekland"
              defaultValue={defaultValues?.venueName}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venueAddress">Adress (valfritt)</Label>
            <Input
              id="venueAddress"
              name="venueAddress"
              placeholder="t.ex. Storgatan 1, Stockholm"
              defaultValue={defaultValues?.venueAddress}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-sm">🎨</span>
            Detaljer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="themeSelect">Tema</Label>
            <select
              id="themeSelect"
              value={themeSelect}
              onChange={(e) => {
                setThemeSelect(e.target.value);
                if (e.target.value !== CUSTOM_THEME_VALUE) {
                  setCustomTheme('');
                }
              }}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Inget tema</option>
              {PARTY_THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              <option value={CUSTOM_THEME_VALUE}>Annat...</option>
            </select>
            {themeSelect === CUSTOM_THEME_VALUE && (
              <Input
                id="customTheme"
                placeholder="t.ex. Pokemon, Minecraft, Frozen"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                className="h-10"
              />
            )}
            <input
              type="hidden"
              name="theme"
              value={themeSelect === CUSTOM_THEME_VALUE ? customTheme : themeSelect}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning (valfritt, visas på inbjudan)</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={200}
              placeholder="T.ex. Korv med bröd. Kalasrum först, lek sedan."
              defaultValue={defaultValues?.description}
              className="placeholder:text-muted-foreground border-input w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
              onInput={(e) => {
                const counter = (e.target as HTMLTextAreaElement).nextElementSibling;
                if (counter) counter.textContent = `${(e.target as HTMLTextAreaElement).value.length}/200`;
              }}
            />
            <p className="text-xs text-muted-foreground text-right">
              {defaultValues?.description?.length ?? 0}/200
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rsvpDeadline">Sista OSA-datum (valfritt)</Label>
              <p className="text-xs text-muted-foreground">
                Sista datum gästerna kan anmäla sig
              </p>
              <Input
                id="rsvpDeadline"
                name="rsvpDeadline"
                type="date"
                defaultValue={defaultValues?.rsvpDeadline}
                min={new Date().toISOString().slice(0, 10)}
                max={partyDate || undefined}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max antal gäster (valfritt)</Label>
              <p className="text-xs text-muted-foreground">
                Hur många barn som får plats
              </p>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min={1}
                max={100}
                placeholder="t.ex. 15"
                defaultValue={defaultValues?.maxGuests}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <SubmitButton className="w-full h-11 font-semibold gradient-celebration text-white shadow-warm">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

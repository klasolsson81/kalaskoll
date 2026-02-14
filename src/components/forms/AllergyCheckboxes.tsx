'use client';

import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { COMMON_ALLERGIES } from '@/lib/constants';

interface AllergyCheckboxesProps {
  disabled?: boolean;
  initialSelected?: string[];
  initialOtherDietary?: string;
  onChange?: (data: { allergies: string[]; otherDietary: string; allergyConsent: boolean }) => void;
}

export function AllergyCheckboxes({ disabled, initialSelected, initialOtherDietary, onChange }: AllergyCheckboxesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
  const [otherText, setOtherText] = useState(initialOtherDietary ?? '');
  const [consentGiven, setConsentGiven] = useState(false);
  const hasAllergyData = selected.length > 0 || otherText.trim().length > 0;

  const notifyParent = useCallback((s: string[], o: string, c: boolean) => {
    onChange?.({ allergies: s, otherDietary: o, allergyConsent: c });
  }, [onChange]);

  useEffect(() => {
    notifyParent(selected, otherText, consentGiven);
  }, [selected, otherText, consentGiven, notifyParent]);

  function toggleAllergy(allergy: string) {
    setSelected((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  }

  return (
    <div className="space-y-4" role="group" aria-label="Allergier och specialkost">
      <p className="text-sm font-medium">Allergier eller specialkost</p>

      <div className="grid grid-cols-2 gap-3">
        {COMMON_ALLERGIES.map((allergy) => (
          <label
            key={allergy}
            className="flex items-center gap-2 rounded-xl border p-3 text-sm transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm"
          >
            <Checkbox
              value={allergy}
              checked={selected.includes(allergy)}
              onCheckedChange={() => toggleAllergy(allergy)}
              disabled={disabled}
            />
            {allergy}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherDietary">Annat (fritext)</Label>
        <Input
          id="otherDietary"
          placeholder="t.ex. vegetarian, vegan..."
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          disabled={disabled}
          className="h-11"
        />
      </div>

      {hasAllergyData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
              required
              disabled={disabled}
            />
            <span className="text-amber-900">
              <span className="text-destructive font-semibold">*</span>{' '}
              Jag samtycker till att allergiinformation lagras i syfte att säkerställa mitt barns
              säkerhet vid kalaset. Informationen raderas automatiskt 7 dagar efter kalaset.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

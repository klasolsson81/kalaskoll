'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { COMMON_ALLERGIES } from '@/lib/constants';

interface AllergyCheckboxesProps {
  disabled?: boolean;
  initialSelected?: string[];
  initialOtherDietary?: string;
}

export function AllergyCheckboxes({ disabled, initialSelected, initialOtherDietary }: AllergyCheckboxesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
  const [consentGiven, setConsentGiven] = useState(false);
  const hasAllergies = selected.length > 0;

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
              name="allergies"
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
          name="otherDietary"
          placeholder="t.ex. vegetarian, vegan..."
          defaultValue={initialOtherDietary ?? ''}
          disabled={disabled}
          className="h-11"
        />
      </div>

      {hasAllergies && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              name="allergyConsent"
              value="true"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
              required
              disabled={disabled}
            />
            <span className="text-amber-900">
              Jag samtycker till att allergiinformation lagras i syfte att säkerställa mitt barns
              säkerhet vid kalaset. Informationen raderas automatiskt 7 dagar efter kalaset.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

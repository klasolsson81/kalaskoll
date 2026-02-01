'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { updatePassword, type ProfileActionResult } from '../actions';

export default function PasswordPage() {
  const [state, formAction] = useActionState<ProfileActionResult, FormData>(updatePassword, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            &larr; Tillbaka
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-display">Ändra lösenord</h1>
      </div>

      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
            Lösenordet har uppdaterats!
          </div>
        )}

        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="font-display">Nytt lösenord</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="Minst 6 tecken"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Skriv lösenordet igen"
                className="h-11"
              />
              {state.fieldError && (
                <p className="text-sm text-destructive">{state.fieldError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <SubmitButton className="w-full h-12 text-base font-semibold gradient-celebration text-white shadow-warm" size="lg">
          Uppdatera lösenord
        </SubmitButton>
      </form>
    </div>
  );
}

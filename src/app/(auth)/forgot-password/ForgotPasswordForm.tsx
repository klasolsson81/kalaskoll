'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { forgotPassword, type AuthResult } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthResult, FormData>(
    async (_prev, formData) => forgotPassword(formData),
    {},
  );

  if (state.success) {
    return (
      <Card className="border-0 glass-card text-center">
        <CardHeader className="space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            ✉️
          </div>
          <CardTitle className="text-2xl font-display">Kolla din e-post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Om det finns ett konto med den e-postadressen har vi skickat en
            länk för att återställa lösenordet.
          </p>
          <p className="text-sm text-muted-foreground">
            Hittar du inte mailet? Kolla din skräppost. Det kan ta någon minut
            innan det dyker upp.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="font-medium">
                Tillbaka till inloggning
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 glass-card">
      <CardHeader className="text-center space-y-3 pb-2">
        <Link href="/" className="mx-auto block">
          <span className="text-3xl font-extrabold tracking-tight text-primary font-display">
            KalasKoll
          </span>
        </Link>
        <div>
          <CardTitle className="text-2xl font-display">Glömt lösenord?</CardTitle>
          <CardDescription className="mt-1 text-base">
            Ange din e-postadress så skickar vi en återställningslänk
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="din@email.se"
              className="h-11"
              required
              autoFocus
            />
          </div>
          <SubmitButton className="w-full h-11 font-semibold gradient-celebration text-white">
            Skicka återställningslänk
          </SubmitButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Tillbaka till inloggning
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

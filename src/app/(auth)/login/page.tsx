'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { login, type AuthResult } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState<AuthResult, FormData>(
    async (_prev, formData) => login(formData),
    {},
  );

  return (
    <Card className="border-0 glass-card">
      <CardHeader className="text-center space-y-3 pb-2">
        <Link href="/" className="mx-auto block">
          <span className="text-3xl font-extrabold tracking-tight text-primary font-display">
            KalasKoll
          </span>
        </Link>
        <div>
          <CardTitle className="text-2xl font-display">Välkommen tillbaka!</CardTitle>
          <CardDescription className="mt-1 text-base">
            Logga in för att planera magiska kalas
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="h-11"
              required
            />
          </div>
          <SubmitButton className="w-full h-11 font-semibold gradient-celebration text-white">
            Logga in
          </SubmitButton>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/75 px-3 text-muted-foreground">eller</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Har du inget konto?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Skapa konto
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface BetaRegisterFormProps {
  spotsRemaining: number;
}

export function BetaRegisterForm({ spotsRemaining }: BetaRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/beta/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          honeypot: formData.get('website'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.waitlistRequired) {
          router.push('/register?full=true');
          return;
        }
        throw new Error(data.error || 'Något gick fel');
      }

      router.push('/check-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot - hidden from users, bots fill this */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="space-y-2">
        <Label htmlFor="name">Ditt namn</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Anna Andersson"
          className="h-11"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="din@email.se"
          className="h-11"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Lösenord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Minst 6 tecken"
          minLength={6}
          className="h-11"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-muted/50 border p-3 text-xs text-muted-foreground space-y-1">
        <p>Betan pågår t.o.m. 28 februari 2026. Alla testkonton och data raderas automatiskt 1 mars.</p>
        <p>Efter betan kan du registrera ett vanligt konto.</p>
      </div>

      <Button type="submit" className="w-full h-11 font-semibold gradient-celebration text-white" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          `Bli beta-testare (${spotsRemaining} platser kvar)`
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Genom att registrera dig godkänner du våra{' '}
        <a href="#" className="underline">användarvillkor</a> och{' '}
        <a href="#" className="underline">integritetspolicy</a>.
      </p>
    </form>
  );
}

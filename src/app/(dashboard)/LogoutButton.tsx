'use client';

import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/actions';

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="ghost" size="sm" type="submit">
        Logga ut
      </Button>
    </form>
  );
}

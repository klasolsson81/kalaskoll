'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SubmitButton({ children, className, size }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={className} size={size} disabled={pending}>
      {pending ? 'Vänta...' : children}
    </Button>
  );
}

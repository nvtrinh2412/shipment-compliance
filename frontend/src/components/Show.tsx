import { type ReactNode } from 'react';

interface ShowProps {
  when: boolean | undefined | null;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Show({ when, fallback = null, children }: ShowProps) {
  return when ? <>{children}</> : <>{fallback}</>;
}

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'positive' | 'caution';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-muted/60 text-subtle',
  accent: 'bg-accent/12 text-accent-light',
  positive: 'bg-positive/12 text-positive',
  caution: 'bg-caution/12 text-caution',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

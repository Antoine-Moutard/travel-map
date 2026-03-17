import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-8 text-center">
      <div className="text-subtle/40">{icon}</div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-default">{title}</h3>
        <p className="text-xs text-subtle leading-relaxed max-w-[220px]">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

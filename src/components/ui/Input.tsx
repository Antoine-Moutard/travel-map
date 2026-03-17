import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-muted/60 bg-elevated px-4 py-2.5 text-sm text-default placeholder:text-subtle/40 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 ${className}`}
        {...props}
      />
    </div>
  );
}

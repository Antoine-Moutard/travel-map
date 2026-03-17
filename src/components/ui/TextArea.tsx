import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', id, ...props }: TextAreaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`w-full rounded-xl border border-muted/60 bg-elevated px-4 py-2.5 text-sm text-default placeholder:text-subtle/40 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 resize-y ${className}`}
        {...props}
      />
    </div>
  );
}

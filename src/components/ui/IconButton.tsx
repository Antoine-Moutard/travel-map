import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

const sizeStyles = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
};

export function IconButton({
  label,
  children,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-xl text-subtle hover:text-default hover:bg-elevated transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer active:scale-95 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

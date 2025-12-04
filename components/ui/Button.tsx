// components/ui/Button.tsx
import * as React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg transition-all duration-200 ease-soft disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    md: 'h-10 px-4 text-sm font-medium',
    sm: 'h-8 px-3 text-sm',
  };
  const variants = {
    primary:
      'bg-verba-blue text-white shadow-sm hover:bg-verba-blue/90 hover:translate-y-[0.5px] hover:shadow-md',
    secondary:
      'border border-verba-marigold text-verba-ink hover:bg-verba-marigold/10',
    ghost: 'text-verba-blue hover:bg-verba-blue/10',
  };

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

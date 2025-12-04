// components/ui/Card.tsx
import * as React from 'react';
import clsx from 'clsx';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'border-brand-slate-200 rounded-xl border bg-white shadow-tile',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('border-brand-slate-200 border-b px-4 py-3', className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-4', className)} {...props} />;
}

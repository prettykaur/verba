// components/TrackedLink.tsx
'use client';

import Link, { LinkProps } from 'next/link';
import { track } from '@/lib/analytics';
import type { ReactNode } from 'react';

export function TrackedLink({
  event,
  props,
  onClick,
  children,
  ...rest
}: LinkProps & {
  event: string;
  props?: Record<string, string | number | boolean>;
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, props);
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}

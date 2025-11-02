import * as React from 'react';
import clsx from 'clsx';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'border-brand-slate-200 w-full rounded-md border bg-white px-3 py-2 text-sm',
        'placeholder:text-brand-slate-500 focus:ring-brand-blue/30 focus:border-brand-blue focus:ring-2',
        className,
      )}
      {...props}
    />
  );
});

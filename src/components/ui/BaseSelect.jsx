import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const BaseSelect = forwardRef(function BaseSelect({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

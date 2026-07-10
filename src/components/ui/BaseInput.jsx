import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const BaseInput = forwardRef(function BaseInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
});

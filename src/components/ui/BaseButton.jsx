import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const BaseButton = forwardRef(function BaseButton(
  { as: Component = 'button', className, type = 'button', ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    />
  );
});

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { BaseButton } from '@/components/ui/BaseButton';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-hover',
  ghost: 'bg-transparent text-text hover:bg-surface-hover',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export const AppButton = forwardRef(function AppButton(
  { variant = 'primary', size = 'md', loading = false, className, disabled, children, ...props },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </BaseButton>
  );
});

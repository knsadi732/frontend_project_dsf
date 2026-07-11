import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { BaseButton } from '@/components/ui/BaseButton';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-md shadow-primary/20 hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:brightness-95',
  secondary:
    'bg-gradient-to-b from-surface to-primary/10 text-text border border-border shadow-sm hover:brightness-95 hover:shadow active:brightness-90',
  ghost: 'bg-transparent text-text hover:bg-surface-hover',
  danger:
    'bg-gradient-to-br from-danger to-red-700 text-white shadow-md shadow-danger/20 hover:brightness-110 hover:shadow-lg hover:shadow-danger/25 active:brightness-95',
};

const SIZES = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3.5 text-sm',
  lg: 'h-10 px-5 text-base',
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

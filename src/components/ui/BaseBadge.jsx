import { cn } from '@/utils/cn';

const VARIANTS = {
  default: 'bg-surface-hover text-text-muted',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
};

export function BaseBadge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        VARIANTS[variant] ?? VARIANTS.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

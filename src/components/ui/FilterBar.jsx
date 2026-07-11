import { cn } from '@/utils/cn';

export function FilterBar({ className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

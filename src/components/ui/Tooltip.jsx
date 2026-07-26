import { cn } from '@/utils/cn';

// Styled replacement for the native `title` attribute, which renders as an
// unstyled OS tooltip with a delay. CSS-only (group-hover), no JS state.
export function Tooltip({ label, children, className }) {
  if (!label) return children;

  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2 py-1 text-xs font-medium text-surface opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-text" />
      </span>
    </span>
  );
}

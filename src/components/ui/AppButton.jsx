import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { BaseButton } from '@/components/ui/BaseButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-md shadow-primary/20 hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:brightness-95',
  secondary:
    'bg-gradient-to-b from-surface to-primary/10 text-text border border-border shadow-sm hover:brightness-95 hover:shadow active:brightness-90',
  // Frequent, low-stakes row actions (Edit/Delete/Download/View) — flat at
  // rest so they don't compete with real CTAs, gradient only reveals on
  // hover (same convention as Notion/Linear row actions).
  ghost:
    'bg-transparent text-text hover:bg-gradient-to-b hover:from-surface hover:to-surface-hover hover:shadow-sm active:brightness-95',
  danger:
    'bg-gradient-to-br from-danger to-red-700 text-white shadow-md shadow-danger/20 hover:brightness-110 hover:shadow-lg hover:shadow-danger/25 active:brightness-95',
  success:
    'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:brightness-110 hover:shadow-lg hover:shadow-emerald-500/25 active:brightness-95',
  info:
    'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 hover:brightness-110 hover:shadow-lg hover:shadow-sky-500/25 active:brightness-95',
  // Emerald -> Teal: reserved for Download specifically — signals a safe,
  // positive "your data is exported" action, always visible (not
  // hover-reveal like ghost) since it's a deliberately distinct action.
  download:
    'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:brightness-110 hover:shadow-lg hover:shadow-emerald-500/25 active:brightness-95',
  // Violet -> Purple: reserved for View specifically — kept distinct from
  // Download's emerald/teal so the two never get visually confused.
  view:
    'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20 hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/25 active:brightness-95',
  // Blue -> Cyan: reserved for Upload specifically — trust/freshness feel,
  // kept distinct from Download (emerald/teal) and View (violet/purple).
  upload:
    'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:brightness-110 hover:shadow-lg hover:shadow-blue-500/25 active:brightness-95',
};

const SIZES = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3.5 text-sm',
  lg: 'h-10 px-5 text-base',
};

export const AppButton = forwardRef(function AppButton(
  { variant = 'primary', size = 'md', loading = false, className, disabled, title, children, ...props },
  ref,
) {
  const button = (
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

  // `title` is deliberately intercepted here instead of spreading onto the
  // native button — a real `title` attribute triggers the browser's own
  // delayed, unstyled tooltip on top of this one.
  return title ? <Tooltip label={title}>{button}</Tooltip> : button;
});

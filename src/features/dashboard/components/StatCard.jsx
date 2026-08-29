import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { BaseCard } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

const TONES = {
  primary: {
    icon: 'bg-primary/15 text-primary',
    wash: 'from-primary/15 via-primary/5',
    bar: 'bg-primary',
  },
  success: {
    icon: 'bg-success/15 text-success',
    wash: 'from-success/15 via-success/5',
    bar: 'bg-success',
  },
  warning: {
    icon: 'bg-warning/15 text-warning',
    wash: 'from-warning/15 via-warning/5',
    bar: 'bg-warning',
  },
  danger: {
    icon: 'bg-danger/15 text-danger',
    wash: 'from-danger/15 via-danger/5',
    bar: 'bg-danger',
  },
  info: {
    icon: 'bg-info/15 text-info',
    wash: 'from-info/15 via-info/5',
    bar: 'bg-info',
  },
};

export function StatCard({ label, value, delta, icon: Icon, tone = 'primary' }) {
  const isPositive = delta?.startsWith('+');
  const t = TONES[tone] ?? TONES.primary;

  return (
    <BaseCard className="group relative flex items-center gap-3 overflow-hidden p-3.5 transition-shadow duration-200 hover:shadow-md">
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent', t.wash)} />
      <div className={cn('absolute inset-y-0 left-0 w-1', t.bar)} />

      {Icon && (
        <div className={cn('relative flex size-9 shrink-0 items-center justify-center rounded-lg', t.icon)}>
          <Icon className="size-4.5" />
        </div>
      )}
      <div className="relative min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tracking-tight text-text">{value}</p>
        {delta && (
          <p
            className={cn(
              'mt-0.5 inline-flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-success' : 'text-danger',
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta} vs last period
          </p>
        )}
      </div>
    </BaseCard>
  );
}

import { BaseCard } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

const DOT_TONES = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export function ChartCard({ title, subtitle, tone = 'primary', className, children }) {
  return (
    <BaseCard className={cn('p-3.5 transition-shadow duration-200 hover:shadow-md', className)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn('size-1.5 shrink-0 rounded-full', DOT_TONES[tone] ?? DOT_TONES.primary)} />
        <h2 className="text-sm font-medium text-text">{title}</h2>
      </div>
      {subtitle && <p className="-mt-1 mb-2 text-xs text-text-muted">{subtitle}</p>}
      {children}
    </BaseCard>
  );
}

import { BaseCard } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

export function StatCard({ label, value, delta }) {
  const isPositive = delta?.startsWith('+');

  return (
    <BaseCard className="p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
      {delta && (
        <p className={cn('mt-1 text-xs font-medium', isPositive ? 'text-success' : 'text-danger')}>
          {delta} vs last period
        </p>
      )}
    </BaseCard>
  );
}

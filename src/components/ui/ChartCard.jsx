import { ResponsiveContainer } from 'recharts';
import { BaseCard } from '@/components/ui/BaseCard';

export function ChartCard({ title, action, height = 280, children }) {
  return (
    <BaseCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {action}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </BaseCard>
  );
}

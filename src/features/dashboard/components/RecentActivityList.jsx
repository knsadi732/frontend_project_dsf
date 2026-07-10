import { BaseCard } from '@/components/ui/BaseCard';
import { BaseTimeline } from '@/components/ui/BaseTimeline';

export function RecentActivityList({ items }) {
  return (
    <BaseCard className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-text">Recent activity</h3>
      <BaseTimeline items={items} />
    </BaseCard>
  );
}

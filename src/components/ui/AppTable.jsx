import { BaseCard } from '@/components/ui/BaseCard';
import { BaseTable } from '@/components/ui/BaseTable';
import { BasePagination } from '@/components/ui/BasePagination';

export function AppTable({ page, pageSize, total, onPageChange, ...tableProps }) {
  return (
    <BaseCard>
      <BaseTable {...tableProps} />
      {typeof total === 'number' && (
        <div className="border-t border-border px-3 py-3">
          <BasePagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
        </div>
      )}
    </BaseCard>
  );
}

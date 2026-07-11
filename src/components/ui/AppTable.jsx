import { BaseCard } from '@/components/ui/BaseCard';
import { BaseTable } from '@/components/ui/BaseTable';
import { BasePagination } from '@/components/ui/BasePagination';

export function AppTable({ page, pageSize, total, onPageChange, onPageSizeChange, ...tableProps }) {
  return (
    <BaseCard className="overflow-hidden">
      <BaseTable pageSize={pageSize} {...tableProps} />
      {typeof total === 'number' && (
        <div className="border-t border-border px-3 py-2">
          <BasePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </BaseCard>
  );
}

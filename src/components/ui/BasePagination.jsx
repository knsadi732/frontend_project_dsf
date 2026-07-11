import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { BaseSelect } from '@/components/ui/BaseSelect';
import { PAGE_SIZE_OPTIONS } from '@/config/constants';

export function BasePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
      <span>
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </span>
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Rows per page</span>
            <BaseSelect
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 w-20 border-border bg-surface text-text"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </BaseSelect>
          </label>
        )}
        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </AppButton>
          <span className="tabular-nums">
            {page} / {totalPages}
          </span>
          <AppButton
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </AppButton>
        </div>
      </div>
    </div>
  );
}

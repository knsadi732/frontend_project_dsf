import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BaseLoader } from '@/components/ui/BaseLoader';

export function BaseTable({
  columns,
  data,
  rowKey = (row) => row.id,
  isLoading = false,
  emptyMessage = 'No records found',
  sort,
  onSortChange,
  onRowClick,
  className,
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              const SortIcon = isSorted ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

              return (
                <th key={column.key} scope="col" className="px-3 py-2 font-medium">
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSortChange?.({
                          key: column.key,
                          direction: isSorted && sort.direction === 'asc' ? 'desc' : 'asc',
                        })
                      }
                      className="inline-flex items-center gap-1 hover:text-text"
                    >
                      {column.header}
                      <SortIcon className="size-3" aria-hidden="true" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <BaseLoader />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-surface-hover',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2.5 text-text">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

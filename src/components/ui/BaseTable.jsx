import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

function TableSkeleton({ columns, rowCount }) {
  return Array.from({ length: rowCount }).map((_, rowIndex) => (
    <tr key={rowIndex} className="border-b border-border last:border-0">
      {columns.map((column) => (
        <td key={column.key} className="px-3 py-2.5">
          <div className="h-4 w-4/5 max-w-[10rem] animate-pulse rounded bg-surface-hover" />
        </td>
      ))}
    </tr>
  ));
}

export function BaseTable({
  columns,
  data,
  rowKey = (row) => row.id,
  isLoading = false,
  pageSize,
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
          <tr className="border-b border-border bg-surface-hover/60 text-xs uppercase tracking-wide text-text-muted">
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              const SortIcon = isSorted ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

              return (
                <th key={column.key} scope="col" className="px-3 py-1.5 font-medium">
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
            <TableSkeleton columns={columns} rowCount={Math.min(pageSize ?? 8, 8)} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border last:border-0',
                  index % 2 === 1 && 'bg-surface-hover/40',
                  onRowClick && 'cursor-pointer hover:bg-surface-hover',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-text">
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

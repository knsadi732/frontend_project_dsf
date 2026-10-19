import { useMemo, useState } from 'react';
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

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareValues(a, b) {
  const aEmpty = a == null || a === '';
  const bEmpty = b == null || b === '';
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

const getSortValue = (column, row) => (column.sortValue ? column.sortValue(row) : row[column.key]);

export function BaseTable({
  columns,
  data,
  rowKey = (row) => row.id,
  isLoading = false,
  pageSize,
  emptyMessage = 'No records found',
  sort: controlledSort,
  onSortChange,
  onRowClick,
  className,
  stickyHeader = false,
}) {
  // Server-side sorting when onSortChange is given; otherwise sort the loaded rows here.
  const isControlled = Boolean(onSortChange);
  const [localSort, setLocalSort] = useState(null);
  const sort = isControlled ? controlledSort : localSort;
  const handleSortChange = isControlled ? onSortChange : setLocalSort;

  const isSortable = (column) =>
    column.sortable ?? (isControlled ? false : typeof column.header === 'string' && data.some((row) => getSortValue(column, row) != null));

  const sortedData = useMemo(() => {
    if (isControlled || !sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return data;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => factor * compareValues(getSortValue(column, a), getSortValue(column, b)));
  }, [data, columns, sort, isControlled]);

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr
            className={cn(
              'border-b border-border text-xs uppercase tracking-wide text-text-muted',
              stickyHeader ? 'bg-surface' : 'bg-surface-hover/60',
            )}
          >
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              const SortIcon = isSorted ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

              return (
                <th key={column.key} scope="col" className="px-3 py-1.5 font-medium">
                  {isSortable(column) ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleSortChange({
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
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
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

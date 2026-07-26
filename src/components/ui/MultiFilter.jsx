import { useEffect, useRef, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { cn } from '@/utils/cn';

// Single "Filters" button that opens a popover listing every filter field
// passed in (one or many) instead of scattering a select/input per field
// across the toolbar.
export function MultiFilter({ filters = [], values = {}, onChange, onClear, className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (filters.length === 0) return null;

  const isActive = (value) => value !== undefined && value !== null && value !== '';
  const activeCount = filters.filter((filter) => isActive(values[filter.key])).length;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <AppButton type="button" variant="secondary" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
        <Filter className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">
            {activeCount}
          </span>
        )}
      </AppButton>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-text">Filters</span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onClear?.()}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-danger"
              >
                <X className="size-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {filters.map((filter) => {
              if (filter.type === 'text') {
                return (
                  <AppInput
                    key={filter.key}
                    label={filter.label}
                    value={values[filter.key] ?? ''}
                    onChange={(event) => onChange(filter.key, event.target.value)}
                    placeholder={filter.placeholder}
                  />
                );
              }
              if (filter.type === 'date') {
                return (
                  <AppInput
                    key={filter.key}
                    type="date"
                    label={filter.label}
                    value={values[filter.key] ?? ''}
                    onChange={(event) => onChange(filter.key, event.target.value)}
                  />
                );
              }
              return (
                <AppSelect
                  key={filter.key}
                  label={filter.label}
                  value={values[filter.key] ?? ''}
                  onChange={(event) => onChange(filter.key, event.target.value)}
                  options={filter.options ?? []}
                  placeholder={filter.placeholder ?? `All ${filter.label.toLowerCase()}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

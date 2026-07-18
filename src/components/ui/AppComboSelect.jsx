import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

// Starts as a free-text search input (filters `options` by label as you
// type); once an option is picked it collapses into a closed, select-like
// display. Clicking that display reopens the search box so the choice can
// be changed. Kept separate from AppSelect because AppSelect wraps a native
// <select>, which can't offer type-to-filter over long option lists.
export function AppComboSelect({
  label,
  error,
  helperText,
  id,
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  className,
  required,
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  const openForSearch = () => {
    if (disabled) return;
    setQuery('');
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (option) => {
    onChange(option.value);
    setQuery('');
    setOpen(false);
  };

  // Leaving the box (click elsewhere, Tab to the next field) without
  // explicitly clicking a suggestion used to just discard the typed text
  // and fall back to the empty placeholder. If what was typed narrows the
  // list to exactly one match, commit that match instead of losing it;
  // otherwise just close and keep whatever was already selected.
  const commitClose = () => {
    if (query && filtered.length === 1) {
      pick(filtered[0]);
      return;
    }
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        commitClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, filtered]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {open ? (
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
              } else if (event.key === 'Enter') {
                event.preventDefault();
                if (filtered.length > 0) pick(filtered[0]);
              }
            }}
            onBlur={() => {
              // Deferred so a click on a dropdown option (which also blurs
              // the input) has a chance to run its own onClick first.
              window.setTimeout(() => {
                if (containerRef.current && containerRef.current.contains(document.activeElement)) return;
                commitClose();
              }, 150);
            }}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              'h-8 w-full rounded-md border border-border bg-gradient-to-b from-surface to-primary/10 px-3 text-sm text-text outline-none placeholder:text-text-muted focus-visible:border-primary',
              error && 'border-danger focus-visible:border-danger',
              className,
            )}
          />
        ) : (
          <button
            type="button"
            id={fieldId}
            disabled={disabled}
            onClick={openForSearch}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              'flex h-8 w-full items-center justify-between rounded-md border border-border bg-gradient-to-b from-surface to-primary/10 px-3 text-left text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              selected ? 'text-text' : 'text-text-muted',
              error && 'border-danger focus-visible:border-danger',
              className,
            )}
          >
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronDown className="size-4 shrink-0 text-text-muted" />
          </button>
        )}

        {open && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-md">
            {filtered.length === 0 && <li className="px-3 py-1.5 text-sm text-text-muted">No matches</li>}
            {filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => pick(option)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm hover:bg-primary/10',
                    option.value === value && 'bg-primary/10 font-medium text-text',
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        helperText && <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}

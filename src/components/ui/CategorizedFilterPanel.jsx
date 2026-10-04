import { useEffect, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';

/**
 * Generic version of finance/InvoiceFilterPanel's two-pane layout (category
 * list left, that category's own single-select checkbox options right) —
 * that one hardcodes Invoice-specific categories; this one takes them as
 * props so Products/Variants/etc. can reuse the same look without a
 * duplicate ~190-line copy per page. Each category is a single-select
 * (one value per key), applied on demand via "Apply", not live per click.
 */
export function CategorizedFilterPanel({ categories, values, onApply, className }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.key);
  const [draft, setDraft] = useState(values);
  const [prevOpen, setPrevOpen] = useState(open);
  const containerRef = useRef(null);

  // Render-time state adjustment (not an effect) — re-seed the draft from
  // the applied values the moment the panel opens, so a stale edit from
  // last time it was open doesn't linger.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(values);
  }

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const activeCount = categories.filter((category) => values[category.key]).length;

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const clear = () => {
    const cleared = Object.fromEntries(categories.map((category) => [category.key, '']));
    setDraft(cleared);
    onApply(cleared);
    setOpen(false);
  };

  const active = categories.find((category) => category.key === activeCategory) ?? categories[0];

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
        // One positioned container with the two-pane row and the Clear/
        // Apply footer stacked as normal flex children — not two separate
        // absolutely-positioned siblings glued together with a guessed
        // top offset, which drifts out of alignment (overlapping the
        // options list) the moment the options list's height differs from
        // whatever height that guess was tuned for.
        <div className="absolute left-0 z-30 mt-1 flex w-[26rem] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex">
            <div className="w-32 shrink-0 border-r border-border bg-surface-hover py-2">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Filters</p>
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm',
                    activeCategory === category.key ? 'bg-primary/10 font-medium text-primary' : 'text-text hover:bg-surface',
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-3">
              <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
                {(active?.options ?? []).map((option) => (
                  <label key={option.value || 'all'} className="flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={(draft[active.key] ?? '') === option.value}
                      onChange={() => setDraft((prev) => ({ ...prev, [active.key]: option.value }))}
                      className="size-4 rounded border-border"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <button type="button" onClick={clear} className="text-xs text-text-muted hover:text-danger">
              Clear
            </button>
            <AppButton type="button" size="sm" onClick={apply}>
              Apply
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

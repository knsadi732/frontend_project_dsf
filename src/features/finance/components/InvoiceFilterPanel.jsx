import { useEffect, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { cn } from '@/utils/cn';

const CATEGORIES = [
  { key: 'status', label: 'Status' },
  { key: 'channelType', label: 'Sales Channel' },
  { key: 'orderNumber', label: 'Order No' },
  { key: 'dateRange', label: 'Date Range' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CHANNEL_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'direct', label: 'Direct (walk-in / non-marketplace)' },
  // Only one real marketplace channel exists today — this is Direct vs
  // Marketplace rather than a named-channel picker (Amazon/Meesho/...)
  // until more than one marketplace has real order data.
  { value: 'marketplace', label: 'Marketplace (Amazon, etc.)' },
];

function activeCountOf(values) {
  let count = 0;
  if (values.status) count += 1;
  if (values.channelType) count += 1;
  if (values.orderNumber) count += 1;
  if (values.dateFrom || values.dateTo) count += 1;
  return count;
}

/**
 * "Filters" button opening a two-pane panel (category list left, that
 * category's own options right) instead of scattering separate dropdowns/
 * inputs across the toolbar — filters apply on demand via a real "Apply"
 * button, not live on every keystroke, so a partial Order No or an
 * in-progress date range doesn't fire a query per character/click.
 */
export function InvoiceFilterPanel({ values, onApply, className }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('status');
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

  const activeCount = activeCountOf(values);

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const clear = () => {
    const cleared = { status: '', channelType: '', orderNumber: '', dateFrom: '', dateTo: '' };
    setDraft(cleared);
    onApply(cleared);
    setOpen(false);
  };

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
        <div className="absolute right-0 z-20 mt-1 flex w-[26rem] overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <div className="w-32 shrink-0 border-r border-border bg-surface-hover py-2">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Filters</p>
            {CATEGORIES.map((category) => (
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
            {activeCategory === 'status' && (
              <div className="flex flex-col gap-1.5">
                {STATUS_OPTIONS.map((option) => (
                  <label key={option.value || 'all'} className="flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={(draft.status ?? '') === option.value}
                      onChange={() => setDraft((prev) => ({ ...prev, status: option.value }))}
                      className="size-4 rounded border-border"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}

            {activeCategory === 'channelType' && (
              <div className="flex flex-col gap-1.5">
                {CHANNEL_OPTIONS.map((option) => (
                  <label key={option.value || 'all'} className="flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={(draft.channelType ?? '') === option.value}
                      onChange={() => setDraft((prev) => ({ ...prev, channelType: option.value }))}
                      className="size-4 rounded border-border"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}

            {activeCategory === 'orderNumber' && (
              <AppInput
                label="Order No"
                value={draft.orderNumber ?? ''}
                onChange={(event) => setDraft((prev) => ({ ...prev, orderNumber: event.target.value }))}
                placeholder="e.g. 403-7663439-7871544"
              />
            )}

            {activeCategory === 'dateRange' && (
              <div className="flex flex-col gap-2">
                <AppInput
                  type="date"
                  label="From"
                  value={draft.dateFrom ?? ''}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dateFrom: event.target.value }))}
                />
                <AppInput
                  type="date"
                  label="To"
                  value={draft.dateTo ?? ''}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dateTo: event.target.value }))}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full z-20 mt-[3.35rem] flex w-[26rem] items-center justify-between rounded-b-lg border border-t-0 border-border bg-surface px-3 py-2 shadow-lg">
          <button type="button" onClick={clear} className="text-xs text-text-muted hover:text-danger">
            Clear
          </button>
          <AppButton type="button" size="sm" onClick={apply}>
            Apply
          </AppButton>
        </div>
      )}
    </div>
  );
}

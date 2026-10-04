import { CategorizedFilterPanel } from '@/components/ui/CategorizedFilterPanel';

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

/**
 * Status / Sales Channel / Order No — all single-select-per-category, so
 * this is just CategorizedFilterPanel with Invoice-specific categories.
 * Date Range used to live in here too, but a from/to pair isn't a pick-one
 * list — it now sits in FinancePage's toolbar as its own pair of date
 * inputs, same as every other page's date filter. Order No used to be a
 * free-text box the user had to know the exact order number to fill in;
 * it's now a real list of this company's actual orders to pick from.
 */
export function InvoiceFilterPanel({ values, onApply, orderOptions, className }) {
  return (
    <CategorizedFilterPanel
      categories={[
        { key: 'status', label: 'Status', options: STATUS_OPTIONS },
        { key: 'channelType', label: 'Sales Channel', options: CHANNEL_OPTIONS },
        { key: 'orderNumber', label: 'Order No', options: [{ value: '', label: 'All' }, ...orderOptions] },
      ]}
      values={values}
      onApply={onApply}
      className={className}
    />
  );
}

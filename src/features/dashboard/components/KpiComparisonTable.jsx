import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

function fmt(value, unit) {
  if (unit === 'currency') return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return `${Number(value ?? 0).toLocaleString('en-IN')} units`;
}

function ChangeBadge({ current, previous }) {
  // No prior-period baseline to compare against — a 0 -> 0 "no change" is not
  // the same claim as a genuine 0% swing between two real, non-zero numbers.
  if (!previous) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-text-muted">
        <Minus className="size-3" /> New
      </span>
    );
  }
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', isUp ? 'text-success' : 'text-danger')}>
      {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/**
 * NetSuite-style "Key Performance Indicators" table — This-period vs
 * Last-period-of-the-same-type (last month for Monthly, last quarter for
 * Quarterly, last FY for YTD), with a colored % change per row.
 */
export function KpiComparisonTable({ rows, currentLabel, previousLabel }) {
  return (
    <BaseCard>
      <CardHeader className="px-4 py-2.5">
        <h3 className="text-sm font-semibold text-text">Key Performance Indicators</h3>
      </CardHeader>
      <CardBody className="px-4 py-2.5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface-hover text-xs text-text-muted">
                <th scope="col" className="rounded-l-md px-3 py-2 font-medium">KPI</th>
                <th scope="col" className="px-3 py-2 font-medium">{currentLabel}</th>
                <th scope="col" className="px-3 py-2 font-medium">{previousLabel}</th>
                <th scope="col" className="rounded-r-md px-3 py-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-text">{row.label}</td>
                  <td className="px-3 py-2 text-text">{fmt(row.current, row.unit)}</td>
                  <td className="px-3 py-2 text-text-muted">{fmt(row.previous, row.unit)}</td>
                  <td className="px-3 py-2">
                    <ChangeBadge current={row.current} previous={row.previous} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </BaseCard>
  );
}

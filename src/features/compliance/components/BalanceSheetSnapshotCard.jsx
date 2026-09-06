import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { formatDisplayDate } from '@/features/compliance/utils/reportPeriod';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

// Deliberately separate from PnlReportCard: a Balance Sheet is "as of" a date, not
// "for" a period like Sales/Expenses — showing it inside the P&L card made it look
// like a period figure (e.g. "as of 30 Sep" read as "for September"), which is wrong
// for a cumulative, since-day-one total.
export function BalanceSheetSnapshotCard({ report, isLoading }) {
  const summary = report?.fixedAssetsSummary;
  const asOfLabel = report?.period?.to ? formatDisplayDate(report.period.to) : 'today';

  if (!isLoading && (!summary || summary.assets.length === 0)) return null;

  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">Balance sheet snapshot — as of {asOfLabel}</h3>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-text-muted">
              Every asset the company owns as of this date, since day one — not this period&apos;s activity. Not part of
              Total Expenses above; only depreciation is.
            </p>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-text-muted">Total cost</dt>
                <dd className="font-semibold text-text">{fmt(summary.totalCost)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Accumulated depreciation</dt>
                <dd className="font-semibold text-text">{fmt(summary.totalAccumulatedDepreciation)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Net book value</dt>
                <dd className="font-semibold text-success">{fmt(summary.netBookValue)}</dd>
              </div>
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/60 text-xs uppercase tracking-wide text-text-muted">
                    <th scope="col" className="px-3 py-1.5 font-medium">Asset</th>
                    <th scope="col" className="px-3 py-1.5 font-medium">Cost</th>
                    <th scope="col" className="px-3 py-1.5 font-medium">Depreciation</th>
                    <th scope="col" className="px-3 py-1.5 font-medium">Net book value</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.assets.map((asset) => (
                    <tr key={asset.assetTag} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-text">
                        {asset.assetTag} — {asset.assetName}
                      </td>
                      <td className="px-3 py-2 text-text">{fmt(asset.purchaseCost)}</td>
                      <td className="px-3 py-2 text-text">{fmt(asset.accumulatedDepreciation)}</td>
                      <td className="px-3 py-2 text-text">{fmt(asset.netBookValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardBody>
    </BaseCard>
  );
}

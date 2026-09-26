import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

function money(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

// Product-wise real Amazon margin, plus a combined row — see
// marketplaceMargin.js for the actual-cost math (mfg cost + real overhead +
// channel's blended fee/ads/return cost).
export function MarketplaceMarginPanel({ channelName, rows, combined }) {
  if (!rows.length) {
    return (
      <BaseCard>
        <CardHeader className="px-4 py-2.5">
          <h3 className="text-sm font-semibold text-text">Marketplace — actual margin</h3>
        </CardHeader>
        <CardBody className="px-4 py-2.5">
          <p className="text-sm text-text-muted">No marketplace orders recorded yet.</p>
        </CardBody>
      </BaseCard>
    );
  }

  const allRows = combined ? [...rows, combined] : rows;

  return (
    <BaseCard>
      <CardHeader className="px-4 py-2.5">
        <h3 className="text-sm font-semibold text-text">Marketplace — actual margin ({channelName})</h3>
      </CardHeader>
      <CardBody className="px-4 py-2.5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-surface-hover text-xs text-text-muted">
                <th scope="col" className="rounded-l-md px-3 py-2 font-medium">Product</th>
                <th scope="col" className="px-3 py-2 font-medium">Units</th>
                <th scope="col" className="px-3 py-2 font-medium">Avg. selling price (ex-GST)</th>
                <th scope="col" className="px-3 py-2 font-medium">Mfg cost</th>
                <th scope="col" className="px-3 py-2 font-medium">Overhead</th>
                <th scope="col" className="px-3 py-2 font-medium">Channel cost</th>
                <th scope="col" className="px-3 py-2 font-medium">Total cost</th>
                <th scope="col" className="rounded-r-md px-3 py-2 font-medium">Margin / unit</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row) => (
                <tr
                  key={row.name}
                  className={cn('border-b border-border last:border-0', row === combined && 'bg-surface-hover font-semibold')}
                >
                  <td className="px-3 py-2 text-text">{row.name}</td>
                  <td className="px-3 py-2 text-text">{row.units}</td>
                  <td className="px-3 py-2 text-text">{money(row.avgRevenue)}</td>
                  <td className="px-3 py-2 text-text-muted">{money(row.avgMfgCost)}</td>
                  <td className="px-3 py-2 text-text-muted">{money(row.overheadPerUnit)}</td>
                  <td className="px-3 py-2 text-text-muted">{money(row.channelCost)}</td>
                  <td className="px-3 py-2 text-text-muted">{money(row.totalCost)}</td>
                  <td className={cn('px-3 py-2 font-medium', row.marginPerUnit >= 0 ? 'text-success' : 'text-danger')}>
                    {money(row.marginPerUnit)} ({row.marginPercent.toFixed(1)}%)
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

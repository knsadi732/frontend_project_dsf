import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { cn } from '@/utils/cn';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

export function PnlReportCard({ report, isLoading }) {
  const categories = report?.categories ?? {};
  const categoryRows = Object.entries(categories);
  const netProfit = Number(report?.netProfit ?? 0);

  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">Profit &amp; loss (ITR / CA reference)</h3>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-text-muted">Total sales</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.totalSales)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Total expenses</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.totalExpenses)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Net profit</dt>
                <dd className={cn('text-lg font-semibold', netProfit < 0 ? 'text-danger' : 'text-success')}>
                  {fmt(netProfit)}
                </dd>
              </div>
            </dl>

            {categoryRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/60 text-xs uppercase tracking-wide text-text-muted">
                      <th scope="col" className="px-3 py-1.5 font-medium">Category</th>
                      <th scope="col" className="px-3 py-1.5 font-medium">Credit</th>
                      <th scope="col" className="px-3 py-1.5 font-medium">Debit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.map(([category, { credit, debit }]) => (
                      <tr key={category} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-text">{category}</td>
                        <td className="px-3 py-2 text-text">{fmt(credit)}</td>
                        <td className="px-3 py-2 text-text">{fmt(debit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {report?.fixedAssetsSummary && report.fixedAssetsSummary.assets.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-hover/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Fixed assets on the books (not in P&amp;L expense — only depreciation is)
                </p>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-text-muted">Total cost</dt>
                    <dd className="font-semibold text-text">{fmt(report.fixedAssetsSummary.totalCost)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Accumulated depreciation</dt>
                    <dd className="font-semibold text-text">{fmt(report.fixedAssetsSummary.totalAccumulatedDepreciation)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Net book value</dt>
                    <dd className="font-semibold text-success">{fmt(report.fixedAssetsSummary.netBookValue)}</dd>
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
                      {report.fixedAssetsSummary.assets.map((asset) => (
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

            {report?.estimatedIncomeTax && (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-hover/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Estimated income tax (FY 2026-27)
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {['newRegime', 'oldRegime'].map((key) => {
                    const regime = report.estimatedIncomeTax[key];
                    const isRecommended = report.estimatedIncomeTax.recommendedRegime === regime.regime;
                    return (
                      <div
                        key={key}
                        className={cn(
                          'rounded-md border p-2',
                          isRecommended ? 'border-success' : 'border-border',
                        )}
                      >
                        <p className="flex items-center justify-between text-xs font-medium text-text-muted">
                          <span>{regime.regime === 'new' ? 'New regime' : 'Old regime'}</span>
                          {isRecommended && <span className="text-success">Lower</span>}
                        </p>
                        <p className="text-base font-semibold text-text">{fmt(regime.totalTax)}</p>
                        <p className="text-xs text-text-muted">
                          Tax {fmt(regime.taxBeforeCess)} + Cess {fmt(regime.cess)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-text-muted">{report.estimatedIncomeTax.disclaimer}</p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </BaseCard>
  );
}

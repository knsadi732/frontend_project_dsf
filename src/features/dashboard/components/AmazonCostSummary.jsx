import { Megaphone, Truck, Store, Percent, Receipt, CircleEllipsis, Wallet } from 'lucide-react';
import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AppButton } from '@/components/ui/AppButton';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { cn } from '@/utils/cn';

const money = (value) => `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function formatDay(value) {
  if (!value) return '';
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Everything Amazon took or held back, for the dashboard's selected period: ads, shipping,
// charges (fees), TCS/TDS and anything that fits none of those (listed by its own name), next
// to what was sold/refunded and what Amazon has actually released.
export function AmazonCostSummary({ summary, isLoading, isError, rangeLabel, onUploadClick }) {
  if (isLoading && !summary) {
    return (
      <BaseCard>
        <CardBody className="flex justify-center px-4 py-6">
          <BaseLoader />
        </CardBody>
      </BaseCard>
    );
  }

  if (isError || !summary) {
    return (
      <BaseCard>
        <CardHeader className="px-4 py-2.5">
          <h3 className="text-sm font-semibold text-text">Amazon — costs & deductions</h3>
        </CardHeader>
        <CardBody className="px-4 py-2.5">
          <p className="text-sm text-text-muted">Amazon summary isn't available right now.</p>
        </CardBody>
      </BaseCard>
    );
  }

  const { marketplace, ads, shipping, tcsTds, charges, other, deductionsTotal, payout } = summary;
  const tcsTdsTotal = tcsTds.tcsNet + tcsTds.tds;
  const hasData = deductionsTotal > 0 || marketplace.invoicedSales > 0 || payout.settlements.length > 0;

  const sections = [
    { title: 'Ads cost', total: ads.total, items: ads.items },
    { title: 'Shipment cost', total: shipping.total, items: shipping.items },
    { title: 'Charges (fees)', total: charges.total, items: charges.items },
    {
      title: 'TCS & TDS',
      total: tcsTdsTotal,
      items: [
        { label: 'TCS deducted', amount: tcsTds.tcsDeducted },
        { label: 'TCS reversed on refunds', amount: -tcsTds.tcsReversed },
        { label: 'TDS', amount: tcsTds.tds },
      ].filter((item) => item.amount !== 0),
    },
    { title: 'Other deductions', total: other.total, items: other.items },
  ].filter((section) => section.items.length > 0);

  return (
    <BaseCard>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-text">Amazon — costs & deductions</h3>
        <div className="flex items-center gap-3">
          {rangeLabel && <span className="text-xs text-text-muted">{rangeLabel}</span>}
          {onUploadClick && (
            <AppButton variant="secondary" size="sm" onClick={onUploadClick}>
              Upload Amazon report
            </AppButton>
          )}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 px-4 py-3">
        {!hasData ? (
          <p className="text-sm text-text-muted">No Amazon sales, deductions or settlements in this period.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Ads cost" value={money(ads.total)} icon={Megaphone} tone="navy" subtitle="Cost of advertising" />
              <StatCard label="Shipment cost" value={money(shipping.total)} icon={Truck} tone="blue" subtitle="Easy Ship, GST incl." />
              <StatCard
                label="Marketplace"
                value={money(marketplace.netSales)}
                icon={Store}
                tone="sky"
                subtitle={`Net sales · ${marketplace.orders} orders · ${money(marketplace.refunds)} refunded`}
              />
              <StatCard
                label="TCS & TDS"
                value={money(tcsTdsTotal)}
                icon={Percent}
                tone="charcoal"
                subtitle={`TCS ${money(tcsTds.tcsNet)} · TDS ${money(tcsTds.tds)}`}
              />
              <StatCard label="Charges" value={money(charges.total)} icon={Receipt} tone="steel" subtitle="Closing fee, commission" />
              <StatCard
                label="Other deductions"
                value={money(other.total)}
                icon={CircleEllipsis}
                tone="silver"
                subtitle={other.items.length ? other.items.map((item) => item.label).join(', ') : 'Nothing else deducted'}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="overflow-x-auto">
                <p className="mb-1.5 text-xs font-medium uppercase text-text-muted">What was deducted</p>
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-surface-hover text-xs text-text-muted">
                      <th scope="col" className="rounded-l-md px-3 py-2 font-medium">Item</th>
                      <th scope="col" className="px-3 py-2 font-medium">Lines</th>
                      <th scope="col" className="rounded-r-md px-3 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <SectionRows key={section.title} section={section} />
                    ))}
                    <tr className="bg-surface-hover font-semibold">
                      <td className="px-3 py-2 text-text" colSpan={2}>Total deducted by Amazon</td>
                      <td className="px-3 py-2 text-right text-danger">{money(deductionsTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard compact label="Released to bank" value={money(payout.released)} icon={Wallet} tone="blue" />
                  <StatCard compact label="Payable to Amazon" value={money(payout.payableToAmazon)} icon={Wallet} tone="charcoal" />
                </div>
                <div className="overflow-x-auto">
                  <p className="mb-1.5 text-xs font-medium uppercase text-text-muted">Settlements</p>
                  {payout.settlements.length ? (
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-surface-hover text-xs text-text-muted">
                          <th scope="col" className="rounded-l-md px-3 py-2 font-medium">Settlement</th>
                          <th scope="col" className="px-3 py-2 font-medium">Period</th>
                          <th scope="col" className="px-3 py-2 font-medium">Deposit</th>
                          <th scope="col" className="rounded-r-md px-3 py-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payout.settlements.map((settlement) => (
                          <tr key={settlement.settlementId} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 text-text">{settlement.settlementId}</td>
                            <td className="px-3 py-2 text-text-muted">{formatDay(settlement.startDate)} – {formatDay(settlement.endDate)}</td>
                            <td className="px-3 py-2 text-text-muted">{formatDay(settlement.depositDate)}</td>
                            <td className={cn('px-3 py-2 text-right font-medium', settlement.total < 0 ? 'text-danger' : 'text-success')}>
                              {settlement.total < 0 ? `−${money(-settlement.total)}` : money(settlement.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-text-muted">No settlement deposited in this period.</p>
                  )}
                  <p className="mt-1.5 text-xs text-text-muted">A negative total means Amazon is owed that amount (carried into the next settlement) — nothing was paid out.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </BaseCard>
  );
}

function SectionRows({ section }) {
  return (
    <>
      <tr className="border-b border-border bg-surface-hover/50">
        <td className="px-3 py-1.5 text-xs font-semibold uppercase text-text-muted">{section.title}</td>
        <td />
        <td className="px-3 py-1.5 text-right text-xs font-semibold text-text-muted">{money(section.total)}</td>
      </tr>
      {section.items.map((item) => (
        <tr key={`${section.title}-${item.label}`} className="border-b border-border last:border-0">
          <td className="px-3 py-2 text-text">{item.label}</td>
          <td className="px-3 py-2 text-text-muted">{item.lines ?? '—'}</td>
          <td className="px-3 py-2 text-right text-text">{item.amount < 0 ? `−${money(-item.amount)}` : money(item.amount)}</td>
        </tr>
      ))}
    </>
  );
}

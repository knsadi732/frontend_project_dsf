import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';

function fmt(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

export function Gstr3bReportCard({ report, isLoading }) {
  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">GSTR-3B summary</h3>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
              <div>
                <dt className="text-text-muted">Outward taxable value</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.outwardTaxableValue)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Output tax</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.outputTax)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">ITC claimed (this period)</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.itcClaimed)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">ITC not eligible (B2C)</dt>
                <dd className="text-lg font-semibold text-warning">{fmt(report?.itcIneligible)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Tax liability (before carried ITC)</dt>
                <dd className="text-lg font-semibold text-text">{fmt(report?.outputTax)}</dd>
              </div>
            </dl>

            {/* Electronic Credit Ledger view — the opening balance banked from
                earlier periods plus this period's own eligible ITC is what
                actually offsets the liability above; only what's left after
                that is real cash payable. */}
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-text-muted">ITC carried from earlier periods</dt>
                <dd className="text-base font-medium text-text">{fmt(report?.openingItcBalance)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Total ITC available</dt>
                <dd className="text-base font-medium text-text">{fmt(report?.availableItc)}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Net tax payable (cash)</dt>
                <dd className={`text-lg font-semibold ${Number(report?.netTaxPayable) > 0 ? 'text-danger' : 'text-success'}`}>
                  {fmt(report?.netTaxPayable)}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">ITC balance carried to next period</dt>
                <dd className="text-base font-medium text-text">{fmt(report?.closingItcBalance)}</dd>
              </div>
            </dl>
          </>
        )}
      </CardBody>
    </BaseCard>
  );
}

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
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-text-muted">Outward taxable value</dt>
              <dd className="text-lg font-semibold text-text">{fmt(report?.outwardTaxableValue)}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Output tax</dt>
              <dd className="text-lg font-semibold text-text">{fmt(report?.outputTax)}</dd>
            </div>
            <div>
              <dt className="text-text-muted">ITC claimed</dt>
              <dd className="text-lg font-semibold text-text">{fmt(report?.itcClaimed)}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Net tax payable</dt>
              <dd className="text-lg font-semibold text-text">{fmt(report?.netTaxPayable)}</dd>
            </div>
          </dl>
        )}
      </CardBody>
    </BaseCard>
  );
}

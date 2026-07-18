import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { AppButton } from '@/components/ui/AppButton';

export function LedgerCrossVerifyCard({ onVerify, isVerifying, result }) {
  return (
    <BaseCard>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Ledger cross-verification</h3>
        <AppButton size="sm" onClick={onVerify} loading={isVerifying}>
          Run cross-verify
        </AppButton>
      </CardHeader>
      <CardBody>
        {result ? (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-text-muted">Debit</dt>
              <dd className="font-medium text-text">₹{Number(result.debit).toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Credit</dt>
              <dd className="font-medium text-text">₹{Number(result.credit).toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Balance</dt>
              <dd className="font-medium text-text">₹{Number(result.balance).toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Verified at</dt>
              <dd className="font-medium text-text">{new Date(result.verifiedAt).toLocaleString('en-IN')}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-text-muted">Run cross-verify to re-derive and stamp the ledger balance.</p>
        )}
      </CardBody>
    </BaseCard>
  );
}

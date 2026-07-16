import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLoanEsignRequestByToken, signLoanEsignRequest } from '@/services/loanEsignRequest.api';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { pushToast } from '@/utils/toastBus';

// Public, unauthenticated page — the counter-party signing a loan agreement
// has no ERP login. Reads/writes the shared in-memory store directly
// (getLoanEsignRequestByToken/signLoanEsignRequest) rather than through the
// permission-gated CRUD layer used everywhere else in the app.
export function EsignSigningPage() {
  const { token } = useParams();
  const [request, setRequest] = useState(() => getLoanEsignRequestByToken(token));
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleSign = (event) => {
    event.preventDefault();
    if (!signerName.trim()) {
      setError('Type your full name to sign.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the terms before signing.');
      return;
    }
    const updated = signLoanEsignRequest(token, signerName.trim());
    setRequest({ ...updated });
    pushToast('success', 'Agreement signed successfully');
  };

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-text">Link not valid</h1>
          <p className="mt-2 text-sm text-text-muted">This e-sign link doesn't match any request. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-text">Loan Agreement — e-Signature</h1>
        <p className="mt-1 text-sm text-text-muted">DS Footwear ERP</p>

        <div className="mt-5 flex flex-col gap-2 rounded-md border border-border bg-surface-hover p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Party</span>
            <span className="font-medium text-text">{request.partyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Loan Amount</span>
            <span className="font-medium text-text">₹{Number(request.loanAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Interest Rate</span>
            <span className="font-medium text-text">{request.interestRatePercent}% per annum</span>
          </div>
          {request.termsNote && (
            <div className="flex flex-col gap-1 border-t border-border pt-2">
              <span className="text-text-muted">Terms</span>
              <span className="text-text">{request.termsNote}</span>
            </div>
          )}
        </div>

        {request.status === 'signed' ? (
          <div className="mt-6 rounded-md border border-success/30 bg-success/10 p-4 text-center">
            <p className="font-medium text-success">Already signed</p>
            <p className="mt-1 text-sm text-text-muted">
              Signed by {request.signerName} on {new Date(request.signedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSign} className="mt-6 flex flex-col gap-4">
            <AppInput
              label="Type your full name to sign"
              required
              value={signerName}
              onChange={(event) => {
                setSignerName(event.target.value);
                setError('');
              }}
            />
            <label className="flex items-start gap-2 text-sm text-text">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                checked={agreed}
                onChange={(event) => {
                  setAgreed(event.target.checked);
                  setError('');
                }}
              />
              I agree to borrow/lend ₹{Number(request.loanAmount).toLocaleString('en-IN')} at {request.interestRatePercent}% interest per annum, as discussed.
            </label>
            {error && <p className="text-xs text-danger">{error}</p>}
            <AppButton type="submit">Sign & Submit</AppButton>
          </form>
        )}
      </div>
    </div>
  );
}

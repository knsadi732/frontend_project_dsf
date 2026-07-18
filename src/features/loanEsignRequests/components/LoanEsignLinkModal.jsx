import { useState } from 'react';
import { Copy, Check, Mail, ExternalLink } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';

function buildMailto({ email, partyName, loanAmount, link }) {
  const subject = `Loan Agreement e-Sign Request — ${partyName}`;
  const body = [
    `Hi ${partyName},`,
    '',
    `Please review and e-sign the loan agreement for ₹${Number(loanAmount).toLocaleString('en-IN')} using the link below:`,
    link,
    '',
    'Regards,',
    'DS Footwear',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Shown right after a request is created — this mock has no real email
// service, so the request is already logged to the Communication Log as
// "sent" (see loanEsignRequest.api.js), but nothing actually leaves the
// browser. Two ways to get the link to the counter-party for real:
// copy it manually, or open it as a pre-filled draft in the user's own
// mail client (mailto: — Outlook on most Windows machines) so they send it
// themselves.
export function LoanEsignLinkModal({ open, onClose, request }) {
  const [copied, setCopied] = useState(false);
  const link = request?.link ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppModal open={open} onClose={onClose} title="Request sent" footer={<AppButton onClick={onClose}>Done</AppButton>}>
      <p className="mb-3 text-sm text-text-muted">
        Logged as sent to <span className="font-medium text-text">{request?.email}</span> in the Communication Log. No real
        email service is connected though — pick one of the options below to actually get the link to them.
      </p>

      <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-surface-hover px-3 py-2">
        <span className="flex-1 truncate text-sm text-text">{link}</span>
        <AppButton type="button" variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy link">
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </AppButton>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <AppButton type="button" variant="secondary" className="flex-1" onClick={handleCopy}>
          <Mail className="size-4" />
          {copied ? 'Link copied' : 'Copy link to send yourself'}
        </AppButton>
        <AppButton as="a" href={buildMailto(request ?? {})} variant="primary" className="flex-1">
          <ExternalLink className="size-4" />
          Open in Outlook
        </AppButton>
      </div>
    </AppModal>
  );
}

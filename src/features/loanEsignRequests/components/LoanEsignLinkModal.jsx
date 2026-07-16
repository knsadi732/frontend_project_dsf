import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';

// Shown right after a request is created — this mock has no real email
// service, so instead of the link being auto-delivered, the Finance user
// gets it here to share with the counter-party themselves (paste into a
// real email, WhatsApp, etc.).
export function LoanEsignLinkModal({ open, onClose, link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Request sent"
      footer={
        <AppButton onClick={onClose}>Done</AppButton>
      }
    >
      <p className="mb-3 text-sm text-text-muted">
        No real email service is connected, so this link isn't auto-delivered — copy it and share it with the counter-party yourself (email, WhatsApp, etc.).
      </p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-hover px-3 py-2">
        <span className="flex-1 truncate text-sm text-text">{link}</span>
        <AppButton type="button" variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy link">
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </AppButton>
      </div>
    </AppModal>
  );
}

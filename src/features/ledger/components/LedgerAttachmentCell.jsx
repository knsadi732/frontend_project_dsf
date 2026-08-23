import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { documentApi } from '@/services/document.api';
import { UploadButton } from '@/components/ui/ActionButtons';
import { AppButton } from '@/components/ui/AppButton';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

// Documents' download URL is a short-lived signed token (document.service.js
// getDownloadUrl) — never cached, resolved fresh on click rather than
// pre-fetched into a plain <a href> (unlike ViewButton in ActionButtons.jsx,
// which assumes a stable href it already has).
function ViewUploadedDocButton({ documentId, label }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    documentApi
      .getDownloadUrl(documentId)
      .then(({ url }) => window.open(url, '_blank', 'noreferrer'))
      .catch(() => pushToast('error', 'Failed to open document'))
      .finally(() => setLoading(false));
  };

  return (
    <AppButton variant="view" size="sm" title={label} aria-label={label} loading={loading} onClick={handleClick}>
      <ExternalLink className="size-4" />
    </AppButton>
  );
}

// One ledger row can carry two independent attachments — the transaction's
// own invoice, and proof of payment against it — each a generic Documents
// upload (`entityType: 'invoice' | 'payment_proof'`, `entityId` = the
// finance_transaction id). `document` is the already-uploaded row for this
// (transactionId, entityType) pair, if any, resolved by the panel from one
// shared documents list fetch (not a per-row query).
export function LedgerAttachmentCell({ transactionId, entityType, document, label }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileSelected = (file) => {
    setUploading(true);
    documentApi
      .upload({ file, entityType, entityId: transactionId })
      .then(() => {
        pushToast('success', `${label} uploaded`);
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.list({ entityType }) });
      })
      .catch(() => pushToast('error', `Failed to upload ${label.toLowerCase()}`))
      .finally(() => setUploading(false));
  };

  if (document) {
    return <ViewUploadedDocButton documentId={document.id} label={`View ${label.toLowerCase()}`} />;
  }

  return (
    <UploadButton
      label={`Upload ${label.toLowerCase()}`}
      accept=".pdf,.jpg,.jpeg,.png"
      disabled={uploading}
      onFileSelected={handleFileSelected}
    />
  );
}

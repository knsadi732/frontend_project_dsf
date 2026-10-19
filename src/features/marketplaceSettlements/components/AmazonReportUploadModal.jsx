import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { useImportAmazonReports } from '@/features/marketplaceSettlements/mutations/useImportAmazonReports';

const KIND_LABEL = { gst_report: 'GST report', settlement: 'Payments settlement' };

const money = (value) => `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// One plain-language line per processed file.
function describe(result) {
  if (!result.ok) return result.error;
  if (result.kind === 'settlement') {
    return result.skipped
      ? `Settlement ${result.settlementId} was already imported — nothing changed.`
      : `Settlement ${result.settlementId}: ${result.lines} lines imported, total ${result.total < 0 ? `−${money(-result.total)} (owed to Amazon)` : money(result.total)}.`;
  }
  const parts = [`${result.lines} new report lines`];
  if (result.creditNotes.length) parts.push(`credit notes recorded: ${result.creditNotes.join(', ')}`);
  if (result.ledgerPosted.length) parts.push(`ledger entries posted on their own dates: ${result.ledgerPosted.join(', ')}`);
  if (result.returnsUpdated.length) parts.push(`${result.returnsUpdated.length} return(s) completed`);
  if (result.voided.length) parts.push(`${result.voided.length} cancelled bill(s) voided`);
  return result.lines === 0 && parts.length === 1 ? 'Already imported — nothing new in this report.' : `${parts.join(' · ')}.`;
}

// "Upload Amazon report": drop the GST report (.csv) and/or Payments settlement files (.txt) — each file's
// type is detected on the server — and the ERP does the rest: credit notes, ledger entries on their own dates,
// refunds on returns, charges for the dashboard. Uploading a file twice is harmless.
export function AmazonReportUploadModal({ open, onClose }) {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const importReports = useImportAmazonReports();

  const handleClose = () => {
    setFiles([]);
    setResults(null);
    onClose();
  };

  const handleUpload = () => {
    importReports.mutateAsync(files).then((outcome) => {
      setResults(outcome);
      setFiles([]);
    });
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Upload Amazon report"
      footer={
        <>
          <AppButton variant="secondary" onClick={handleClose}>
            {results ? 'Done' : 'Cancel'}
          </AppButton>
          {!results && (
            <AppButton loading={importReports.isPending} disabled={!files.length} onClick={handleUpload}>
              Upload {files.length > 1 ? `${files.length} reports` : 'report'}
            </AppButton>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {results ? (
          <ul className="flex flex-col gap-2">
            {results.map((result) => (
              <li key={result.file} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-text">{result.file}</span>
                  {result.kind && <BaseBadge variant="info">{KIND_LABEL[result.kind]}</BaseBadge>}
                  <BaseBadge variant={result.ok ? 'success' : 'danger'}>{result.ok ? 'Done' : 'Failed'}</BaseBadge>
                </div>
                <p className="mt-1 text-sm text-text-muted">{describe(result)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-sm text-text-muted">
              Upload Amazon's <strong>GST report</strong> (.csv) and/or the <strong>Payments settlement</strong> files (.txt) — you can
              pick several at once. Credit notes, refunds, ledger/GST entries and Amazon's charges are updated from them.
            </p>
            <label className="flex flex-col gap-1 text-sm text-text">
              Amazon report files
              <input type="file" multiple accept=".csv,.txt" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
            </label>
            {files.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-text-muted">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppModal>
  );
}

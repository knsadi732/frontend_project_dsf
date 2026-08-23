import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLedgerQuery } from '@/features/ledger/queries/useLedgerQuery';
import { useLedgerSummaryQuery } from '@/features/ledger/queries/useLedgerSummaryQuery';
import { useRecordTransaction } from '@/features/ledger/mutations/useRecordTransaction';
import { useQuickEntry } from '@/features/ledger/mutations/useQuickEntry';
import { useCreateFundingSource } from '@/features/ledger/mutations/useCreateFundingSource';
import { AddFundModal } from '@/features/ledger/components/AddFundModal';
import { QuickEntryModal } from '@/features/ledger/components/QuickEntryModal';
import { FundingSourceModal } from '@/features/ledger/components/FundingSourceModal';
import { LedgerAttachmentCell } from '@/features/ledger/components/LedgerAttachmentCell';
import { documentApi } from '@/services/document.api';
import { queryKeys } from '@/config/queryKeys';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const FUNDING_TYPE_LABEL = { advance: 'Advance', loan: 'Loan', equity: 'Equity', other: 'Other' };

export function LedgerPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addFundOpen, setAddFundOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [fundingSourceOpen, setFundingSourceOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useLedgerQuery();
  const { data: summary, refetch: refetchSummary } = useLedgerSummaryQuery();
  const recordTransaction = useRecordTransaction();
  const quickEntry = useQuickEntry();
  const createFundingSource = useCreateFundingSource();
  const allEntries = data?.data ?? [];
  const start = (page - 1) * pageSize;
  const pageEntries = allEntries.slice(start, start + pageSize);
  const balance = summary?.balance ?? 0;

  // One shared fetch per attachment type (not per-row) — LedgerAttachmentCell
  // just looks up its own transaction id in the resulting map.
  const invoiceDocsFilters = { entityType: 'invoice', pageSize: 500 };
  const paymentDocsFilters = { entityType: 'payment_proof', pageSize: 500 };
  const { data: invoiceDocsData } = useQuery({
    queryKey: queryKeys.documents.list(invoiceDocsFilters),
    queryFn: () => documentApi.list({ entity_type: 'invoice', limit: 500 }),
  });
  const { data: paymentDocsData } = useQuery({
    queryKey: queryKeys.documents.list(paymentDocsFilters),
    queryFn: () => documentApi.list({ entity_type: 'payment_proof', limit: 500 }),
  });
  const invoiceDocsByTxId = useMemo(
    () => new Map((invoiceDocsData?.data ?? []).map((doc) => [doc.entity_id, doc])),
    [invoiceDocsData],
  );
  const paymentDocsByTxId = useMemo(
    () => new Map((paymentDocsData?.data ?? []).map((doc) => [doc.entity_id, doc])),
    [paymentDocsData],
  );

  const handleAddFund = (values) => {
    recordTransaction.mutateAsync(values).then(() => {
      setAddFundOpen(false);
      refetchSummary();
    });
  };

  const handleQuickEntry = (values) => {
    quickEntry.mutateAsync(values).then(() => {
      setQuickEntryOpen(false);
      refetchSummary();
    });
  };

  const handleCreateFundingSource = (values) => {
    createFundingSource.mutateAsync(values).then(() => setFundingSourceOpen(false));
  };

  const columns = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { key: 'particulars', header: 'Particulars' },
    { key: 'voucher', header: 'Voucher', render: (row) => <BaseBadge variant="info">{row.voucher}</BaseBadge> },
    { key: 'category', header: 'Category', render: (row) => row.category || '—' },
    { key: 'partyName', header: 'Party', render: (row) => row.partyName || '—' },
    { key: 'utrReference', header: 'UTR / Txn ID', render: (row) => row.utrReference || '—' },
    { key: 'invoiceNumber', header: 'Invoice No', render: (row) => row.invoiceNumber || '—' },
    { key: 'orderNumber', header: 'Order ID', render: (row) => row.orderNumber || '—' },
    {
      key: 'fundingSource',
      header: 'Fund Source',
      render: (row) =>
        row.fundingSourceName ? (
          <span title={row.fundingType ? FUNDING_TYPE_LABEL[row.fundingType] : undefined}>
            {row.fundingSourceName}
            {row.fundingType && <span className="text-text-muted"> ({FUNDING_TYPE_LABEL[row.fundingType]})</span>}
          </span>
        ) : (
          '—'
        ),
    },
    { key: 'paidReceivedByName', header: 'Paid/Received By', render: (row) => row.paidReceivedByName || '—' },
    {
      key: 'gstAmount',
      header: 'GST (₹)',
      render: (row) => (row.gstAmount ? row.gstAmount.toLocaleString('en-IN') : '—'),
    },
    {
      key: 'debit',
      header: 'Debit (₹)',
      render: (row) => (row.debit ? <span className="text-danger">{row.debit.toLocaleString('en-IN')}</span> : '—'),
    },
    {
      key: 'credit',
      header: 'Credit (₹)',
      render: (row) => (row.credit ? <span className="text-success">{row.credit.toLocaleString('en-IN')}</span> : '—'),
    },
    {
      key: 'balance',
      header: 'Balance (₹)',
      render: (row) => (
        <span className={row.balance >= 0 ? 'text-success' : 'text-danger'}>
          {row.balance >= 0 ? 'Cr' : 'Dr'} {Math.abs(row.balance).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'invoiceUpload',
      header: 'Invoice',
      render: (row) => (
        <LedgerAttachmentCell transactionId={row.id} entityType="invoice" document={invoiceDocsByTxId.get(row.id)} label="Invoice" />
      ),
    },
    {
      key: 'paymentUpload',
      header: 'Payment Proof',
      render: (row) => (
        <LedgerAttachmentCell transactionId={row.id} entityType="payment_proof" document={paymentDocsByTxId.get(row.id)} label="Payment proof" />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          General ledger — every finance transaction (debit/credit). Balance is credit minus debit, all-time.
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-text">
            Balance: <span className={balance >= 0 ? 'text-success' : 'text-danger'}>
              {balance >= 0 ? 'Cr' : 'Dr'} ₹{Math.abs(balance).toLocaleString('en-IN')}
            </span>
          </p>
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setQuickEntryOpen(true)}>Quick entry</CreateButton>
            <CreateButton onClick={() => setAddFundOpen(true)}>Add fund</CreateButton>
          </Can>
          <RefreshButton
            onClick={() => {
              refetch();
              refetchSummary();
            }}
            isFetching={isFetching}
          />
        </div>
      </div>

      <AppTable
        columns={columns}
        data={pageEntries}
        total={allEntries.length}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No ledger entries yet"
      />

      <AddFundModal
        open={addFundOpen}
        onClose={() => setAddFundOpen(false)}
        onSubmit={handleAddFund}
        isSubmitting={recordTransaction.isPending}
      />

      <QuickEntryModal
        open={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        onSubmit={handleQuickEntry}
        isSubmitting={quickEntry.isPending}
        onNewFundingSource={() => setFundingSourceOpen(true)}
      />

      <FundingSourceModal
        open={fundingSourceOpen}
        onClose={() => setFundingSourceOpen(false)}
        onSubmit={handleCreateFundingSource}
        isSubmitting={createFundingSource.isPending}
      />
    </div>
  );
}

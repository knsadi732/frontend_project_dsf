import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useReportsQuery } from '@/features/reports/queries/useReportsQuery';
import { useGenerateReport } from '@/features/reports/mutations/useGenerateReport';
import { reportApi } from '@/features/reports/api';
import { GenerateReportModal } from '@/features/reports/components/GenerateReportModal';
import { SalesReportsPanel } from '@/features/reports/components/SalesReportsPanel';
import { PurchaseReportsPanel } from '@/features/reports/components/PurchaseReportsPanel';
import { InventoryReportsPanel } from '@/features/reports/components/InventoryReportsPanel';
import { ProductionReportsPanel } from '@/features/reports/components/ProductionReportsPanel';
import { FinanceReportsPanel } from '@/features/reports/components/FinanceReportsPanel';
import { CustomerReportsPanel } from '@/features/reports/components/CustomerReportsPanel';
import { VendorReportsPanel } from '@/features/reports/components/VendorReportsPanel';
import { EmployeeReportsPanel } from '@/features/reports/components/EmployeeReportsPanel';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton } from '@/components/ui/ActionButtons';
import { AppButton } from '@/components/ui/AppButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { pushToast } from '@/utils/toastBus';

const REPORT_STATUS_VARIANT = { ready: 'success', pending: 'warning', failed: 'danger' };

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'sales', label: 'Sales' },
  { key: 'purchase', label: 'Purchase' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'production', label: 'Production' },
  { key: 'finance', label: 'Finance' },
  { key: 'customer', label: 'Customer' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'employee', label: 'Employee' },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const filters = { page, pageSize };
  const { data, isLoading } = useReportsQuery(filters);
  const generateReport = useGenerateReport();

  const handleSubmit = (values) => {
    generateReport.mutateAsync(values).then(() => setModalOpen(false));
  };

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    try {
      const blob = await reportApi.download(row.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = row.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      pushToast('error', 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type', render: (row) => <BaseBadge variant="info">{row.type}</BaseBadge> },
    { key: 'generatedAt', header: 'Generated At', render: (row) => new Date(row.generatedAt).toLocaleString() },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={REPORT_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'ready' && (
          <div className="flex justify-end">
            <DownloadButton label={`Download ${row.name}`} loading={downloadingId === row.id} onClick={() => handleDownload(row)} />
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Reports</h1>
          <p className="text-sm text-text-muted">Operational, financial and analytical reports across every module.</p>
        </div>
        {activeTab === 'overview' && (
          <Can module={MODULES.REPORTS} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Generate report
            </AppButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <>
          <AppTable
            columns={columns}
            data={data?.data ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            emptyMessage="No reports yet"
          />

          <GenerateReportModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            isSubmitting={generateReport.isPending}
          />
        </>
      )}

      {activeTab === 'sales' && <SalesReportsPanel />}
      {activeTab === 'purchase' && <PurchaseReportsPanel />}
      {activeTab === 'inventory' && <InventoryReportsPanel />}
      {activeTab === 'production' && <ProductionReportsPanel />}
      {activeTab === 'finance' && <FinanceReportsPanel />}
      {activeTab === 'customer' && <CustomerReportsPanel />}
      {activeTab === 'vendor' && <VendorReportsPanel />}
      {activeTab === 'employee' && <EmployeeReportsPanel />}
    </div>
  );
}

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useReportsQuery } from '@/features/reports/queries/useReportsQuery';
import { useGenerateReport } from '@/features/reports/mutations/useGenerateReport';
import { ReportTable } from '@/features/reports/components/ReportTable';
import { GenerateReportModal } from '@/features/reports/components/GenerateReportModal';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ReportsPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filters = { page, pageSize: DEFAULT_PAGE_SIZE };
  const { data, isLoading } = useReportsQuery(filters);
  const generateReport = useGenerateReport();

  const handleSubmit = (values) => {
    generateReport.mutateAsync(values).then(() => setModalOpen(false));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Reports</h1>
          <p className="text-sm text-text-muted">Generate and download business reports.</p>
        </div>
        <Can module={MODULES.REPORTS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Generate report
          </AppButton>
        </Can>
      </div>

      <ReportTable
        reports={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
      />

      <GenerateReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={generateReport.isPending}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useGstProfileQuery } from '@/features/compliance/queries/useGstProfileQuery';
import { useStatutoryAuditsQuery } from '@/features/compliance/queries/useStatutoryAuditsQuery';
import { useCreateStatutoryAudit } from '@/features/compliance/mutations/useCreateStatutoryAudit';
import { useCrossVerifyLedger } from '@/features/compliance/mutations/useCrossVerifyLedger';
import { useGstr1ReportQuery } from '@/features/compliance/queries/useGstr1ReportQuery';
import { useGstr3bReportQuery } from '@/features/compliance/queries/useGstr3bReportQuery';
import { useGstr2bProxyQuery } from '@/features/compliance/queries/useGstr2bProxyQuery';
import { usePnlReportQuery } from '@/features/compliance/queries/usePnlReportQuery';
import { GstProfileCard } from '@/features/compliance/components/GstProfileCard';
import { LedgerCrossVerifyCard } from '@/features/compliance/components/LedgerCrossVerifyCard';
import { StatutoryAuditFormModal } from '@/features/compliance/components/StatutoryAuditFormModal';
import { PnlReportCard } from '@/features/compliance/components/PnlReportCard';
import { BalanceSheetSnapshotCard } from '@/features/compliance/components/BalanceSheetSnapshotCard';
import { Gstr3bReportCard } from '@/features/compliance/components/Gstr3bReportCard';
import { Gstr1ReportSection } from '@/features/compliance/components/Gstr1ReportSection';
import { Gstr2bProxySection } from '@/features/compliance/components/Gstr2bProxySection';
import { AppTable } from '@/components/ui/AppTable';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { FilterBar } from '@/components/ui/FilterBar';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { usePersistedTab } from '@/hooks/usePersistedTab';
import {
  currentFyQuarter,
  currentFyStartYear,
  currentMonthValue,
  formatDisplayDate,
  fyOptions,
  fyRange,
  monthRange,
  quarterRange,
  QUARTER_OPTIONS,
} from '@/features/compliance/utils/reportPeriod';

const SUB_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'reports', label: 'Reports' },
];

// Default is 'monthly' (current month) — order here matches the dropdown order requested.
const PERIOD_TYPE_OPTIONS = [
  { value: 'ytd', label: 'YTD (Financial Year)' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

function ReportsTab() {
  const [periodType, setPeriodType] = useState('monthly');
  const [monthValue, setMonthValue] = useState(() => currentMonthValue());
  const [fyStartYear, setFyStartYear] = useState(() => String(currentFyStartYear()));
  const [quarter, setQuarter] = useState(() => String(currentFyQuarter()));
  // Custom mode reuses the old two-date-field behaviour (debounced, only fires once both are set).
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();

  const range = useMemo(() => {
    if (periodType === 'monthly') return monthRange(monthValue);
    if (periodType === 'quarterly') return quarterRange(Number(fyStartYear), Number(quarter));
    if (periodType === 'ytd') return fyRange(Number(fyStartYear));
    return { from: appliedDateFrom || undefined, to: appliedDateTo || undefined };
  }, [periodType, monthValue, fyStartYear, quarter, appliedDateFrom, appliedDateTo]);

  const { data: pnl, isLoading: isPnlLoading } = usePnlReportQuery(range);
  const { data: gstr3b, isLoading: isGstr3bLoading } = useGstr3bReportQuery(range);
  const { data: gstr1, isLoading: isGstr1Loading } = useGstr1ReportQuery(range);
  const { data: gstr2bProxy, isLoading: isGstr2bLoading } = useGstr2bProxyQuery(range);

  return (
    <div className="flex flex-col gap-3">
      <FilterBar>
        <AppSelect
          value={periodType}
          onChange={(event) => setPeriodType(event.target.value)}
          options={PERIOD_TYPE_OPTIONS}
          className="w-40"
          aria-label="Report period type"
        />

        {periodType === 'monthly' && (
          <AppInput
            type="month"
            value={monthValue}
            onChange={(event) => setMonthValue(event.target.value)}
            className="w-40"
            aria-label="Month"
          />
        )}

        {periodType === 'quarterly' && (
          <>
            <AppSelect
              value={fyStartYear}
              onChange={(event) => setFyStartYear(event.target.value)}
              options={fyOptions()}
              className="w-32"
              aria-label="Financial year"
            />
            <AppSelect
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
              options={QUARTER_OPTIONS}
              className="w-44"
              aria-label="Quarter"
            />
          </>
        )}

        {periodType === 'ytd' && (
          <AppSelect
            value={fyStartYear}
            onChange={(event) => setFyStartYear(event.target.value)}
            options={fyOptions()}
            className="w-32"
            aria-label="Financial year"
          />
        )}

        {periodType === 'custom' && (
          <>
            <AppInput
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-36"
              aria-label="Report period from"
            />
            <AppInput
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-36"
              aria-label="Report period to"
            />
          </>
        )}
      </FilterBar>

      {range.from && range.to && (
        <p className="text-xs text-text-muted">
          Showing: {formatDisplayDate(range.from)} – {formatDisplayDate(range.to)}
        </p>
      )}

      <PnlReportCard report={pnl} isLoading={isPnlLoading} />
      <BalanceSheetSnapshotCard report={pnl} isLoading={isPnlLoading} />
      <Gstr3bReportCard report={gstr3b} isLoading={isGstr3bLoading} />
      <Gstr1ReportSection report={gstr1} isLoading={isGstr1Loading} />
      <Gstr2bProxySection report={gstr2bProxy} isLoading={isGstr2bLoading} />
    </div>
  );
}

export function CompliancePanel() {
  // Persisted (not plain useState) so a dashboard tile can deep-link straight
  // into the Reports sub-tab by pre-seeding localStorage before navigating.
  const [subTab, setSubTab] = usePersistedTab('compliance', 'overview');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data: gstProfile, isLoading: isGstLoading } = useGstProfileQuery();
  const { data, isLoading } = useStatutoryAuditsQuery({ page, pageSize });
  const createAudit = useCreateStatutoryAudit();
  const crossVerify = useCrossVerifyLedger();

  const handleSubmit = (values) => {
    createAudit.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'conductedAt', header: 'Conducted', render: (row) => new Date(row.conductedAt).toLocaleDateString('en-IN') },
    { key: 'auditorName', header: 'Auditor' },
    { key: 'findings', header: 'Findings', render: (row) => row.findings || '—' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs tabs={SUB_TABS} activeKey={subTab} onChange={setSubTab} />

      {subTab === 'overview' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <GstProfileCard profile={gstProfile} isLoading={isGstLoading} />
            <LedgerCrossVerifyCard
              onVerify={() => crossVerify.mutate()}
              isVerifying={crossVerify.isPending}
              result={crossVerify.data}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Statutory audit records.</p>
            <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
              <CreateButton onClick={() => setFormOpen(true)}>Record audit</CreateButton>
            </Can>
          </div>

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
            emptyMessage="No statutory audits recorded yet"
          />

          <StatutoryAuditFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
            isSubmitting={createAudit.isPending}
          />
        </div>
      )}

      {subTab === 'reports' && <ReportsTab />}
    </div>
  );
}

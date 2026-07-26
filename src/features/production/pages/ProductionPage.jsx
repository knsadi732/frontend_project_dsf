import { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { useCreateWorkOrder } from '@/features/production/mutations/useCreateWorkOrder';
import { useUpdateWorkOrder } from '@/features/production/mutations/useUpdateWorkOrder';
import { useDeleteWorkOrder } from '@/features/production/mutations/useDeleteWorkOrder';
import { useUpdateProductionRequest } from '@/features/productionRequests/mutations/useUpdateProductionRequest';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { WorkOrderFormModal } from '@/features/production/components/WorkOrderFormModal';
import { ProductionRequestsPanel } from '@/features/productionRequests';
import { QualityInspectionFormModal } from '@/features/qualityInspections';
import { useCreateQualityInspection } from '@/features/qualityInspections/mutations/useCreateQualityInspection';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { WORK_ORDER_STAGE_OPTIONS } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function totalCost(row) {
  return (
    Number(row.rawMaterialCost || 0) +
    Number(row.labourCost || 0) +
    Number(row.machineCost || 0) +
    Number(row.electricityCost || 0) +
    Number(row.packagingCost || 0) +
    Number(row.overheadCost || 0)
  );
}

function downloadWorkOrderPdf(row, productName) {
  generateRecordPdf({
    title: `Work Order - ${row.workOrderNumber}`,
    fields: [
      { label: 'Product', value: productName },
      { label: 'Quantity', value: row.quantity },
      { label: 'Due Date', value: row.dueDate },
      { label: 'Stage', value: row.stage },
      { label: 'Total Production Cost', value: `Rs.${totalCost(row).toLocaleString('en-IN')}` },
    ],
    fileName: `${row.workOrderNumber}.pdf`,
  });
}

const TABS = [
  { key: 'workOrders', label: 'Work Orders' },
  { key: 'requests', label: 'Production Requests' },
];

export function ProductionPage() {
  const [activeTab, setActiveTab] = useState('workOrders');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, workOrder: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [convertingRequestId, setConvertingRequestId] = useState(null);
  const [inspectionTarget, setInspectionTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      page,
      pageSize,
    }),
    [debouncedSearch, status, appliedDateFrom, appliedDateTo, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useWorkOrdersQuery(filters);
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const productNameById = new Map((productsData?.data ?? []).map((product) => [product.id, product.name]));
  const createWorkOrder = useCreateWorkOrder();
  const updateWorkOrder = useUpdateWorkOrder();
  const deleteWorkOrder = useDeleteWorkOrder();
  const updateProductionRequest = useUpdateProductionRequest();
  const createQualityInspection = useCreateQualityInspection();

  const handleSubmit = (values) => {
    const action = formState.workOrder?.id
      ? updateWorkOrder.mutateAsync({ id: formState.workOrder.id, payload: values })
      : createWorkOrder.mutateAsync(values);

    action.then((result) => {
      if (convertingRequestId) {
        updateProductionRequest.mutate({
          id: convertingRequestId,
          payload: { status: 'converted_to_production_order', linkedWorkOrderId: result.id },
        });
        setConvertingRequestId(null);
      }
      setFormState({ open: false, workOrder: null });
    });
  };

  const handleConfirmDelete = () => {
    deleteWorkOrder.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const handleConvertToWorkOrder = (request) => {
    setConvertingRequestId(request.id);
    setActiveTab('workOrders');
    setFormState({
      open: true,
      workOrder: {
        workOrderNumber: '',
        productId: request.productId,
        quantity: request.quantity,
        stage: 'pending',
        dueDate: request.requiredDate,
      },
    });
  };

  const columns = [
    { key: 'workOrderNumber', header: 'Work Order #' },
    { key: 'product', header: 'Product', render: (row) => productNameById.get(row.productId) ?? row.productId },
    { key: 'quantity', header: 'Quantity' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'totalCost', header: 'Total Cost', render: (row) => `₹${totalCost(row).toLocaleString('en-IN')}` },
    { key: 'stage', header: 'Stage', render: (row) => <StatusBadge status={row.stage} /> },
    {
      key: 'linkedSo',
      header: 'Linked SO',
      render: (row) =>
        row.salesOrderNumber ? (
          <BaseBadge variant="info">{row.salesOrderNumber}</BaseBadge>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton
            label={`Download ${row.workOrderNumber}`}
            onClick={(event) => {
              event.stopPropagation();
              downloadWorkOrderPdf(row, productNameById.get(row.productId) ?? row.productId);
            }}
          />
          {row.stage !== 'completed' && row.stage !== 'cancelled' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setInspectionTarget(row);
                }}
                aria-label={`Record inspection for ${row.workOrderNumber}`}
                title="Record inspection"
              >
                <ClipboardCheck className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.workOrderNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, workOrder: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.workOrderNumber}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Production</h1>
          <p className="text-sm text-text-muted">Production requests and work orders.</p>
        </div>
        {activeTab === 'workOrders' && (
          <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, workOrder: null })}>New work order</CreateButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'workOrders' && (
        <>
          <FilterBar>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search work orders…"
              className="w-72"
            />
            <MultiFilter
              filters={[{ key: 'status', label: 'Stage', options: WORK_ORDER_STAGE_OPTIONS, placeholder: 'All stages' }]}
              values={{ status }}
              onChange={(key, value) => {
                setStatus(value);
                setPage(1);
              }}
              onClear={() => {
                setStatus('');
                setPage(1);
              }}
            />
            <AppInput
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="w-36"
              aria-label="Due date from"
            />
            <AppInput
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="w-36"
              aria-label="Due date to"
            />
            <RefreshButton onClick={refetch} isFetching={isFetching} />
          </FilterBar>

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
            onRowClick={(workOrder) => setFormState({ open: true, workOrder })}
            emptyMessage="No work orders yet"
          />

          <QualityInspectionFormModal
            open={Boolean(inspectionTarget)}
            workOrder={inspectionTarget}
            onClose={() => setInspectionTarget(null)}
            onSubmit={(values) => createQualityInspection.mutateAsync(values).then(() => setInspectionTarget(null))}
            isSubmitting={createQualityInspection.isPending}
          />

          <WorkOrderFormModal
            open={formState.open}
            initialValues={formState.workOrder}
            onClose={() => {
              setFormState({ open: false, workOrder: null });
              setConvertingRequestId(null);
            }}
            onSubmit={handleSubmit}
            isSubmitting={createWorkOrder.isPending || updateWorkOrder.isPending}
          />

          <AppModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title="Delete work order"
            footer={
              <>
                <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </AppButton>
                <AppButton variant="danger" loading={deleteWorkOrder.isPending} onClick={handleConfirmDelete}>
                  Delete
                </AppButton>
              </>
            }
          >
            <p className="text-sm text-text-muted">
              Are you sure you want to delete{' '}
              <span className="font-medium text-text">{deleteTarget?.workOrderNumber}</span>? This action cannot be
              undone.
            </p>
          </AppModal>
        </>
      )}

      {activeTab === 'requests' && <ProductionRequestsPanel onConvertToWorkOrder={handleConvertToWorkOrder} />}
    </div>
  );
}

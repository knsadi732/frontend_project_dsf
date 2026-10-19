import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnSchema } from '@/features/returns/validators/return.schema';
import { returnsApi } from '@/features/returns/api';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';
import {
  RETURN_STATUS,
  RETURN_STATUS_OPTIONS,
  RETURN_REASON_OPTIONS,
  INSPECTION_RESULT_OPTIONS,
  RETURN_DECISION_OPTIONS,
  RESOLUTION_TYPE_OPTIONS,
  REFUND_METHOD_OPTIONS,
} from '@/constants/statusEnums';

const DEFAULT_VALUES = {
  salesOrderId: '',
  productVariantId: '',
  warehouseId: '',
  quantity: '',
  type: 'customer',
  reason: '',
  amount: 0,
  status: RETURN_STATUS.REQUESTED,
  courierPartner: '',
  pickupDate: '',
  trackingNumber: '',
  inspectionResult: '',
  inspectionNotes: '',
  decision: '',
  resolutionType: 'none',
  refundAmount: 0,
  refundMethod: 'upi',
  refundReference: '',
  refundDate: '',
  replacementOrderId: null,
};

// Return/replacement window and the cancel cut-off. A marketplace or online order
// can be cancelled only before delivery, and returned/replaced only within 10 days
// of its delivery date. An offline (store) order has no window — it just has to be delivered.
const RETURN_WINDOW_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const PRE_DELIVERY_STATUSES = ['pending', 'confirmed', 'packed', 'dispatched'];
const POST_DELIVERY_STATUSES = ['delivered', 'completed'];

const ORDER_TYPE_OPTIONS = [
  { value: '', label: 'All order types' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
];
const REQUEST_TYPE_OPTIONS = [
  { value: 'return', label: 'Return' },
  { value: 'replacement', label: 'Replacement (exchange)' },
  { value: 'cancel', label: 'Cancel' },
];

function isEligible(order, requestType) {
  if (requestType === 'cancel') return PRE_DELIVERY_STATUSES.includes(order.status);
  if (!POST_DELIVERY_STATUSES.includes(order.status) || !order.deliveredAt) return false;
  if (order.orderSource === 'offline') return true;
  return Date.now() - new Date(order.deliveredAt).getTime() <= RETURN_WINDOW_DAYS * DAY_MS;
}

// The marketplace's own order ID is the real one; the internal ORD-… number is the fallback.
const orderLabel = (order) => `${order.channelOrderNumber || order.orderNumber} · ₹${Number(order.total ?? 0).toLocaleString('en-IN')}`;

const PICKUP_VISIBLE_STATUSES = [
  RETURN_STATUS.APPROVED,
  RETURN_STATUS.PARTIALLY_APPROVED,
  RETURN_STATUS.PICKUP_SCHEDULED,
  RETURN_STATUS.WAREHOUSE_RECEIVED,
  RETURN_STATUS.INSPECTION_COMPLETED,
  RETURN_STATUS.RESOLVED,
];
const INSPECTION_VISIBLE_STATUSES = [RETURN_STATUS.WAREHOUSE_RECEIVED, RETURN_STATUS.INSPECTION_COMPLETED, RETURN_STATUS.RESOLVED];
const DECISION_VISIBLE_STATUSES = [RETURN_STATUS.INSPECTION_COMPLETED, RETURN_STATUS.RESOLVED];

export function ReturnFormModal({ open, onClose, initialValues, onSubmit, onCancelOrder, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);
  const [orderType, setOrderType] = useState('');
  const [requestType, setRequestType] = useState('return');
  const [cancelError, setCancelError] = useState('');

  const { data: salesData } = useSalesOrdersQuery({ pageSize: 200 });
  const salesOrders = useMemo(() => salesData?.data ?? [], [salesData]);
  // New request: only the orders eligible for the chosen order type + request type.
  // Editing an existing return keeps the full list so its own order is always selectable.
  const soOptions = useMemo(
    () =>
      salesOrders
        .filter((so) => isEdit || ((!orderType || so.orderSource === orderType) && isEligible(so, requestType)))
        .map((so) => ({ value: so.id, label: orderLabel(so) })),
    [salesOrders, isEdit, orderType, requestType],
  );

  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const variants = useMemo(() => variantsData?.data ?? [], [variantsData]);

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((wh) => ({ value: wh.id, label: wh.name }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const previewNumber = useWatch({ control, name: '__returnNumberPreview' });
  const quantity = useWatch({ control, name: 'quantity' });
  const salesOrderId = useWatch({ control, name: 'salesOrderId' });
  const reason = useWatch({ control, name: 'reason' });
  const productVariantId = useWatch({ control, name: 'productVariantId' });
  const status = useWatch({ control, name: 'status' });
  const resolutionType = useWatch({ control, name: 'resolutionType' });

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? DEFAULT_VALUES);
    if (!initialValues?.id) {
      returnsApi.generateNumber().then((generated) => setValue('__returnNumberPreview', generated));
    }
  }, [open, initialValues, reset, setValue]);

  const selectedOrder = useMemo(() => salesOrders.find((item) => item.id === salesOrderId), [salesOrders, salesOrderId]);

  // The variants that were actually on the chosen order (matched by SKU); every
  // variant until an order is picked.
  const variantOptions = useMemo(() => {
    const onOrder = new Set((selectedOrder?.items ?? []).map((item) => item.sku));
    return variants
      .filter((variant) => onOrder.size === 0 || onOrder.has(variant.sku))
      .map((variant) => ({ value: variant.id, label: `${variant.sku} (₹${variant.sellingPrice})` }));
  }, [variants, selectedOrder]);

  useEffect(() => {
    const variant = variants.find((item) => item.id === productVariantId);
    if (!variant || !quantity) return;
    // A marketplace order is priced by its invoice, not the catalog — for a
    // single-line order take the amount from the order's own total.
    const lines = selectedOrder?.items ?? [];
    if (lines.length === 1 && Number(lines[0].quantity) > 0 && Number(selectedOrder.total) >= 0) {
      setValue('amount', (Number(selectedOrder.total) * Number(quantity)) / Number(lines[0].quantity));
    } else {
      setValue('amount', Number(variant.sellingPrice) * Number(quantity));
    }
  }, [productVariantId, quantity, variants, selectedOrder, setValue]);

  const handleSalesOrderChange = (nextOrderId) => {
    const so = salesOrders.find((item) => item.id === nextOrderId);
    setValue('warehouseId', so?.warehouseId ?? '');
    // Pre-fill the product and quantity from the order's first line.
    const firstLine = so?.items?.[0];
    const variant = firstLine && variants.find((item) => item.sku === firstLine.sku);
    if (variant) {
      setValue('productVariantId', variant.id);
      setValue('quantity', Number(firstLine.quantity));
    }
  };

  const clearOrder = () => {
    setValue('salesOrderId', '');
    setValue('productVariantId', '');
    setValue('quantity', '');
    setValue('warehouseId', '');
  };

  // Eligibility depends on the filters, so a previously picked order may no longer qualify.
  const changeOrderType = (value) => {
    setOrderType(value);
    clearOrder();
  };
  const changeRequestType = (value) => {
    setRequestType(value);
    clearOrder();
    setCancelError('');
  };

  const isCancel = !isEdit && requestType === 'cancel';
  const submitForm = handleSubmit((values) => onSubmit({ ...values, ...(!isEdit && requestType === 'replacement' && { resolutionType: 'replacement' }) }));

  const handleCancelOrder = () => {
    if (!salesOrderId) return setCancelError('Select the order to cancel');
    if (!reason) return setCancelError('Reason is required');
    setCancelError('');
    return onCancelOrder({ id: salesOrderId, reason: RETURN_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason });
  };

  const showPickup = PICKUP_VISIBLE_STATUSES.includes(status);
  const showInspection = INSPECTION_VISIBLE_STATUSES.includes(status);
  const showDecision = DECISION_VISIBLE_STATUSES.includes(status);
  const showWarehouse = showInspection || showDecision;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit return' : isCancel ? 'Cancel order' : 'New return'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Close
          </AppButton>
          {isCancel ? (
            <AppButton variant="danger" onClick={handleCancelOrder} loading={isSubmitting}>
              Cancel order
            </AppButton>
          ) : (
            <AppButton type="submit" form="return-form" loading={isSubmitting}>
              {requestType === 'replacement' && !isEdit ? 'Save replacement' : 'Save return'}
            </AppButton>
          )}
        </>
      }
    >
      <form id="return-form" onSubmit={submitForm} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Request" options={REQUEST_TYPE_OPTIONS} value={requestType} onChange={(event) => changeRequestType(event.target.value)} />
            <AppSelect label="Order type" options={ORDER_TYPE_OPTIONS} value={orderType} onChange={(event) => changeOrderType(event.target.value)} />
          </div>
        )}
        {!isEdit && (
          <p className="-mt-2 text-xs text-text-muted">
            {requestType === 'cancel'
              ? 'Only orders not yet delivered can be cancelled.'
              : 'Only orders delivered within the last 10 days (marketplace / online) are listed.'}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {!isCancel && (
            <AppInput label="Return Number" disabled placeholder={previewNumber ? undefined : 'Loading…'} value={previewNumber ?? initialValues?.returnNumber ?? ''} readOnly helperText="Preview only — confirmed on save" />
          )}
          <Controller
            control={control}
            name="salesOrderId"
            render={({ field }) => (
              <AppComboSelect
                label="Order ID"
                required
                placeholder={soOptions.length ? 'Search order ID…' : 'No eligible orders'}
                options={soOptions}
                error={errors.salesOrderId?.message ?? (isCancel && !salesOrderId ? cancelError : undefined)}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  handleSalesOrderChange(value);
                }}
              />
            )}
          />
          {isCancel && (
            <AppSelect
              label="Reason"
              required
              placeholder="Select reason"
              options={RETURN_REASON_OPTIONS}
              error={isCancel && salesOrderId ? cancelError : undefined}
              {...register('reason')}
            />
          )}
        </div>

        {!isCancel && (
        <>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Product Variant (SKU)"
            required
            placeholder="Select variant"
            options={variantOptions}
            error={errors.productVariantId?.message}
            {...register('productVariantId')}
          />
          <AppInput label="Quantity" type="number" required error={errors.quantity?.message} {...register('quantity')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Type"
            options={[
              { value: 'customer', label: 'Customer return (CR)' },
              { value: 'courier', label: 'Courier return (RTO)' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
          <AppSelect
            label="Reason"
            required
            placeholder="Select reason"
            options={RETURN_REASON_OPTIONS}
            error={errors.reason?.message}
            {...register('reason')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" readOnly error={errors.amount?.message} {...register('amount')} />
          <AppSelect label="Status" error={errors.status?.message} options={RETURN_STATUS_OPTIONS} {...register('status')} />
        </div>

        {showWarehouse && (
          <AppSelect
            label="Warehouse (for restock)"
            placeholder="Select warehouse"
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
        )}

        {showPickup && (
          <div className="flex flex-col gap-4 rounded-lg border border-border p-3">
            <p className="text-xs font-medium uppercase text-text-muted">Pickup</p>
            <div className="grid grid-cols-3 gap-4">
              <AppInput label="Courier partner" error={errors.courierPartner?.message} {...register('courierPartner')} />
              <AppInput label="Pickup date" type="date" error={errors.pickupDate?.message} {...register('pickupDate')} />
              <AppInput label="Tracking number" error={errors.trackingNumber?.message} {...register('trackingNumber')} />
            </div>
          </div>
        )}

        {showInspection && (
          <div className="flex flex-col gap-4 rounded-lg border border-border p-3">
            <p className="text-xs font-medium uppercase text-text-muted">Quality inspection</p>
            <div className="grid grid-cols-2 gap-4">
              <AppSelect
                label="Inspection result"
                placeholder="Select result"
                options={INSPECTION_RESULT_OPTIONS}
                error={errors.inspectionResult?.message}
                {...register('inspectionResult')}
              />
              <AppInput label="Inspection notes" error={errors.inspectionNotes?.message} {...register('inspectionNotes')} />
            </div>
          </div>
        )}

        {showDecision && (
          <div className="flex flex-col gap-4 rounded-lg border border-border p-3">
            <p className="text-xs font-medium uppercase text-text-muted">Decision & resolution</p>
            <div className="grid grid-cols-2 gap-4">
              <AppSelect
                label="Decision"
                placeholder="Select decision"
                options={RETURN_DECISION_OPTIONS}
                error={errors.decision?.message}
                {...register('decision')}
              />
              <AppSelect label="Resolution type" options={RESOLUTION_TYPE_OPTIONS} error={errors.resolutionType?.message} {...register('resolutionType')} />
            </div>

            {resolutionType === 'refund' && (
              <div className="grid grid-cols-2 gap-4">
                <AppInput label="Refund amount (₹)" type="number" error={errors.refundAmount?.message} {...register('refundAmount')} />
                <AppSelect label="Refund method" options={REFUND_METHOD_OPTIONS} error={errors.refundMethod?.message} {...register('refundMethod')} />
                <AppInput label="Refund reference" error={errors.refundReference?.message} {...register('refundReference')} />
                <AppInput label="Refund date" type="date" error={errors.refundDate?.message} {...register('refundDate')} />
              </div>
            )}
          </div>
        )}
        </>
        )}
      </form>
    </AppModal>
  );
}

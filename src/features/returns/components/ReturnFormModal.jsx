import { useEffect, useMemo } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnSchema } from '@/features/returns/validators/return.schema';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
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
  returnNumber: '',
  salesOrderId: '',
  soNumber: '',
  customer: '',
  productId: '',
  quantity: '',
  type: 'customer',
  reason: '',
  amount: 0,
  createdDate: '',
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
  refundStatus: 'pending',
  replacementOrderId: null,
};

const PICKUP_VISIBLE_STATUSES = [
  RETURN_STATUS.APPROVED,
  RETURN_STATUS.PARTIALLY_APPROVED,
  RETURN_STATUS.PICKUP_SCHEDULED,
  RETURN_STATUS.WAREHOUSE_RECEIVED,
  RETURN_STATUS.INSPECTION_COMPLETED,
  RETURN_STATUS.RESOLVED,
];
const INSPECTION_VISIBLE_STATUSES = [
  RETURN_STATUS.WAREHOUSE_RECEIVED,
  RETURN_STATUS.INSPECTION_COMPLETED,
  RETURN_STATUS.RESOLVED,
];
const DECISION_VISIBLE_STATUSES = [RETURN_STATUS.INSPECTION_COMPLETED, RETURN_STATUS.RESOLVED];

export function ReturnFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: salesData } = useSalesOrdersQuery({ pageSize: 100 });
  const salesOrders = salesData?.data ?? [];
  const soOptions = salesOrders.map((so) => ({ value: so.id, label: so.soNumber }));

  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const productOptions = products.map((product) => ({ value: product.id, label: `${product.name} (₹${product.sellingPrice})` }));

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

  const quantity = useWatch({ control, name: 'quantity' });
  const productId = useWatch({ control, name: 'productId' });
  const status = useWatch({ control, name: 'status' });
  const resolutionType = useWatch({ control, name: 'resolutionType' });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  useEffect(() => {
    const product = products.find((item) => item.id === productId);
    if (product && quantity) {
      setValue('amount', Number(product.sellingPrice) * Number(quantity));
    }
  }, [productId, quantity, products, setValue]);

  const handleSalesOrderChange = (salesOrderId) => {
    const so = salesOrders.find((item) => item.id === salesOrderId);
    setValue('soNumber', so?.soNumber ?? '');
    setValue('customer', so?.customer ?? '');
  };

  const showPickup = PICKUP_VISIBLE_STATUSES.includes(status);
  const showInspection = INSPECTION_VISIBLE_STATUSES.includes(status);
  const showDecision = DECISION_VISIBLE_STATUSES.includes(status);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues?.id ? 'Edit return' : 'New return'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="return-form" loading={isSubmitting}>
            Save return
          </AppButton>
        </>
      }
    >
      <form id="return-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Return Number"
            required
            error={errors.returnNumber?.message}
            {...register('returnNumber')}
          />
          <Controller
            control={control}
            name="salesOrderId"
            render={({ field }) => (
              <AppSelect
                label="Sales Order"
                required
                placeholder="Select sales order"
                options={soOptions}
                error={errors.salesOrderId?.message}
                value={field.value}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event);
                  handleSalesOrderChange(event.target.value);
                }}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Product"
            required
            placeholder="Select product"
            options={productOptions}
            error={errors.productId?.message}
            {...register('productId')}
          />
          <AppInput
            label="Quantity"
            type="number"
            required
            error={errors.quantity?.message}
            {...register('quantity')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Type"
            options={[
              { value: 'customer', label: 'Customer return' },
              { value: 'courier', label: 'Courier return' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
          <AppInput
            label="Date"
            type="date"
            required
            error={errors.createdDate?.message}
            {...register('createdDate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Reason"
            required
            placeholder="Select reason"
            options={RETURN_REASON_OPTIONS}
            error={errors.reason?.message}
            {...register('reason')}
          />
          <AppSelect
            label="Status"
            error={errors.status?.message}
            options={RETURN_STATUS_OPTIONS}
            {...register('status')}
          />
        </div>

        <AppInput label="Amount (₹)" type="number" readOnly error={errors.amount?.message} {...register('amount')} />

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
              <AppSelect
                label="Resolution type"
                options={RESOLUTION_TYPE_OPTIONS}
                error={errors.resolutionType?.message}
                {...register('resolutionType')}
              />
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
      </form>
    </AppModal>
  );
}

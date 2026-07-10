import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salesOrderSchema } from '@/features/sales/validators/salesOrder.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ORDER_STATUS } from '@/constants/statusEnums';

const STATUS_OPTIONS = Object.values(ORDER_STATUS).map((status) => ({
  value: status,
  label: status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()),
}));

const DEFAULT_VALUES = { soNumber: '', customer: '', orderDate: '', total: '', status: 'draft' };

export function SalesOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit sales order' : 'New sales order'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="sales-order-form" loading={isSubmitting}>
            Save sales order
          </AppButton>
        </>
      }
    >
      <form id="sales-order-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="SO Number" required error={errors.soNumber?.message} {...register('soNumber')} />
          <AppInput label="Customer" required error={errors.customer?.message} {...register('customer')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Order Date"
            type="date"
            required
            error={errors.orderDate?.message}
            {...register('orderDate')}
          />
          <AppInput
            label="Total"
            type="number"
            step="0.01"
            required
            error={errors.total?.message}
            {...register('total')}
          />
        </div>
        <AppSelect
          label="Status"
          error={errors.status?.message}
          options={STATUS_OPTIONS}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

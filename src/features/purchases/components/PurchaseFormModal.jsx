import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseSchema } from '@/features/purchases/validators/purchase.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ORDER_STATUS } from '@/constants/statusEnums';

const DEFAULT_VALUES = { poNumber: '', supplier: '', orderDate: '', total: '', status: ORDER_STATUS.DRAFT };

const STATUS_OPTIONS = Object.values(ORDER_STATUS).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
}));

export function PurchaseFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit purchase order' : 'New purchase order'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="purchase-form" loading={isSubmitting}>
            Save purchase order
          </AppButton>
        </>
      }
    >
      <form id="purchase-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="PO Number" required error={errors.poNumber?.message} {...register('poNumber')} />
          <AppInput label="Supplier" required error={errors.supplier?.message} {...register('supplier')} />
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
        <AppSelect label="Status" error={errors.status?.message} options={STATUS_OPTIONS} {...register('status')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderSchema } from '@/features/production/validators/workOrder.schema';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { WORK_ORDER_STAGE_OPTIONS } from '@/constants/statusEnums';

const DEFAULT_VALUES = { workOrderNumber: '', productId: '', quantity: '', stage: 'pending', dueDate: '' };

export function WorkOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const productOptions = (productsData?.data ?? []).map((product) => ({ value: product.id, label: product.name }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit work order' : 'New work order'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="work-order-form" loading={isSubmitting}>
            Save work order
          </AppButton>
        </>
      }
    >
      <form id="work-order-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput
          label="Work order number"
          required
          error={errors.workOrderNumber?.message}
          {...register('workOrderNumber')}
        />
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
          <AppInput
            label="Due date"
            type="date"
            required
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
          <AppSelect
            label="Stage"
            error={errors.stage?.message}
            options={WORK_ORDER_STAGE_OPTIONS}
            {...register('stage')}
          />
        </div>
        {initialValues?.salesOrderNumber && (
          <p className="text-xs text-text-muted">
            Linked Sales Order: <span className="font-medium text-text">{initialValues.salesOrderNumber}</span>{' '}
            (auto-created)
          </p>
        )}
      </form>
    </AppModal>
  );
}

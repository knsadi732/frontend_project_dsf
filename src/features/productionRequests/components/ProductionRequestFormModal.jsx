import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productionRequestSchema, PRODUCTION_REQUEST_STATUS_OPTIONS } from '@/features/productionRequests/validators/productionRequest.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  prNumber: '',
  productId: '',
  quantity: '',
  requiredDate: '',
  warehouseId: '',
  priority: 'normal',
  requestedBy: '',
  status: 'draft',
};

export function ProductionRequestFormModal({ open, onClose, initialValues, productOptions, warehouseOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productionRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit production request' : 'New production request'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="production-request-form" loading={isSubmitting}>
            Save request
          </AppButton>
        </>
      }
    >
      <form id="production-request-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="PR Number" required error={errors.prNumber?.message} {...register('prNumber')} />
          <AppInput label="Requested by" required error={errors.requestedBy?.message} {...register('requestedBy')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Product" placeholder="Select product" required options={productOptions} error={errors.productId?.message} {...register('productId')} />
          <AppInput label="Quantity" type="number" required error={errors.quantity?.message} {...register('quantity')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Warehouse" placeholder="Select warehouse" required options={warehouseOptions} error={errors.warehouseId?.message} {...register('warehouseId')} />
          <AppInput label="Required date" type="date" required error={errors.requiredDate?.message} {...register('requiredDate')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <AppSelect label="Status" options={PRODUCTION_REQUEST_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
        </div>
      </form>
    </AppModal>
  );
}

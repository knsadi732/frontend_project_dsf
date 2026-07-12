import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseSchema } from '@/features/warehouses/validators/warehouse.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { name: '', branchId: '', status: 'active' };

export function WarehouseFormModal({ open, onClose, initialValues, branchOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit warehouse' : 'New warehouse'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="warehouse-form" loading={isSubmitting}>
            Save warehouse
          </AppButton>
        </>
      }
    >
      <form id="warehouse-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
        <AppSelect
          label="Branch"
          placeholder="Select branch"
          required
          options={branchOptions}
          error={errors.branchId?.message}
          {...register('branchId')}
        />
        <AppSelect
          label="Status"
          error={errors.status?.message}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

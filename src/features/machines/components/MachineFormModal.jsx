import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { name: '', machineType: '', warehouseId: '', remarks: '' };

export function MachineFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New machine"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="machine-form" loading={isSubmitting}>Save machine</AppButton>
        </>
      }
    >
      <form id="machine-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
        <AppInput label="Type" placeholder="e.g. Injection Molding, Lasting Machine" {...register('machineType')} />
        <AppSelect label="Warehouse" placeholder="Select warehouse" options={warehouseOptions} {...register('warehouseId')} />
        <AppInput label="Remarks" {...register('remarks')} />
      </form>
    </AppModal>
  );
}

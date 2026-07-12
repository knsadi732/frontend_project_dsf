import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseZoneSchema, ZONE_TYPE_OPTIONS } from '@/features/warehouseZones/validators/warehouseZone.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { warehouseId: '', name: '', zoneType: 'storage', status: 'active' };

export function WarehouseZoneFormModal({ open, onClose, initialValues, warehouseOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(warehouseZoneSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit zone' : 'New zone'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="warehouse-zone-form" loading={isSubmitting}>
            Save zone
          </AppButton>
        </>
      }
    >
      <form id="warehouse-zone-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Warehouse"
          placeholder="Select warehouse"
          required
          options={warehouseOptions}
          error={errors.warehouseId?.message}
          {...register('warehouseId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
          <AppSelect label="Zone type" options={ZONE_TYPE_OPTIONS} error={errors.zoneType?.message} {...register('zoneType')} />
        </div>
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

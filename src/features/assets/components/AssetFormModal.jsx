import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema, ASSET_TYPE_OPTIONS } from '@/features/assets/validators/asset.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  employeeId: '',
  assetType: 'laptop',
  assetName: '',
  serialNumber: '',
  assignedDate: '',
  returnedDate: '',
  status: 'assigned',
};

export function AssetFormModal({ open, onClose, initialValues, employeeOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit asset' : 'New asset assignment'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="asset-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Employee"
            placeholder="Select employee"
            required
            options={employeeOptions}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />
          <AppSelect label="Asset type" options={ASSET_TYPE_OPTIONS} error={errors.assetType?.message} {...register('assetType')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Asset name" required error={errors.assetName?.message} {...register('assetName')} />
          <AppInput label="Serial number" error={errors.serialNumber?.message} {...register('serialNumber')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Assigned date" type="date" error={errors.assignedDate?.message} {...register('assignedDate')} />
          <AppInput label="Returned date" type="date" error={errors.returnedDate?.message} {...register('returnedDate')} />
        </div>
        <AppSelect
          label="Status"
          options={[
            { value: 'assigned', label: 'Assigned' },
            { value: 'returned', label: 'Returned' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

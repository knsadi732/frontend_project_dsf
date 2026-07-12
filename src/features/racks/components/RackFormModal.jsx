import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rackSchema } from '@/features/racks/validators/rack.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { zoneId: '', code: '', maxCapacity: 0, status: 'active' };

export function RackFormModal({ open, onClose, initialValues, zoneOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rackSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit rack' : 'New rack'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="rack-form" loading={isSubmitting}>
            Save rack
          </AppButton>
        </>
      }
    >
      <form id="rack-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Zone"
          placeholder="Select zone"
          required
          options={zoneOptions}
          error={errors.zoneId?.message}
          {...register('zoneId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Rack code" required error={errors.code?.message} {...register('code')} />
          <AppInput label="Max capacity" type="number" error={errors.maxCapacity?.message} {...register('maxCapacity')} />
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

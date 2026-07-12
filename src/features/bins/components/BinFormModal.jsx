import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { binSchema } from '@/features/bins/validators/bin.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { shelfId: '', code: '', capacity: 0, currentQuantity: 0, status: 'active' };

export function BinFormModal({ open, onClose, initialValues, shelfOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(binSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit bin' : 'New bin'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="bin-form" loading={isSubmitting}>
            Save bin
          </AppButton>
        </>
      }
    >
      <form id="bin-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Shelf"
          placeholder="Select shelf"
          required
          options={shelfOptions}
          error={errors.shelfId?.message}
          {...register('shelfId')}
        />
        <AppInput label="Bin code" required error={errors.code?.message} {...register('code')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Capacity" type="number" error={errors.capacity?.message} {...register('capacity')} />
          <AppInput label="Current quantity" type="number" error={errors.currentQuantity?.message} {...register('currentQuantity')} />
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

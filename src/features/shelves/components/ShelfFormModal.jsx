import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shelfSchema } from '@/features/shelves/validators/shelf.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { rackId: '', code: '', capacity: 0, status: 'active' };

export function ShelfFormModal({ open, onClose, initialValues, rackOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shelfSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit shelf' : 'New shelf'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="shelf-form" loading={isSubmitting}>
            Save shelf
          </AppButton>
        </>
      }
    >
      <form id="shelf-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Rack"
          placeholder="Select rack"
          required
          options={rackOptions}
          error={errors.rackId?.message}
          {...register('rackId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Shelf code" required error={errors.code?.message} {...register('code')} />
          <AppInput label="Capacity" type="number" error={errors.capacity?.message} {...register('capacity')} />
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

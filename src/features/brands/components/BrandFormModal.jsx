import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandSchema } from '@/features/brands/validators/brand.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { name: '', country: '', description: '', status: 'active' };

export function BrandFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit brand' : 'New brand'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="brand-form" loading={isSubmitting}>
            Save brand
          </AppButton>
        </>
      }
    >
      <form id="brand-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
        <AppInput label="Country" error={errors.country?.message} {...register('country')} />
        <AppInput label="Description" error={errors.description?.message} {...register('description')} />
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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '@/features/categories/validators/category.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { name: '', categoryCode: '', parentId: '', status: 'active' };

export function CategoryFormModal({ open, onClose, initialValues, parentOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit category' : 'New category'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="category-form" loading={isSubmitting}>
            Save category
          </AppButton>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
          <AppInput label="Category code" required error={errors.categoryCode?.message} {...register('categoryCode')} />
        </div>
        <AppSelect
          label="Parent category"
          placeholder="None (top level)"
          options={parentOptions}
          error={errors.parentId?.message}
          {...register('parentId')}
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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { branchSchema } from '@/features/branches/validators/branch.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { name: '', status: 'active' };

export function BranchFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit branch' : 'New branch'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="branch-form" loading={isSubmitting}>
            Save branch
          </AppButton>
        </>
      }
    >
      <form id="branch-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
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

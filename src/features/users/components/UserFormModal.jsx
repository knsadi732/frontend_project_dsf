import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/features/users/validators/user.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ROLES } from '@/constants/roles';

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: role }));

const DEFAULT_VALUES = { name: '', email: '', role: 'STAFF', status: 'active' };

export function UserFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit user' : 'New user'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="user-form" loading={isSubmitting}>
            Save user
          </AppButton>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
        <AppInput label="Email" type="email" required error={errors.email?.message} {...register('email')} />
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Role" error={errors.role?.message} options={ROLE_OPTIONS} {...register('role')} />
          <AppSelect
            label="Status"
            error={errors.status?.message}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
      </form>
    </AppModal>
  );
}

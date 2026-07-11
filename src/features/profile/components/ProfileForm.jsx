import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@/features/profile/validators/profile.schema';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { getEmployeeFullName } from '@/utils/employeeName';

const DEFAULT_VALUES = { firstName: '', middleName: '', lastName: '', phone: '' };

export function ProfileForm({ user, departmentName, designationTitle, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName ?? '',
      middleName: user?.middleName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    });
  }, [user, reset]);

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center gap-4">
        <BaseAvatar name={getEmployeeFullName(user)} src={user.photo} size="lg" />
        <div>
          <p className="text-base font-semibold text-text">{getEmployeeFullName(user)}</p>
          <p className="text-sm text-text-muted">{user.employeeCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AppInput label="First name" required error={errors.firstName?.message} {...register('firstName')} />
        <AppInput label="Middle name" error={errors.middleName?.message} {...register('middleName')} />
        <AppInput label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AppInput label="Phone" required error={errors.phone?.message} {...register('phone')} />
        <AppInput label="Email" value={user.email ?? ''} disabled readOnly helperText="Contact an admin to change your email." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">Role</span>
          <div>
            <BaseBadge variant="info">{user.role}</BaseBadge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AppInput label="Department" value={departmentName ?? '—'} disabled readOnly />
        <AppInput label="Designation" value={designationTitle ?? '—'} disabled readOnly />
      </div>

      <div>
        <AppButton type="submit" loading={isSubmitting}>
          Save changes
        </AppButton>
      </div>
    </form>
  );
}

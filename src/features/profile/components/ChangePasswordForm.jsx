import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema } from '@/features/profile/validators/profile.schema';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ChangePasswordForm({ onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const submit = (values) => {
    onSubmit(values);
    reset(DEFAULT_VALUES);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-sm flex-col gap-4" noValidate>
      <AppInput
        label="Current password"
        type="password"
        required
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <AppInput
        label="New password"
        type="password"
        required
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <AppInput
        label="Confirm new password"
        type="password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <div>
        <AppButton type="submit" loading={isSubmitting}>
          Change password
        </AppButton>
      </div>
    </form>
  );
}

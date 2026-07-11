import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/validators/login.schema';
import { useLoginMutation } from '@/features/auth/mutations/useLoginMutation';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = (values) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        const redirectTo = location.state?.from ?? '/dashboard';
        navigate(redirectTo, { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-xl font-semibold text-text">Sign in</h1>
      <p className="mb-6 text-sm text-text-muted">Access your DS Footwear ERP workspace.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          error={errors.phone?.message}
          {...register('phone')}
        />
        <AppInput
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <AppButton type="submit" loading={loginMutation.isPending} className="mt-2 w-full">
          Sign in
        </AppButton>
      </form>
    </div>
  );
}

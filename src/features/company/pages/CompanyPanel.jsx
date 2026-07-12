import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';
import { useUpdateCompany } from '@/features/company/mutations/useUpdateCompany';
import { companySchema } from '@/features/company/validators/company.schema';
import { BaseCard } from '@/components/ui/BaseCard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_VALUES = {
  name: '',
  gstNumber: '',
  panNumber: '',
  cin: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  phone: '',
  email: '',
  financialYearStart: '',
  financialYearEnd: '',
  status: 'active',
};

export function CompanyPanel() {
  const { data: company, isLoading } = useCompanyQuery();
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (company) reset(company);
  }, [company, reset]);

  const { can } = useAuth();
  const canEdit = can(MODULES.USERS, ACTIONS.EDIT);

  if (isLoading) {
    return (
      <BaseCard>
        <BaseLoader />
      </BaseCard>
    );
  }

  return (
    <BaseCard className="p-4">
      <form
        onSubmit={handleSubmit((values) => updateCompany.mutate({ id: company.id, payload: values }))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Company name" required disabled={!canEdit} error={errors.name?.message} {...register('name')} />
          <AppInput label="CIN" disabled={!canEdit} error={errors.cin?.message} {...register('cin')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="GST number" disabled={!canEdit} error={errors.gstNumber?.message} {...register('gstNumber')} />
          <AppInput label="PAN number" disabled={!canEdit} error={errors.panNumber?.message} {...register('panNumber')} />
        </div>
        <AppInput label="Address" disabled={!canEdit} error={errors.address?.message} {...register('address')} />
        <div className="grid grid-cols-4 gap-4">
          <AppInput label="City" disabled={!canEdit} error={errors.city?.message} {...register('city')} />
          <AppInput label="State" disabled={!canEdit} error={errors.state?.message} {...register('state')} />
          <AppInput label="Country" disabled={!canEdit} error={errors.country?.message} {...register('country')} />
          <AppInput label="Postal code" disabled={!canEdit} error={errors.postalCode?.message} {...register('postalCode')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Phone" required disabled={!canEdit} error={errors.phone?.message} {...register('phone')} />
          <AppInput label="Email" type="email" disabled={!canEdit} error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Financial year start" type="date" disabled={!canEdit} error={errors.financialYearStart?.message} {...register('financialYearStart')} />
          <AppInput label="Financial year end" type="date" disabled={!canEdit} error={errors.financialYearEnd?.message} {...register('financialYearEnd')} />
        </div>

        <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
          <div>
            <AppButton type="submit" loading={updateCompany.isPending}>
              Save changes
            </AppButton>
          </div>
        </Can>
      </form>
    </BaseCard>
  );
}

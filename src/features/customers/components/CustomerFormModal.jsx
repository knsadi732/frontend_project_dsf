import { useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CUSTOMER_TYPE_OPTIONS } from '@/features/customers/validators/customer.schema';
import { usePincodeAutofill, PINCODE_STATUS_TEXT } from '@/hooks/usePincodeAutofill';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  name: '',
  customerType: 'retail',
  companyName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  gstNumber: '',
  creditLimit: '',
  creditDays: '',
  status: 'active',
};

export function CustomerFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  const postalCode = useWatch({ control, name: 'postalCode' });
  const applyPincodeResult = useCallback(
    (result) => {
      setValue('city', result.city, { shouldValidate: true });
      setValue('state', result.state, { shouldValidate: true });
    },
    [setValue],
  );
  const pincodeStatus = usePincodeAutofill(postalCode, applyPincodeResult);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit customer' : 'New customer'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="customer-form" loading={isSubmitting}>
            Save customer
          </AppButton>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
          <AppSelect label="Customer type" options={CUSTOMER_TYPE_OPTIONS} error={errors.customerType?.message} {...register('customerType')} />
        </div>
        <AppInput label="Company name (B2B)" error={errors.companyName?.message} {...register('companyName')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Phone" required error={errors.phone?.message} {...register('phone')} />
          <AppInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <span className="text-sm font-medium text-text">Billing address</span>
          <AppInput label="Address line" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-4 gap-2">
            <AppInput
              label="Postal code"
              helperText={PINCODE_STATUS_TEXT[pincodeStatus]}
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
            <AppInput label="City" error={errors.city?.message} {...register('city')} />
            <AppInput label="State" error={errors.state?.message} {...register('state')} />
            <AppInput label="Country" error={errors.country?.message} {...register('country')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="GST Number" error={errors.gstNumber?.message} {...register('gstNumber')} />
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
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Credit limit (₹)" type="number" error={errors.creditLimit?.message} {...register('creditLimit')} />
          <AppInput label="Credit days" type="number" error={errors.creditDays?.message} {...register('creditDays')} />
        </div>
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VENDOR_TYPE_OPTIONS } from '@/features/vendors/validators/vendor.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

const EMPTY_ADDRESS = { label: '', address: '' };
const DEFAULT_VALUES = {
  name: '',
  vendorType: 'raw_material',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  paymentTerms: '',
  bankName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  creditLimit: '',
  creditDays: '',
  addresses: [],
  qualityRating: 3,
  status: 'active',
};

export function VendorFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit vendor' : 'New vendor'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="vendor-form" loading={isSubmitting}>
            Save vendor
          </AppButton>
        </>
      }
    >
      <form id="vendor-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
          <AppSelect label="Vendor type" options={VENDOR_TYPE_OPTIONS} error={errors.vendorType?.message} {...register('vendorType')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Phone" required error={errors.phone?.message} {...register('phone')} />
          <AppInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <AppInput label="Address" error={errors.address?.message} {...register('address')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="GST Number" error={errors.gstNumber?.message} {...register('gstNumber')} />
          <AppInput label="Payment terms" placeholder="e.g. Net 30" error={errors.paymentTerms?.message} {...register('paymentTerms')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Bank name" error={errors.bankName?.message} {...register('bankName')} />
          <AppInput label="Account number" error={errors.bankAccountNumber?.message} {...register('bankAccountNumber')} />
          <AppInput label="IFSC code" error={errors.bankIfsc?.message} {...register('bankIfsc')} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <AppInput label="Credit limit (₹)" type="number" error={errors.creditLimit?.message} {...register('creditLimit')} />
          <AppInput label="Credit days" type="number" error={errors.creditDays?.message} {...register('creditDays')} />
          <AppSelect
            label="Quality rating"
            error={errors.qualityRating?.message}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` }))}
            {...register('qualityRating')}
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
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Addresses</span>
            <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ADDRESS)}>Add address</CreateButton>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[10rem_1fr_2rem] items-start gap-2">
              <AppInput placeholder="Label (e.g. Factory)" {...register(`addresses.${index}.label`)} />
              <AppInput
                placeholder="Address"
                error={errors.addresses?.[index]?.address?.message}
                {...register(`addresses.${index}.address`)}
              />
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                aria-label="Remove address"
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
              </AppButton>
            </div>
          ))}
        </div>
      </form>
    </AppModal>
  );
}

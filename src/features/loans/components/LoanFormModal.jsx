import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema, LENDER_TYPE_OPTIONS, INTEREST_TYPE_OPTIONS } from '@/features/loans/validators/loan.schema';
import { loanApi } from '@/features/loans/api';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  lenderName: '',
  lenderType: 'bank',
  principalAmount: '',
  interestRate: 0,
  interestType: 'flat',
  startDate: '',
  tenureMonths: '',
  remarks: '',
};

export function LoanFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Display-only preview — GET /loans/generate-number only previews the
  // next loan number, it doesn't reserve it, so this isn't submitted.
  const previewNumber = useWatch({ control, name: '__loanNumberPreview' });

  useEffect(() => {
    if (!open) return;
    reset({ ...DEFAULT_VALUES, startDate: new Date().toISOString().slice(0, 10) });
    loanApi.generateNumber().then((generated) => setValue('__loanNumberPreview', generated));
  }, [open, reset, setValue]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New loan"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="loan-form" loading={isSubmitting}>
            Save loan
          </AppButton>
        </>
      }
    >
      <form id="loan-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Loan Number" disabled placeholder={previewNumber ? undefined : 'Loading…'} value={previewNumber ?? ''} readOnly helperText="Preview only — confirmed on save" />
          <AppInput label="Lender name" required error={errors.lenderName?.message} {...register('lenderName')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Lender type" options={LENDER_TYPE_OPTIONS} error={errors.lenderType?.message} {...register('lenderType')} />
          <AppInput label="Start date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Principal amount (₹)" type="number" step="0.01" required error={errors.principalAmount?.message} {...register('principalAmount')} />
          <AppInput label="Interest rate (%)" type="number" step="0.01" error={errors.interestRate?.message} {...register('interestRate')} />
          <AppSelect label="Interest type" options={INTEREST_TYPE_OPTIONS} error={errors.interestType?.message} {...register('interestType')} />
        </div>
        <AppInput label="Tenure (months)" type="number" error={errors.tenureMonths?.message} {...register('tenureMonths')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

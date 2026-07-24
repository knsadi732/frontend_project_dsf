import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repaymentSchema } from '@/features/loans/validators/loan.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { amount: '', principalComponent: '', paidAt: '', remarks: '' };

export function RepaymentFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, paidAt: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  const amount = useWatch({ control, name: 'amount' });
  const principalComponent = useWatch({ control, name: 'principalComponent' });
  // Preview only — the backend derives interestComponent server-side as
  // amount - principalComponent (loan.service.js); there's no amortization
  // schedule, so this split is entered by the finance user, not calculated
  // from interestRate/interestType.
  const interestPreview = Math.max(0, (Number(amount) || 0) - (Number(principalComponent) || 0));

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Record repayment"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="repayment-form" loading={isSubmitting}>
            Save repayment
          </AppButton>
        </>
      }
    >
      <form id="repayment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppInput label="Principal component (₹)" type="number" step="0.01" required error={errors.principalComponent?.message} {...register('principalComponent')} />
        </div>
        <p className="text-xs text-text-muted">Interest component (derived): ₹{interestPreview.toLocaleString('en-IN')}</p>
        <AppInput label="Paid date" type="date" error={errors.paidAt?.message} {...register('paidAt')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

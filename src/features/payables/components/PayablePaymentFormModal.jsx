import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '@/features/payables/validators/payable.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { amount: '', paidAt: '', remarks: '' };

export function PayablePaymentFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, paidAt: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Record payment"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="payable-payment-form" loading={isSubmitting}>
            Save payment
          </AppButton>
        </>
      }
    >
      <form id="payable-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
        <AppInput label="Paid date" type="date" error={errors.paidAt?.message} {...register('paidAt')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

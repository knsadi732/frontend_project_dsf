import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PAYMENT_METHOD_OPTIONS } from '@/features/payments/validators/payment.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { invoiceId: '', amount: '', method: 'bank_transfer', paidDate: '' };

export function PaymentFormModal({ open, onClose, invoiceOptions, onSubmit, isSubmitting }) {
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
    if (open) reset({ ...DEFAULT_VALUES, paidDate: new Date().toISOString().slice(0, 10) });
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
          <AppButton type="submit" form="payment-form" loading={isSubmitting}>
            Save payment
          </AppButton>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Invoice"
          placeholder="Select invoice"
          required
          options={invoiceOptions}
          error={errors.invoiceId?.message}
          {...register('invoiceId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppSelect label="Method" options={PAYMENT_METHOD_OPTIONS} error={errors.method?.message} {...register('method')} />
        </div>
        <AppInput label="Paid date" type="date" required error={errors.paidDate?.message} {...register('paidDate')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PAYMENT_MODE_OPTIONS } from '@/features/payments/validators/payment.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { customerId: '', amount: '', paymentMode: 'bank_transfer' };

export function PaymentFormModal({ open, onClose, customerOptions, onSubmit, isSubmitting }) {
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
    if (open) reset(DEFAULT_VALUES);
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
          label="Customer"
          placeholder="Select customer"
          required
          options={customerOptions}
          error={errors.customerId?.message}
          {...register('customerId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppSelect label="Payment mode" options={PAYMENT_MODE_OPTIONS} error={errors.paymentMode?.message} {...register('paymentMode')} />
        </div>
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorPaymentSchema } from '@/features/vendorBills/validators/vendorBill.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { amount: '', utrNumber: '' };

export function VendorPaymentFormModal({ open, onClose, bill, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorPaymentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={bill ? `Record payment — ${bill.invoiceNumber}` : 'Record payment'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="vendor-payment-form" loading={isSubmitting}>
            Save payment
          </AppButton>
        </>
      }
    >
      <form id="vendor-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-text-muted">
          Amount due: <span className="font-medium text-text">₹{Number(bill?.amountDue ?? 0).toLocaleString('en-IN')}</span>
        </p>
        <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
        <AppInput
          label="UTR / transaction number"
          required
          placeholder="e.g. UTR123456789"
          error={errors.utrNumber?.message}
          {...register('utrNumber')}
        />
      </form>
    </AppModal>
  );
}

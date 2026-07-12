import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorPaymentSchema } from '@/features/vendorBills/validators/vendorBill.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { vendorBillId: '', amount: '', method: 'bank_transfer', paidDate: '' };

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
    if (open && bill) {
      reset({ ...DEFAULT_VALUES, vendorBillId: bill.id, paidDate: new Date().toISOString().slice(0, 10) });
    }
  }, [open, bill, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={bill ? `Record payment — ${bill.billNumber}` : 'Record payment'}
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
          Balance due: <span className="font-medium text-text">₹{Number(bill?.balanceDue ?? bill?.amount ?? 0).toLocaleString('en-IN')}</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppSelect
            label="Method"
            options={[
              { value: 'bank_transfer', label: 'Bank transfer' },
              { value: 'neft', label: 'NEFT' },
              { value: 'rtgs', label: 'RTGS' },
              { value: 'imps', label: 'IMPS' },
              { value: 'cheque', label: 'Cheque' },
            ]}
            error={errors.method?.message}
            {...register('method')}
          />
        </div>
        <AppInput label="Paid date" type="date" required error={errors.paidDate?.message} {...register('paidDate')} />
      </form>
    </AppModal>
  );
}

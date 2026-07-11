import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema } from '@/features/finance/validators/invoice.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { PAYMENT_STATUS } from '@/constants/statusEnums';

const STATUS_OPTIONS = Object.values(PAYMENT_STATUS).map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

const DEFAULT_VALUES = {
  invoiceNumber: '',
  party: '',
  amount: '',
  gstRate: 0,
  advanceAmount: 0,
  dueDate: '',
  status: PAYMENT_STATUS.UNPAID,
};

export function InvoiceFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const amount = useWatch({ control, name: 'amount' });
  const advanceAmount = useWatch({ control, name: 'advanceAmount' });
  const balanceDue = Math.max(0, (Number(amount) || 0) - (Number(advanceAmount) || 0));

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  const submitWithBalance = (values) => onSubmit({ ...values, balanceDue });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit invoice' : 'New invoice'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="invoice-form" loading={isSubmitting}>
            Save invoice
          </AppButton>
        </>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit(submitWithBalance)} className="flex flex-col gap-4" noValidate>
        <AppInput
          label="Invoice Number"
          required
          error={errors.invoiceNumber?.message}
          {...register('invoiceNumber')}
        />
        <AppInput label="Party" required error={errors.party?.message} {...register('party')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Amount (incl. GST)"
            type="number"
            step="0.01"
            required
            error={errors.amount?.message}
            {...register('amount')}
          />
          <AppInput
            label="GST Rate (%)"
            type="number"
            step="0.01"
            error={errors.gstRate?.message}
            {...register('gstRate')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Advance Received (₹)"
            type="number"
            step="0.01"
            error={errors.advanceAmount?.message}
            {...register('advanceAmount')}
          />
          <AppInput label="Due Date" type="date" required error={errors.dueDate?.message} {...register('dueDate')} />
        </div>
        <p className="text-sm text-text-muted">Balance due: ₹{balanceDue.toLocaleString('en-IN')}</p>
        <AppSelect
          label="Status"
          error={errors.status?.message}
          options={STATUS_OPTIONS}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

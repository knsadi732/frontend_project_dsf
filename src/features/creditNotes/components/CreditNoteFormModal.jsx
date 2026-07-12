import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { creditNoteSchema } from '@/features/creditNotes/validators/creditNote.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { creditNoteNumber: '', invoiceId: '', customer: '', amount: '', gstAmount: 0, createdDate: '' };

export function CreditNoteFormModal({ open, onClose, invoiceOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, createdDate: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New credit note"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="credit-note-form" loading={isSubmitting}>
            Save credit note
          </AppButton>
        </>
      }
    >
      <form id="credit-note-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Credit note number" required error={errors.creditNoteNumber?.message} {...register('creditNoteNumber')} />
          <AppSelect label="Invoice" placeholder="Select invoice (optional)" options={invoiceOptions} error={errors.invoiceId?.message} {...register('invoiceId')} />
        </div>
        <AppInput label="Customer" required error={errors.customer?.message} {...register('customer')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppInput label="GST adjustment (₹)" type="number" step="0.01" error={errors.gstAmount?.message} {...register('gstAmount')} />
        </div>
        <AppInput label="Date" type="date" required error={errors.createdDate?.message} {...register('createdDate')} />
      </form>
    </AppModal>
  );
}

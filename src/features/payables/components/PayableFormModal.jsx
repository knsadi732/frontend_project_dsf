import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { payableSchema } from '@/features/payables/validators/payable.schema';
import { payableApi } from '@/features/payables/api';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { partyName: '', purpose: '', totalAmount: '', dueDate: '', remarks: '' };

export function PayableFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(payableSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Display-only preview — GET /payables/generate-number only previews the
  // next payable number, it doesn't reserve it, so this isn't submitted.
  const previewNumber = useWatch({ control, name: '__payableNumberPreview' });

  useEffect(() => {
    if (!open) return;
    reset(DEFAULT_VALUES);
    payableApi.generateNumber().then((generated) => setValue('__payableNumberPreview', generated));
  }, [open, reset, setValue]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New payable"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="payable-form" loading={isSubmitting}>
            Save payable
          </AppButton>
        </>
      }
    >
      <form id="payable-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Payable Number" disabled placeholder={previewNumber ? undefined : 'Loading…'} value={previewNumber ?? ''} readOnly helperText="Preview only — confirmed on save" />
          <AppInput label="Party name" required error={errors.partyName?.message} {...register('partyName')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Purpose" required placeholder="e.g. Rent Deposit" error={errors.purpose?.message} {...register('purpose')} />
          <AppInput label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
        </div>
        <AppInput label="Total amount (₹)" type="number" step="0.01" required error={errors.totalAmount?.message} {...register('totalAmount')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

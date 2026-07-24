import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFundSchema } from '@/features/ledger/validators/addFund.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { amount: '', description: '' };

export function AddFundModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addFundSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  // Fund addition is always a credit — the manual referenceType is the
  // only one where direction is caller-chosen (finance.service.js forces
  // it for every other type), and "add fund" only ever means money coming
  // in.
  const submitAsCredit = (values) => onSubmit({ ...values, direction: 'credit' });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Add fund"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="add-fund-form" loading={isSubmitting}>
            Add fund
          </AppButton>
        </>
      }
    >
      <form id="add-fund-form" onSubmit={handleSubmit(submitAsCredit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Amount (₹)" type="number" step="0.01" required autoFocus error={errors.amount?.message} {...register('amount')} />
        <AppInput label="Description" placeholder="e.g. Initial capital infusion by owner" error={errors.description?.message} {...register('description')} />
      </form>
    </AppModal>
  );
}

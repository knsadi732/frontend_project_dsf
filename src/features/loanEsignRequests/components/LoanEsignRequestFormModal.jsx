import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanEsignRequestSchema } from '@/features/loanEsignRequests/validators/loanEsignRequest.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { partyName: '', email: '', loanAmount: '', interestRatePercent: '', termsNote: '' };

export function LoanEsignRequestFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loanEsignRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New loan e-sign request"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="loan-esign-request-form" loading={isSubmitting}>
            Send for e-sign
          </AppButton>
        </>
      }
    >
      <form id="loan-esign-request-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Party name" required error={errors.partyName?.message} {...register('partyName')} />
          <AppInput
            label="Email"
            type="email"
            required
            helperText="Signing link will need to be shared with this person manually"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Loan amount (₹)" type="number" required error={errors.loanAmount?.message} {...register('loanAmount')} />
          <AppInput
            label="Interest rate (%)"
            type="number"
            step="0.01"
            required
            error={errors.interestRatePercent?.message}
            {...register('interestRatePercent')}
          />
        </div>
        <AppInput
          label="Terms / notes"
          helperText="e.g. repayment schedule agreed verbally"
          error={errors.termsNote?.message}
          {...register('termsNote')}
        />
      </form>
    </AppModal>
  );
}

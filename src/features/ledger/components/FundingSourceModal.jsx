import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fundingSourceSchema } from '@/features/ledger/validators/fundingSource.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { partyName: '', partyType: 'individual', defaultFundingType: 'advance', contactInfo: '' };

const PARTY_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual (e.g. owner/director)' },
  { value: 'bank', label: 'Bank' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Other' },
];

const FUNDING_TYPE_OPTIONS = [
  { value: 'advance', label: 'Advance (to be reimbursed)' },
  { value: 'loan', label: 'Loan' },
  { value: 'equity', label: 'Equity' },
  { value: 'other', label: 'Other' },
];

// A "funding source" is who actually paid — e.g. the owner personally
// covering a business expense out-of-pocket, which the company owes back.
export function FundingSourceModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(fundingSourceSchema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New funding source"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="funding-source-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="funding-source-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required autoFocus error={errors.partyName?.message} {...register('partyName')} />
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Type" options={PARTY_TYPE_OPTIONS} error={errors.partyType?.message} {...register('partyType')} />
          <AppSelect label="Default funding type" options={FUNDING_TYPE_OPTIONS} error={errors.defaultFundingType?.message} {...register('defaultFundingType')} />
        </div>
        <AppInput label="Contact info" error={errors.contactInfo?.message} {...register('contactInfo')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quickEntrySchema } from '@/features/ledger/validators/quickEntry.schema';
import { useFundingSourcesQuery } from '@/features/ledger/queries/useFundingSourcesQuery';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { useAuth } from '@/hooks/useAuth';

const NATURE_OPTIONS = [
  { value: 'expense', label: 'Expense (money out, category-tracked)' },
  { value: 'sale', label: 'Sale (money in)' },
  { value: 'manual', label: 'Manual (pick direction)' },
];

const DIRECTION_OPTIONS = [
  { value: 'debit', label: 'Debit (money out)' },
  { value: 'credit', label: 'Credit (money in)' },
];

const PAYMENT_MODE_OPTIONS = [
  { value: '', label: 'Select mode' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const FUNDING_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'advance', label: 'Advance (to be reimbursed)' },
  { value: 'loan', label: 'Loan' },
  { value: 'equity', label: 'Equity' },
  { value: 'other', label: 'Other' },
];

const GST_PARTY_TYPE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultValues(user) {
  return {
    transactionNature: 'expense',
    transactionDate: todayIso(),
    amount: '',
    direction: '',
    category: '',
    description: '',
    partyName: '',
    utrReference: '',
    paymentMode: '',
    fundingSourceId: '',
    fundingType: '',
    paidReceivedBy: user?.id ?? '',
    gstApplicable: false,
    gstAmount: '',
    gstTaxableValue: '',
    gstPartyType: '',
  };
}

// One spreadsheet-shaped form mirroring the owner's manual ledger columns
// (Date, UTR, Nature, Credit/Debit, Category, Purpose, Fund Source, Paid/
// Received By, Payment Mode, Party, GST) — posts straight to POST
// /finance/quick-entry, the same single entry point finance.service.js's
// quickEntry() exposes for exactly this shape.
export function QuickEntryModal({ open, onClose, onSubmit, isSubmitting, onNewFundingSource }) {
  const { user } = useAuth();
  const { data: fundingSourcesData } = useFundingSourcesQuery();
  const { data: usersData } = useUsersQuery({ pageSize: 200 });
  const fundingSources = fundingSourcesData?.data ?? [];
  const users = usersData?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(quickEntrySchema), defaultValues: buildDefaultValues(user) });

  useEffect(() => {
    if (open) reset(buildDefaultValues(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const nature = useWatch({ control, name: 'transactionNature' });
  const gstApplicable = useWatch({ control, name: 'gstApplicable' });
  const fundingSourceId = useWatch({ control, name: 'fundingSourceId' });

  // Picking a funding source pre-fills its default funding type (still
  // editable) — same convenience the owner's spreadsheet gets from always
  // reusing the same "Advance / Loan from Aditya Kumar Singh" label.
  const handleFundingSourceChange = (event) => {
    setValue('fundingSourceId', event.target.value);
    const source = fundingSources.find((s) => s.id === event.target.value);
    if (source) setValue('fundingType', source.defaultFundingType);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Quick entry"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="quick-entry-form" loading={isSubmitting}>
            Record entry
          </AppButton>
        </>
      }
    >
      <form id="quick-entry-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Nature" options={NATURE_OPTIONS} error={errors.transactionNature?.message} {...register('transactionNature')} />
          <AppInput label="Date" type="date" required error={errors.transactionDate?.message} {...register('transactionDate')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required autoFocus error={errors.amount?.message} {...register('amount')} />
          {nature === 'manual' && (
            <AppSelect label="Direction" placeholder="Select direction" options={DIRECTION_OPTIONS} error={errors.direction?.message} {...register('direction')} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Category" placeholder="e.g. Asset Purchase" error={errors.category?.message} {...register('category')} />
          <AppInput label="Party" placeholder="Vendor / customer / person" error={errors.partyName?.message} {...register('partyName')} />
        </div>

        <AppInput label="Purpose / description" error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="UTR / transaction ID" error={errors.utrReference?.message} {...register('utrReference')} />
          <AppSelect label="Payment mode" options={PAYMENT_MODE_OPTIONS} error={errors.paymentMode?.message} {...register('paymentMode')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">Fund source / destination</span>
              {onNewFundingSource && (
                <button type="button" className="text-xs text-primary hover:underline" onClick={onNewFundingSource}>
                  + New
                </button>
              )}
            </div>
            <AppSelect
              placeholder="Select funding source"
              options={fundingSources.map((s) => ({ value: s.id, label: s.partyName }))}
              value={fundingSourceId}
              onChange={handleFundingSourceChange}
            />
          </div>
          <AppSelect label="Funding type" options={FUNDING_TYPE_OPTIONS} error={errors.fundingType?.message} {...register('fundingType')} />
        </div>

        <AppSelect
          label="Paid / received by"
          placeholder="Select person"
          options={users.map((u) => ({ value: u.id, label: u.fullName }))}
          error={errors.paidReceivedBy?.message}
          {...register('paidReceivedBy')}
        />

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" className="size-4" {...register('gstApplicable')} />
          GST applicable
        </label>

        {gstApplicable && (
          <div className="grid grid-cols-3 gap-4">
            <AppInput label="GST amount (₹)" type="number" step="0.01" error={errors.gstAmount?.message} {...register('gstAmount')} />
            <AppInput label="Taxable value (₹)" type="number" step="0.01" error={errors.gstTaxableValue?.message} {...register('gstTaxableValue')} />
            <AppSelect label="Party type" options={GST_PARTY_TYPE_OPTIONS} error={errors.gstPartyType?.message} {...register('gstPartyType')} />
          </div>
        )}
      </form>
    </AppModal>
  );
}

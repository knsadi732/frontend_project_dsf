import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useItemVariantsQuery } from '@/features/itemMaster/queries/useItemVariantsQuery';
import { useFundingSourcesQuery } from '@/features/ledger/queries/useFundingSourcesQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

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

const DEFAULT_VALUES = {
  warehouseId: '',
  itemVariantId: '',
  quantity: '',
  unitCost: '',
  description: '',
  transactionDate: todayIso(),
  partyName: '',
  utrReference: '',
  paymentMode: '',
  fundingSourceId: '',
  fundingType: '',
  remarks: '',
  gstApplicable: false,
  gstAmount: '',
  gstTaxableValue: '',
  gstRate: '',
  cgstAmount: '',
  sgstAmount: '',
  igstAmount: '',
  hsnCode: '',
  placeOfSupplyStateCode: '',
  partyGstin: '',
  gstPartyType: '',
};

// "Receive Stock" — the manual GRN-equivalent quick entry (POST
// /items/stock/receive). Only Warehouse/Item/Quantity are required; the
// rest is the same finance quick-entry shape as the Ledger's Quick Entry
// (funding source, payment mode, GST) since giving a unitCost posts a
// Finance expense in the same call — kept collapsed behind an "Advanced"
// toggle so the common case (just recording quantity) stays a 3-field form.
export function ReceiveStockModal({ open, onClose, onSubmit, isSubmitting }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  // Reset the advanced section closed each time the modal opens — adjusted
  // during render (React's "storing info from previous renders" pattern)
  // rather than in the effect below, which only needs to reset the form.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setAdvancedOpen(false);
  }

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data: itemVariantsData } = useItemVariantsQuery({ pageSize: 500 });
  const itemVariantOptions = (itemVariantsData?.data ?? [])
    .filter((variant) => variant.stockKind !== 'fixed_asset' && variant.stockKind !== 'service')
    .map((variant) => {
      const attrs = [variant.size, variant.color].filter(Boolean).join('/');
      return { value: variant.id, label: `${variant.sku} — ${variant.itemName}${attrs ? ` (${attrs})` : ''}` };
    });

  const { data: fundingSourcesData } = useFundingSourcesQuery();
  const fundingSources = fundingSourcesData?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, transactionDate: todayIso() });
  }, [open, reset]);

  const gstApplicable = useWatch({ control, name: 'gstApplicable' });
  const fundingSourceId = useWatch({ control, name: 'fundingSourceId' });

  const handleFundingSourceChange = (event) => {
    setValue('fundingSourceId', event.target.value);
    const source = fundingSources.find((s) => s.id === event.target.value);
    if (source) setValue('fundingType', source.defaultFundingType);
  };

  const handleFormSubmit = (values) => {
    const {
      gstApplicable: gstOn,
      gstAmount,
      gstTaxableValue,
      gstRate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      hsnCode,
      placeOfSupplyStateCode,
      partyGstin,
      gstPartyType,
      ...rest
    } = values;

    onSubmit({
      ...rest,
      unitCost: rest.unitCost === '' ? undefined : rest.unitCost,
      fundingSourceId: rest.fundingSourceId || undefined,
      fundingType: rest.fundingType || undefined,
      paymentMode: rest.paymentMode || undefined,
      ...(gstOn && {
        gstApplicable: true,
        gstAmount: gstAmount === '' ? undefined : gstAmount,
        gstDetail: {
          taxableValue: gstTaxableValue === '' ? undefined : gstTaxableValue,
          gstRate: gstRate === '' ? undefined : gstRate,
          cgstAmount: cgstAmount === '' ? undefined : cgstAmount,
          sgstAmount: sgstAmount === '' ? undefined : sgstAmount,
          igstAmount: igstAmount === '' ? undefined : igstAmount,
          hsnCode: hsnCode || undefined,
          placeOfSupplyStateCode: placeOfSupplyStateCode || undefined,
          partyGstin: partyGstin || undefined,
          partyType: gstPartyType || undefined,
        },
      }),
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Receive stock"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="receive-stock-form" loading={isSubmitting}>Receive stock</AppButton>
        </>
      }
    >
      <form id="receive-stock-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Warehouse"
            required
            placeholder="Select warehouse"
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId', { required: 'Warehouse is required' })}
          />
          <AppSelect
            label="Item variant"
            required
            placeholder="Select item variant"
            options={itemVariantOptions}
            error={errors.itemVariantId?.message}
            {...register('itemVariantId', { required: 'Item variant is required' })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Quantity"
            type="number"
            step="0.01"
            required
            error={errors.quantity?.message}
            {...register('quantity', { required: 'Quantity is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
          />
          <AppInput
            label="Unit cost (₹)"
            type="number"
            step="0.01"
            helperText="Optional — posts a Finance expense automatically when given"
            {...register('unitCost')}
          />
        </div>
        <AppInput label="Description" {...register('description')} />
        <AppInput label="Remarks" {...register('remarks')} />

        <button
          type="button"
          className="self-start text-xs font-medium text-primary hover:underline"
          onClick={() => setAdvancedOpen((v) => !v)}
        >
          {advancedOpen ? 'Hide advanced (funding / GST)' : 'Show advanced (funding / GST)'}
        </button>

        {advancedOpen && (
          <div className="flex flex-col gap-4 rounded-md border border-border p-3">
            <div className="grid grid-cols-2 gap-4">
              <AppInput label="Date" type="date" {...register('transactionDate')} />
              <AppInput label="Party" placeholder="Vendor / supplier name" {...register('partyName')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AppInput label="UTR / transaction ID" {...register('utrReference')} />
              <AppSelect label="Payment mode" options={PAYMENT_MODE_OPTIONS} {...register('paymentMode')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AppSelect
                label="Funding source"
                placeholder="Select funding source"
                options={fundingSources.map((s) => ({
                  value: s.id,
                  label: s.totalFunded ? `${s.partyName} — ₹${s.totalFunded.toLocaleString('en-IN')} owed` : s.partyName,
                }))}
                value={fundingSourceId}
                onChange={handleFundingSourceChange}
              />
              <AppSelect label="Funding type" options={FUNDING_TYPE_OPTIONS} {...register('fundingType')} />
            </div>

            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('gstApplicable')} />
              GST applicable
            </label>

            {gstApplicable && (
              <div className="grid grid-cols-3 gap-4">
                <AppInput label="Taxable value (₹)" type="number" step="0.01" {...register('gstTaxableValue')} />
                <AppInput label="GST rate (%)" type="number" step="0.01" {...register('gstRate')} />
                <AppInput label="GST amount (₹)" type="number" step="0.01" {...register('gstAmount')} />
                <AppInput label="CGST (₹)" type="number" step="0.01" {...register('cgstAmount')} />
                <AppInput label="SGST (₹)" type="number" step="0.01" {...register('sgstAmount')} />
                <AppInput label="IGST (₹)" type="number" step="0.01" {...register('igstAmount')} />
                <AppInput label="HSN code" {...register('hsnCode')} />
                <AppInput label="Place of supply (state code)" {...register('placeOfSupplyStateCode')} />
                <AppInput label="Party GSTIN" {...register('partyGstin')} />
                <AppSelect label="Party type" options={GST_PARTY_TYPE_OPTIONS} {...register('gstPartyType')} />
              </div>
            )}
          </div>
        )}
      </form>
    </AppModal>
  );
}

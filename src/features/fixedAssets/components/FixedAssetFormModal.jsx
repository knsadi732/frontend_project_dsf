import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useItemsQuery } from '@/features/itemMaster/queries/useItemsQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useFundingSourcesQuery } from '@/features/ledger/queries/useFundingSourcesQuery';
import { DEPRECIATION_METHOD_OPTIONS } from '@/features/fixedAssets/constants';
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
  itemId: '',
  vendorId: '',
  assetName: '',
  serialNumber: '',
  purchaseDate: todayIso(),
  purchaseCost: '',
  warrantyExpiry: '',
  branchId: '',
  warehouseId: '',
  custodianUserId: '',
  custodianName: '',
  locationNote: '',
  depreciationMethod: 'straight_line',
  usefulLifeYears: '',
  salvageValue: '',
  remarks: '',
  transactionDate: todayIso(),
  partyName: '',
  utrReference: '',
  paymentMode: '',
  fundingSourceId: '',
  fundingType: '',
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

// "Register Asset" (POST /fixed-assets) — itemId must reference an Item
// whose category has stock_kind 'fixed_asset' or 'tool' (Chapter 8/13).
// purchaseCost posts to Finance automatically, same funding-source/GST
// shape as Receive Stock, collapsed behind Advanced for the common case.
export function FixedAssetFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  // Reset the advanced section closed each time the modal opens — adjusted
  // during render (React's "storing info from previous renders" pattern)
  // rather than in the effect below, which only needs to reset the form.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setAdvancedOpen(false);
  }

  const { data: itemsData } = useItemsQuery({ pageSize: 500 });
  const itemOptions = (itemsData?.data ?? [])
    .filter((item) => item.stockKind === 'fixed_asset' || item.stockKind === 'tool')
    .map((item) => ({ value: item.id, label: `${item.itemCode} — ${item.itemName}` }));

  const { data: vendorsData } = useVendorsQuery({ pageSize: 200 });
  const vendorOptions = (vendorsData?.data ?? []).map((v) => ({ value: v.id, label: v.name }));

  const { data: branchesData } = useBranchesQuery({ pageSize: 200 });
  const branchOptions = (branchesData?.data ?? []).map((b) => ({ value: b.id, label: b.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data: usersData } = useUsersQuery({ pageSize: 200 });
  const userOptions = (usersData?.data ?? []).map((u) => ({ value: u.id, label: u.fullName }));

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
    if (open) reset({ ...DEFAULT_VALUES, purchaseDate: todayIso(), transactionDate: todayIso() });
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
      vendorId: rest.vendorId || undefined,
      branchId: rest.branchId || undefined,
      warehouseId: rest.warehouseId || undefined,
      custodianUserId: rest.custodianUserId || undefined,
      custodianName: rest.custodianName || undefined,
      warrantyExpiry: rest.warrantyExpiry || undefined,
      usefulLifeYears: rest.usefulLifeYears === '' ? undefined : rest.usefulLifeYears,
      salvageValue: rest.salvageValue === '' ? undefined : rest.salvageValue,
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
      title="Register asset"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="fixed-asset-form" loading={isSubmitting}>Register asset</AppButton>
        </>
      }
    >
      <form id="fixed-asset-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Asset name" required error={errors.assetName?.message} {...register('assetName', { required: 'Asset name is required' })} />
          <AppSelect
            label="Item"
            required
            placeholder="Select item (Fixed Asset / Tool category)"
            options={itemOptions}
            error={errors.itemId?.message}
            {...register('itemId', { required: 'Item is required' })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Serial number" {...register('serialNumber')} />
          <AppSelect label="Vendor" placeholder="Select vendor" options={vendorOptions} {...register('vendorId')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput
            label="Purchase date"
            type="date"
            required
            error={errors.purchaseDate?.message}
            {...register('purchaseDate', { required: 'Purchase date is required' })}
          />
          <AppInput
            label="Purchase cost (₹)"
            type="number"
            step="0.01"
            required
            error={errors.purchaseCost?.message}
            {...register('purchaseCost', { required: 'Purchase cost is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
          />
          <AppInput label="Warranty expiry" type="date" {...register('warrantyExpiry')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <AppSelect label="Branch" placeholder="Select branch" options={branchOptions} {...register('branchId')} />
          <AppSelect label="Warehouse" placeholder="Select warehouse" options={warehouseOptions} {...register('warehouseId')} />
          <AppSelect label="Custodian" placeholder="Select custodian" options={userOptions} {...register('custodianUserId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Custodian name (if not an ERP user)"
            placeholder="e.g. Mamta Singh, Proprietor"
            {...register('custodianName')}
          />
          <AppInput label="Location note" placeholder="e.g. Production Floor, Head Office" {...register('locationNote')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <AppSelect label="Depreciation method" options={DEPRECIATION_METHOD_OPTIONS} {...register('depreciationMethod')} />
          <AppInput label="Useful life (years)" type="number" step="1" {...register('usefulLifeYears')} />
          <AppInput label="Salvage value (₹)" type="number" step="0.01" {...register('salvageValue')} />
        </div>
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
              <AppInput label="Transaction date" type="date" {...register('transactionDate')} />
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

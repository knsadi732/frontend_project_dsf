import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseSchema, PURCHASE_ORDER_STATUS_PIPELINE, PURCHASE_ORDER_CANCELLED } from '@/features/purchases/validators/purchase.schema';
import { purchaseApi } from '@/features/purchases/api';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

function statusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// A PO's status may only advance one step at a time on the pipeline
// (backend assertTransition) — the dropdown only ever offers "stay as-is"
// or "move to the next step". Cancel is a separate action (see
// PURCHASE_ORDER_CANCELLED) since it can fork off any non-terminal state.
function nextStepOptions(currentStatus) {
  const index = PURCHASE_ORDER_STATUS_PIPELINE.indexOf(currentStatus);
  const next = PURCHASE_ORDER_STATUS_PIPELINE[index + 1];
  const options = [{ value: currentStatus, label: `${statusLabel(currentStatus)} (current)` }];
  if (next) options.push({ value: next, label: `Advance to ${statusLabel(next)}` });
  return options;
}

const TAX_MODE_OPTIONS = [
  { value: 'none', label: 'No GST' },
  { value: 'exclusive', label: 'GST — Exclusive (add on top of unit cost)' },
  { value: 'inclusive', label: 'GST — Inclusive (already part of unit cost)' },
];

export function PurchaseFormModal({ open, onClose, initialValues, onSubmit, onCancelOrder, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);
  const isTerminal = initialValues?.status === 'completed' || initialValues?.status === PURCHASE_ORDER_CANCELLED;

  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendors = vendorsData?.data ?? [];
  const vendorOptions = vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const branchOptions = (branchesData?.data ?? []).map((branch) => ({ value: branch.id, label: branch.name }));

  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));

  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const variantsById = Object.fromEntries((variantsData?.data ?? []).map((variant) => [variant.id, variant]));

  const { data: company } = useCompanyQuery();

  const variantLabel = (variantId) => {
    const variant = variantsById[variantId];
    if (!variant) return variantId;
    const productName = productsById[variant.productId]?.name ?? 'Unknown product';
    const attrs = [variant.size, variant.color].filter(Boolean).join('/');
    return `${variant.sku} — ${productName}${attrs ? ` (${attrs})` : ''}`;
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: initialValues ?? {},
  });

  // GST calculation is purely a frontend concern — the backend only ever
  // accepts one flat `taxAmount` number (see purchaseOrder.validator.js /
  // purchase.schema.js), so these two don't go through the zod-validated
  // form fields at all; they just drive the taxAmount/unitCost this form
  // computes and sends on submit.
  const [taxMode, setTaxMode] = useState('exclusive');
  const [gstPercent, setGstPercent] = useState('');
  // Reset the tax controls whenever the modal transitions from closed to
  // open — adjusted during render (not in an effect) per React's
  // "storing information from previous renders" pattern.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTaxMode('exclusive');
      setGstPercent('');
    }
  }

  const items = useWatch({ control, name: 'items' });
  const poNumber = useWatch({ control, name: 'poNumber' });
  const vendorId = useWatch({ control, name: 'vendorId' });
  const isGeneratingNumber = open && !isEdit && !poNumber;
  const subtotal = (items ?? []).reduce((sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitCost) || 0), 0);

  const rate = Number(gstPercent) || 0;
  const computedTaxAmount = useMemo(() => {
    if (isEdit) return Number(initialValues?.taxAmount) || 0;
    if (taxMode === 'none' || !rate) return 0;
    if (taxMode === 'inclusive') return subtotal - subtotal / (1 + rate / 100);
    return subtotal * (rate / 100);
  }, [isEdit, initialValues, taxMode, rate, subtotal]);

  // Exclusive/none: total = subtotal + tax (tax added on top). Inclusive:
  // total = subtotal unchanged (the tax was already inside the unit costs).
  const displayTotal = isEdit
    ? Number(initialValues?.total) || subtotal
    : taxMode === 'inclusive'
      ? subtotal
      : subtotal + computedTaxAmount;

  // CGST+SGST if vendor is in the same state as the company (GSTIN's first
  // 2 digits are the state code), otherwise IGST for the full rate.
  const companyStateCode = company?.gstNumber?.slice(0, 2);
  const vendor = vendors.find((v) => v.id === vendorId);
  const vendorStateCode = vendor?.gstNumber?.slice(0, 2);
  const gstBreakup =
    taxMode === 'none' || !rate
      ? null
      : companyStateCode && vendorStateCode
        ? companyStateCode === vendorStateCode
          ? { type: 'CGST + SGST', cgst: rate / 2, sgst: rate / 2 }
          : { type: 'IGST', igst: rate }
        : null;

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? {});

    // New PO (via Convert to PO) — the number is server-generated
    // (sequence-backed), fetch it as soon as the form opens.
    if (!isEdit) {
      purchaseApi.generateNumber().then((generated) => setValue('poNumber', generated));
    }
  }, [open, initialValues, isEdit, reset, setValue]);

  const submitWithComputedTax = (values) => {
    // Inclusive mode: the unit costs the user typed already include GST, but
    // the backend always computes total = Σ(quantity×unitCost) + taxAmount
    // (no "inclusive" concept server-side) — so the tax portion has to be
    // backed out of each line's unitCost before sending, otherwise the
    // backend would add tax on top a second time.
    const factor = taxMode === 'inclusive' && rate ? 1 + rate / 100 : 1;
    const adjustedItems = values.items.map((item) => ({
      ...item,
      unitCost: Number(item.unitCost) / factor,
    }));
    onSubmit({ ...values, items: adjustedItems, taxAmount: computedTaxAmount });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Purchase order ${initialValues.poNumber}` : 'New purchase order (from approved request)'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          {isEdit && !isTerminal && (
            <AppButton variant="danger" onClick={() => onCancelOrder(initialValues)} loading={isSubmitting}>
              Cancel order
            </AppButton>
          )}
          <AppButton type="submit" form="purchase-form" loading={isSubmitting}>
            {isEdit ? 'Update status' : 'Create purchase order'}
          </AppButton>
        </>
      }
    >
      <form id="purchase-form" onSubmit={handleSubmit(submitWithComputedTax)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="PO Number"
            required
            disabled
            placeholder={isGeneratingNumber ? 'Generating…' : undefined}
            error={errors.poNumber?.message}
            {...register('poNumber')}
          />
          <AppSelect
            label="Vendor"
            placeholder="Select vendor"
            required
            disabled={isEdit}
            options={vendorOptions}
            error={errors.vendorId?.message}
            {...register('vendorId')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Warehouse"
            placeholder="Select warehouse"
            required
            disabled={isEdit}
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
          <AppSelect label="Branch" placeholder="Select branch" disabled={isEdit} options={branchOptions} error={errors.branchId?.message} {...register('branchId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Payment terms" disabled={isEdit} error={errors.paymentTerms?.message} {...register('paymentTerms')} />
          <AppInput label="Expected delivery date" type="date" disabled={isEdit} error={errors.expectedDeliveryDate?.message} {...register('expectedDeliveryDate')} />
        </div>
        <AppInput label="Delivery address" disabled={isEdit} error={errors.deliveryAddress?.message} {...register('deliveryAddress')} />

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-sm font-medium text-text">Items (from the approved purchase request)</span>
          <div className="grid grid-cols-[1fr_5rem_7rem_7rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product variant</span>
            <span>Qty</span>
            <span>Unit cost (₹)</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="flex flex-col gap-2">
            {(items ?? []).map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_5rem_7rem_7rem] items-start gap-2">
                <div className="flex h-9 items-center text-sm text-text">{variantLabel(item.productVariantId)}</div>
                <div className="flex h-9 items-center text-sm text-text-muted">{item.quantity}</div>
                <AppInput
                  type="number"
                  step="0.01"
                  disabled={isEdit}
                  error={errors.items?.[index]?.unitCost?.message}
                  {...register(`items.${index}.unitCost`)}
                />
                <div className="flex h-9 items-center justify-end text-sm text-text-muted">
                  ₹{((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-3">
          <span className="text-sm font-medium text-text">Tax</span>
          {isEdit ? (
            <div className="flex justify-between text-sm text-text-muted">
              <span>Tax amount</span>
              <span>₹{(Number(initialValues?.taxAmount) || 0).toLocaleString('en-IN')}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <AppSelect
                  label="Tax type"
                  options={TAX_MODE_OPTIONS}
                  value={taxMode}
                  onChange={(event) => setTaxMode(event.target.value)}
                />
                <AppInput
                  label="GST %"
                  type="number"
                  step="0.01"
                  disabled={taxMode === 'none'}
                  value={gstPercent}
                  onChange={(event) => setGstPercent(event.target.value)}
                />
              </div>
              {gstBreakup && (
                <p className="text-xs text-text-muted">
                  {gstBreakup.type === 'IGST'
                    ? `Vendor is out-of-state — IGST @ ${gstBreakup.igst}% = ₹${computedTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                    : `Vendor is in the same state — CGST @ ${gstBreakup.cgst}% + SGST @ ${gstBreakup.sgst}% = ₹${computedTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                </p>
              )}
              {taxMode !== 'none' && rate > 0 && !gstBreakup && (
                <p className="text-xs text-text-muted">
                  Select a vendor with a GSTIN to see the CGST+SGST/IGST split — tax amount: ₹
                  {computedTaxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-border pt-3 text-sm font-semibold text-text">
          Total: ₹{displayTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>

        {isEdit && (
          <div className="border-t border-border pt-4">
            <AppSelect
              label="Status"
              error={errors.status?.message}
              options={nextStepOptions(initialValues.status ?? 'draft')}
              disabled={isTerminal}
              {...register('status')}
            />
          </div>
        )}
      </form>
    </AppModal>
  );
}

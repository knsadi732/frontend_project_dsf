import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseSchema, PURCHASE_ORDER_STATUS_PIPELINE, PRODUCT_TYPE_OPTIONS } from '@/features/purchases/validators/purchase.schema';
import { purchaseApi } from '@/features/purchases/api';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useCategoriesQuery } from '@/features/categories/queries/useCategoriesQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';

// `productType` is a local filter only (static PRODUCT_TYPE_OPTIONS list —
// raw material vs finished footwear vs office supplies vs spare parts vs
// machinery, ...) — it narrows which products the Product dropdown offers,
// it isn't part of what the backend accepts per item
// (purchaseOrder.validator.js only wants productId/quantity/unitCost) and
// is dropped on submit.
const EMPTY_ITEM = { productType: '', productId: '', quantity: '', rate: '' };
const DEFAULT_VALUES = {
  poNumber: '',
  vendorId: '',
  supplier: '',
  warehouseId: '',
  orderDate: '',
  status: 'draft',
  newPoLabel: 'draft',
  items: [EMPTY_ITEM],
};

// Cosmetic only — a new PO's real backend status is always 'draft' (see
// PurchasesPage.jsx submit handler, which never sends `status` on create).
// There's no "pending" state in PURCHASE_ORDER_STATUS_PIPELINE
// (backend/src/constants/enums.js), so this choice isn't persisted.
const NEW_PO_LABEL_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
];

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// A PO's status may only advance one step at a time (backend
// assertTransition) — the dropdown only ever offers "stay as-is" or "move
// to the next step", never a free choice of every status.
function nextStepOptions(currentStatus) {
  const index = PURCHASE_ORDER_STATUS_PIPELINE.indexOf(currentStatus);
  const next = PURCHASE_ORDER_STATUS_PIPELINE[index + 1];
  const options = [{ value: currentStatus, label: `${statusLabel(currentStatus)} (current)` }];
  if (next) options.push({ value: next, label: `Advance to ${statusLabel(next)}` });
  return options;
}

export function PurchaseFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendors = vendorsData?.data ?? [];
  const vendorOptions = vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const { data: categoriesData } = useCategoriesQuery({ pageSize: 100 });
  const categories = categoriesData?.data ?? [];

  // PRODUCT_TYPE_OPTIONS is the static list shown in the dropdown; resolve
  // the actual product_categories row it corresponds to by name, since
  // that's what products are really filtered by (categoryId).
  const categoryIdForType = (typeValue) => {
    const label = PRODUCT_TYPE_OPTIONS.find((option) => option.value === typeValue)?.label;
    return categories.find((category) => category.name?.toLowerCase() === label?.toLowerCase())?.id ?? null;
  };

  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const products = productsData?.data ?? [];

  // Each footwear SKU (size/color combo) is its own Product row on the
  // backend — there's no separate variant layer — so the name alone is
  // ambiguous (e.g. multiple sizes named "Running Shoe"); lead with the SKU.
  // Not every purchase is finished footwear either — raw material, office
  // supplies, spare parts, machinery, etc. are just Products under a
  // different category, so the product type picked per row narrows this list.
  const productOptionsFor = (typeValue) => {
    const categoryId = typeValue && categoryIdForType(typeValue);
    return products
      .filter((product) => !typeValue || product.categoryId === categoryId)
      .map((product) => ({ value: product.id, label: `${product.sku} — ${product.name}` }));
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
    defaultValues: DEFAULT_VALUES,
  });

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find((item) => item.id === vendorId);
    if (vendor) setValue('supplier', vendor.name);
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item.id === productId);
    if (product) setValue(`items.${index}.rate`, product.baseCost ?? 0);
  };

  const handleProductTypeChange = (index) => {
    // A product picked under the previous type no longer belongs to the
    // list the new type will show — clear it rather than leave a stale,
    // now-invisible selection.
    setValue(`items.${index}.productId`, '');
    setValue(`items.${index}.rate`, '');
  };

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });
  const poNumber = useWatch({ control, name: 'poNumber' });
  const isGeneratingNumber = open && !initialValues?.id && !poNumber;
  const total = (items ?? []).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.rate) || 0),
    0,
  );

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? DEFAULT_VALUES);

    // New PO — the number is server-generated (sequence-backed), not
    // client-typed, so fetch it as soon as the form opens.
    if (!initialValues?.id) {
      purchaseApi.generateNumber().then((generated) => setValue('poNumber', generated));
    }
  }, [open, initialValues, reset, setValue]);

  // Editing an existing PO: its items only carry productId, not the
  // (purely local, UI-only) productType filter — backfill it from the
  // product's real category once products/categories have loaded, so the
  // row doesn't render as "pick a product type first" for an item that
  // already has a product.
  useEffect(() => {
    if (!open || !initialValues?.id || !products.length || !categories.length) return;
    (initialValues.items ?? []).forEach((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      const categoryName = categories.find((c) => c.id === product?.categoryId)?.name;
      const type = PRODUCT_TYPE_OPTIONS.find((option) => option.label.toLowerCase() === categoryName?.toLowerCase());
      if (type) setValue(`items.${index}.productType`, type.value);
    });
  }, [open, initialValues, products, categories, setValue]);

  const submitWithTotal = (values) => onSubmit({ ...values, total });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues?.id ? 'Edit purchase order' : 'New purchase order'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="purchase-form" loading={isSubmitting}>
            Save purchase order
          </AppButton>
        </>
      }
    >
      <form id="purchase-form" onSubmit={handleSubmit(submitWithTotal)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="PO Number"
            required
            disabled={!initialValues?.id}
            placeholder={isGeneratingNumber ? 'Generating…' : undefined}
            error={errors.poNumber?.message}
            {...register('poNumber')}
          />
          <AppSelect
            label="Vendor"
            placeholder="Select vendor"
            required
            options={vendorOptions}
            error={errors.vendorId?.message}
            {...register('vendorId', { onChange: (event) => handleVendorChange(event.target.value) })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Warehouse"
            placeholder="Select warehouse"
            required
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
          <AppInput
            label="Order Date"
            type="date"
            required
            error={errors.orderDate?.message}
            {...register('orderDate')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-4">
            <span className="text-sm font-medium text-text">Items ordered</span>
            <div className="flex items-end gap-2">
              {initialValues?.id ? (
                <AppSelect
                  label="Status"
                  error={errors.status?.message}
                  options={nextStepOptions(initialValues.status ?? 'draft')}
                  className="w-44"
                  {...register('status')}
                />
              ) : (
                <AppSelect
                  label="Status"
                  options={NEW_PO_LABEL_OPTIONS}
                  className="w-44"
                  {...register('newPoLabel')}
                />
              )}
              <AppButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>
                <Plus className="size-4" />
                Add item
              </AppButton>
            </div>
          </div>
          {!initialValues?.id && (
            <p className="text-xs text-text-muted">New purchase orders are always saved as Draft in the system regardless of this choice.</p>
          )}

          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}

          <div className="grid grid-cols-[9rem_1fr_6rem_7rem_7rem_2rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product Type</span>
            <span>Product</span>
            <span>Qty</span>
            <span>Rate (₹/unit)</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[9rem_1fr_6rem_7rem_7rem_2rem] items-start gap-2">
                <AppSelect
                  placeholder="Product Type"
                  options={PRODUCT_TYPE_OPTIONS}
                  {...register(`items.${index}.productType`, { onChange: () => handleProductTypeChange(index) })}
                />
                <Controller
                  control={control}
                  name={`items.${index}.productId`}
                  render={({ field }) => (
                    <AppComboSelect
                      placeholder={items?.[index]?.productType ? 'Select product' : 'Select product type first'}
                      disabled={!items?.[index]?.productType}
                      options={productOptionsFor(items?.[index]?.productType)}
                      error={errors.items?.[index]?.productId?.message}
                      value={field.value}
                      onChange={(productId) => {
                        field.onChange(productId);
                        handleProductChange(index, productId);
                      }}
                    />
                  )}
                />
                <AppInput
                  type="number"
                  placeholder="Qty"
                  error={errors.items?.[index]?.quantity?.message}
                  {...register(`items.${index}.quantity`)}
                />
                <AppInput
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  error={errors.items?.[index]?.rate?.message}
                  {...register(`items.${index}.rate`)}
                />
                <div className="flex h-9 items-center justify-end text-sm text-text-muted">
                  ₹{((Number(items?.[index]?.quantity) || 0) * (Number(items?.[index]?.rate) || 0)).toLocaleString('en-IN')}
                </div>
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label="Remove item"
                  className="text-danger hover:bg-danger/10"
                >
                  <Trash2 className="size-4" />
                </AppButton>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold text-text">
            Total: ₹{total.toLocaleString('en-IN')}
          </div>
        </div>
      </form>
    </AppModal>
  );
}

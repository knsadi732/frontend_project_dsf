import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseRequestSchema } from '@/features/purchaseRequests/validators/purchaseRequest.schema';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useAuth } from '@/hooks/useAuth';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

const EMPTY_ITEM = { productVariantId: '', quantity: '', remarks: '' };

// Narrows the (potentially huge) variant list before picking one — backend
// filters product-variants by the parent product's product_type via
// GET /product-variants?productType=... (products.product_type, joined
// through a subquery since the column lives on products, not variants).
const PRODUCT_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'packaging_material', label: 'Packaging Material' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'finished_goods', label: 'Finished Goods' },
  { value: 'semi_finished_goods', label: 'Semi Finished Goods' },
  { value: 'service', label: 'Service' },
];
const DEFAULT_VALUES = {
  warehouseId: '',
  departmentId: '',
  branchId: '',
  priority: 'medium',
  requiredDate: '',
  items: [EMPTY_ITEM],
  remarks: '',
};

export function PurchaseRequestFormModal({
  open,
  onClose,
  departmentOptions,
  warehouseOptions,
  branchOptions,
  onSubmit,
  isSubmitting,
}) {
  const { user } = useAuth();
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));

  // UI-only filter, not part of the PR payload — narrows the variant
  // dropdown by the parent product's type (e.g. Raw Material vs Consumable)
  // before the requester picks a specific SKU.
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500, ...(productTypeFilter && { product_type: productTypeFilter }) });
  const variantOptions = (variantsData?.data ?? []).map((variant) => {
    const productName = productsById[variant.productId]?.name;
    const attrs = [variant.size, variant.color].filter(Boolean).join('/');
    return {
      value: variant.id,
      label: `${variant.sku} — ${productName ?? 'Unknown product'}${attrs ? ` (${attrs})` : ''}`,
    };
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  // Display-only preview of the reserved PR number — the backend assigns it
  // server-side on create, it isn't part of the POST body (see
  // purchaseRequestApi.create's toBackendPayload).
  const previewNumber = useWatch({ control, name: '__prNumberPreview' });

  // Department isn't a free choice — the requester's own department (see
  // Chapter 3, Employee Domain: every employee belongs to one primary
  // department). Only falls back to a manual pick if the backend session
  // doesn't carry departmentId yet (see auth.api.js's fromBackendUser).
  const departmentAutoFilled = Boolean(user?.departmentId);

  useEffect(() => {
    if (!open) return;
    reset({ ...DEFAULT_VALUES, departmentId: user?.departmentId ?? '' });
    purchaseRequestApi.generateNumber().then((generated) => setValue('__prNumberPreview', generated));
  }, [open, reset, setValue, user]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New purchase request"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="purchase-request-form" loading={isSubmitting}>
            Save request
          </AppButton>
        </>
      }
    >
      <form id="purchase-request-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="PR Number" disabled placeholder={previewNumber ? undefined : 'Generating…'} value={previewNumber ?? ''} readOnly />
          <AppSelect
            label="Warehouse"
            placeholder="Select warehouse"
            required
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Department"
            placeholder="Select department"
            disabled={departmentAutoFilled}
            options={departmentOptions}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />
          <AppSelect label="Branch" placeholder="Select branch" options={branchOptions} error={errors.branchId?.message} {...register('branchId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <AppInput label="Required date" type="date" error={errors.requiredDate?.message} {...register('requiredDate')} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-text">Items requested</span>
            <div className="flex items-center gap-2">
              <AppSelect
                aria-label="Filter by product type"
                className="min-w-[10rem]"
                options={PRODUCT_TYPE_OPTIONS}
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
              />
              <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>Add item</CreateButton>
            </div>
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_6rem_1fr_2rem] items-start gap-2">
              <Controller
                control={control}
                name={`items.${index}.productVariantId`}
                render={({ field }) => (
                  <AppComboSelect
                    placeholder="Select product variant"
                    options={variantOptions}
                    error={errors.items?.[index]?.productVariantId?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <AppInput type="number" placeholder="Qty" error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity`)} />
              <AppInput placeholder="Remarks (optional)" error={errors.items?.[index]?.remarks?.message} {...register(`items.${index}.remarks`)} />
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

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

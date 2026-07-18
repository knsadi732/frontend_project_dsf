import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseSchema } from '@/features/purchases/validators/purchase.schema';
import { purchaseApi } from '@/features/purchases/api';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ORDER_STATUS, toStatusOptions } from '@/constants/statusEnums';

const EMPTY_ITEM = { product: '', quantity: '', rate: '' };
const DEFAULT_VALUES = {
  poNumber: '',
  vendorId: '',
  supplier: '',
  orderDate: '',
  status: ORDER_STATUS.DRAFT,
  items: [EMPTY_ITEM],
};

const STATUS_OPTIONS = toStatusOptions(ORDER_STATUS);

export function PurchaseFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendors = vendorsData?.data ?? [];
  const vendorOptions = vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }));

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
          <AppInput
            label="Order Date"
            type="date"
            required
            error={errors.orderDate?.message}
            {...register('orderDate')}
          />
          <AppSelect label="Status" error={errors.status?.message} options={STATUS_OPTIONS} {...register('status')} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items ordered</span>
            <AppButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>
              <Plus className="size-4" />
              Add item
            </AppButton>
          </div>

          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}

          <div className="grid grid-cols-[1fr_6rem_7rem_7rem_2rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product</span>
            <span>Qty</span>
            <span>Rate (₹/unit)</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_6rem_7rem_7rem_2rem] items-start gap-2">
                <AppInput
                  placeholder="Product / material"
                  error={errors.items?.[index]?.product?.message}
                  {...register(`items.${index}.product`)}
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

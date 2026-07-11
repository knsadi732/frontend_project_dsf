import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salesOrderSchema } from '@/features/sales/validators/salesOrder.schema';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { ORDER_STATUS, toStatusOptions } from '@/constants/statusEnums';

const EMPTY_ITEM = { productId: '', quantity: '', rate: '' };
const DEFAULT_VALUES = {
  soNumber: '',
  customer: '',
  orderDate: '',
  status: ORDER_STATUS.DRAFT,
  items: [EMPTY_ITEM],
};

const STATUS_OPTIONS = toStatusOptions(ORDER_STATUS);

export function SalesOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const products = productsData?.data ?? [];
  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (₹${product.price})`,
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });
  const total = (items ?? []).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.rate) || 0),
    0,
  );

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item.id === productId);
    if (product) setValue(`items.${index}.rate`, product.price);
  };

  const submitWithTotal = (values) => onSubmit({ ...values, total });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit sales order' : 'New sales order'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="sales-order-form" loading={isSubmitting}>
            Save sales order
          </AppButton>
        </>
      }
    >
      <form id="sales-order-form" onSubmit={handleSubmit(submitWithTotal)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="SO Number" required error={errors.soNumber?.message} {...register('soNumber')} />
          <AppInput label="Customer" required error={errors.customer?.message} {...register('customer')} />
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
                <Controller
                  control={control}
                  name={`items.${index}.productId`}
                  render={({ field: controllerField }) => (
                    <AppSelect
                      placeholder="Select product"
                      options={productOptions}
                      error={errors.items?.[index]?.productId?.message}
                      value={controllerField.value}
                      name={controllerField.name}
                      onBlur={controllerField.onBlur}
                      onChange={(event) => {
                        controllerField.onChange(event);
                        handleProductChange(index, event.target.value);
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

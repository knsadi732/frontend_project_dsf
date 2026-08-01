import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salesOrderSchema, SALES_CHANNEL_OPTIONS } from '@/features/sales/validators/salesOrder.schema';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { salesOrders, nextDocNumber } from '@/services/api/mockDb';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';
import { ORDER_STATUS } from '@/constants/statusEnums';

const EMPTY_ITEM = { productId: '', quantity: '', rate: '' };
// Status is never set here — it only moves via the workflow actions
// (Accept/Reject/Mark-ready from Notifications, GRN/production completion,
// etc. in businessRules.js). New orders start `pending` (awaiting Sales
// Review); the table shows the current status read-only.
const DEFAULT_VALUES = {
  soNumber: '',
  customerId: '',
  customer: '',
  salesChannel: 'manual',
  orderDate: '',
  status: ORDER_STATUS.PENDING,
  items: [EMPTY_ITEM],
};

export function SalesOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  // A customer is only ever sold the finished item — whether it was
  // manufactured in-house or bought ready-made for trading (low production
  // capacity means both happen), raw materials/packaging/consumables never
  // go out the door directly, so they're excluded here.
  const products = (productsData?.data ?? []).filter((product) => product.productType === 'finished_goods');
  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (₹${product.sellingPrice})`,
  }));

  const { data: customersData } = useCustomersQuery({ pageSize: 100 });
  const customers = customersData?.data ?? [];
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));

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

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((item) => item.id === customerId);
    if (customer) setValue('customer', customer.name);
  };

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });
  const total = (items ?? []).reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.rate) || 0),
    0,
  );

  useEffect(() => {
    if (!open) return;
    if (initialValues?.id) {
      reset(initialValues);
    } else {
      // Auto-generate the next SO number (DS-SO-01, DS-SO-02, ...) —
      // recomputed each time the form opens so it always reflects the
      // current highest saved number, not reserved until actually saved.
      reset({ ...DEFAULT_VALUES, ...initialValues, soNumber: nextDocNumber(salesOrders, 'soNumber', 'DS-SO', 2) });
    }
  }, [open, initialValues, reset]);

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item.id === productId);
    if (product) setValue(`items.${index}.rate`, product.sellingPrice);
  };

  const submitWithTotal = (values) => onSubmit({ ...values, total });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues?.id ? 'Edit sales order' : 'New sales order'}
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
          <AppInput
            label="SO Number"
            required
            readOnly
            helperText="Auto-generated"
            error={errors.soNumber?.message}
            {...register('soNumber')}
          />
          <AppSelect
            label="Customer"
            placeholder="Select customer"
            required
            options={customerOptions}
            error={errors.customerId?.message}
            {...register('customerId', { onChange: (event) => handleCustomerChange(event.target.value) })}
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
          <AppSelect label="Sales channel" error={errors.salesChannel?.message} options={SALES_CHANNEL_OPTIONS} {...register('salesChannel')} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items ordered</span>
            <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>Add item</CreateButton>
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

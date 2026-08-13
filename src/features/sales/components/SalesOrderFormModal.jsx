import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salesOrderSchema, ORDER_STATUS_PIPELINE } from '@/features/sales/validators/salesOrder.schema';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

const EMPTY_ITEM = { productVariantId: '', quantity: '' };
const DEFAULT_VALUES = { branchId: '', warehouseId: '', customerId: '', promisedDeliveryDate: '', items: [EMPTY_ITEM] };

function statusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// A status may only advance one step at a time on the real pipeline
// (order.service.js assertTransition) — offer only "stay as-is" or "move to
// the next step".
function nextStepOptions(currentStatus) {
  const index = ORDER_STATUS_PIPELINE.indexOf(currentStatus);
  const next = ORDER_STATUS_PIPELINE[index + 1];
  const options = [{ value: currentStatus, label: `${statusLabel(currentStatus)} (current)` }];
  if (next) options.push({ value: next, label: `Advance to ${statusLabel(next)}` });
  return options;
}

export function SalesOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);

  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const customerOptions = (customersData?.data ?? []).map((customer) => ({ value: customer.id, label: customer.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const branchOptions = (branchesData?.data ?? []).map((branch) => ({ value: branch.id, label: branch.name }));

  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));

  // A customer is only ever sold the finished item — raw materials/
  // packaging/consumables never go out the door directly.
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500, product_type: 'finished_goods' });
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  // List rows only carry a lightweight items summary (no productVariantId —
  // see sales.api.js's fromBackendOrder comment), so the full item-array
  // schema validation would fail silently on an edit-mode reset. Status
  // changes don't touch items at all, so read the status value directly and
  // submit it without running the create-mode item validation.
  const statusValue = useWatch({ control, name: 'status' });

  useEffect(() => {
    if (!open) return;
    reset(isEdit ? initialValues : DEFAULT_VALUES);
  }, [open, isEdit, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Sales order ${initialValues.orderNumber}` : 'New sales order'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          {isEdit ? (
            <AppButton onClick={() => onSubmit({ status: statusValue ?? initialValues.status })} loading={isSubmitting}>
              Update status
            </AppButton>
          ) : (
            <AppButton type="submit" form="sales-order-form" loading={isSubmitting}>
              Create sales order
            </AppButton>
          )}
        </>
      }
    >
      <form id="sales-order-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Customer"
            placeholder="Select customer"
            required
            disabled={isEdit}
            options={customerOptions}
            error={errors.customerId?.message}
            {...register('customerId')}
          />
          <AppSelect
            label="Warehouse"
            placeholder="Select warehouse"
            required
            disabled={isEdit}
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Branch" placeholder="Select branch" disabled={isEdit} options={branchOptions} error={errors.branchId?.message} {...register('branchId')} />
          <AppInput
            label="Promised delivery date"
            type="date"
            disabled={isEdit}
            helperText="Used for On-Time-In-Full (OTIF) tracking"
            error={errors.promisedDeliveryDate?.message}
            {...register('promisedDeliveryDate')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items ordered</span>
            {!isEdit && (
              <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>Add item</CreateButton>
            )}
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
          {isEdit ? (
            <div className="flex flex-col gap-1">
              {(initialValues.items ?? []).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-text-muted">
                  <span>{variantOptions.find((option) => option.value === item.productVariantId)?.label ?? item.productVariantId}</span>
                  <span>Qty {item.quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_6rem_2rem] items-start gap-2">
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
            ))
          )}
        </div>

        {isEdit && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-text-muted">
              <span>Total</span>
              <span className="font-semibold text-text">₹{Number(initialValues?.total ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <AppSelect label="Status" options={nextStepOptions(initialValues.status ?? 'pending')} {...register('status')} />
          </div>
        )}
      </form>
    </AppModal>
  );
}

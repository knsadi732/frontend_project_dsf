import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useItemVariantsQuery } from '@/features/itemMaster/queries/useItemVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { warehouseId: '', itemVariantId: '', quantity: '', remarks: '' };

// Internal consumption (POST /items/stock/consume) — no Finance posting,
// unlike Receive Stock. Pre-fills warehouse/item variant when opened from a
// stock row. Stock is tracked per Item Variant (Chapter 8), not per Item.
export function ConsumeStockModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data: itemVariantsData } = useItemVariantsQuery({ pageSize: 500 });
  const itemVariantOptions = (itemVariantsData?.data ?? [])
    .filter((variant) => variant.stockKind !== 'fixed_asset' && variant.stockKind !== 'service')
    .map((variant) => {
      const attrs = [variant.size, variant.color].filter(Boolean).join('/');
      return { value: variant.id, label: `${variant.sku} — ${variant.itemName}${attrs ? ` (${attrs})` : ''}` };
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, ...initialValues });
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Consume stock"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="consume-stock-form" loading={isSubmitting}>Record consumption</AppButton>
        </>
      }
    >
      <form id="consume-stock-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
        <AppInput
          label="Quantity"
          type="number"
          step="0.01"
          required
          error={errors.quantity?.message}
          {...register('quantity', { required: 'Quantity is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
        />
        <AppInput label="Remarks" {...register('remarks')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useItemsQuery } from '@/features/itemMaster/queries/useItemsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { warehouseId: '', itemId: '', quantity: '', remarks: '' };

// Internal consumption (POST /items/stock/consume) — no Finance posting,
// unlike Receive Stock. Pre-fills warehouse/item when opened from a stock row.
export function ConsumeStockModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data: itemsData } = useItemsQuery({ pageSize: 500 });
  const itemOptions = (itemsData?.data ?? [])
    .filter((item) => item.stockKind !== 'fixed_asset' && item.stockKind !== 'service')
    .map((item) => ({ value: item.id, label: `${item.itemCode} — ${item.itemName}` }));

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
          label="Item"
          required
          placeholder="Select item"
          options={itemOptions}
          error={errors.itemId?.message}
          {...register('itemId', { required: 'Item is required' })}
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

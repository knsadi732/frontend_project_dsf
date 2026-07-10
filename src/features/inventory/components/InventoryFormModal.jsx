import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventorySchema } from '@/features/inventory/validators/inventory.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { sku: '', productName: '', warehouse: '', quantity: '', reorderLevel: '' };

export function InventoryFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit inventory item' : 'New inventory item'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="inventory-form" loading={isSubmitting}>
            Save inventory item
          </AppButton>
        </>
      }
    >
      <form id="inventory-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="SKU" required error={errors.sku?.message} {...register('sku')} />
          <AppInput label="Product Name" required error={errors.productName?.message} {...register('productName')} />
        </div>
        <AppInput label="Warehouse" required error={errors.warehouse?.message} {...register('warehouse')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Quantity"
            type="number"
            required
            error={errors.quantity?.message}
            {...register('quantity')}
          />
          <AppInput
            label="Reorder Level"
            type="number"
            required
            error={errors.reorderLevel?.message}
            {...register('reorderLevel')}
          />
        </div>
      </form>
    </AppModal>
  );
}

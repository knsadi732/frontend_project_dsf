import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productVariantSchema } from '@/features/productVariants/validators/productVariant.schema';
import { productVariantApi } from '@/services/productVariant.api';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  productId: '',
  size: '',
  color: '',
  sku: '',
  barcode: '',
  weight: '',
  mrp: '',
  sellingPrice: '',
  wholesalePrice: '',
  dealerPrice: '',
  costPrice: '',
  manufacturingRatePerUnit: '',
  packagingMaterialCostPerUnit: '',
  status: 'active',
};

export function ProductVariantFormModal({ open, onClose, initialValues, productOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productVariantSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? DEFAULT_VALUES);

    // New variant — the SKU is server-generated (sequence-backed), fetch a
    // suggestion as soon as the form opens (same pattern as PO/loan numbers).
    if (!initialValues?.id) {
      productVariantApi.generateSku().then((sku) => setValue('sku', sku));
    }
  }, [open, initialValues, reset, setValue]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit product variant' : 'New product variant'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="product-variant-form" loading={isSubmitting}>
            Save variant
          </AppButton>
        </>
      }
    >
      <form id="product-variant-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Product"
          placeholder="Select product"
          required
          options={productOptions}
          error={errors.productId?.message}
          {...register('productId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Size" error={errors.size?.message} {...register('size')} />
          <AppInput label="Color" error={errors.color?.message} {...register('color')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="SKU" required error={errors.sku?.message} {...register('sku')} />
          <AppInput label="Barcode" error={errors.barcode?.message} {...register('barcode')} />
          <AppInput label="Weight (kg)" type="number" step="0.001" error={errors.weight?.message} {...register('weight')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="MRP" type="number" step="0.01" error={errors.mrp?.message} {...register('mrp')} />
          <AppInput label="Selling price" type="number" step="0.01" error={errors.sellingPrice?.message} {...register('sellingPrice')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Cost price" type="number" step="0.01" error={errors.costPrice?.message} {...register('costPrice')} />
          <AppInput label="Wholesale price" type="number" step="0.01" error={errors.wholesalePrice?.message} {...register('wholesalePrice')} />
          <AppInput label="Dealer price" type="number" step="0.01" error={errors.dealerPrice?.message} {...register('dealerPrice')} />
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-3">
          <AppInput
            label="Manufacturing rate (₹/pair)"
            type="number"
            step="0.01"
            helperText="Piece-rate labour cost for this design — auto-applied to Work Order labour cost on completion"
            error={errors.manufacturingRatePerUnit?.message}
            {...register('manufacturingRatePerUnit')}
          />
          <AppInput
            label="Packaging material cost (₹/pair)"
            type="number"
            step="0.01"
            helperText="Box + poly/wrap — auto-applied to Work Order packaging cost on completion"
            error={errors.packagingMaterialCostPerUnit?.message}
            {...register('packagingMaterialCostPerUnit')}
          />
        </div>
        <AppSelect
          label="Status"
          error={errors.status?.message}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'discontinued', label: 'Discontinued' },
          ]}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

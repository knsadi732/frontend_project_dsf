import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productVariantSchema } from '@/features/productVariants/validators/productVariant.schema';
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
  material: '',
  gender: '',
  width: '',
  pattern: '',
  mrp: '',
  sellingPrice: '',
  status: 'active',
};

export function ProductVariantFormModal({ open, onClose, initialValues, productOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productVariantSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

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
          <AppInput label="Size" required error={errors.size?.message} {...register('size')} />
          <AppInput label="Color" required error={errors.color?.message} {...register('color')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="SKU" required error={errors.sku?.message} {...register('sku')} />
          <AppInput label="Barcode" required error={errors.barcode?.message} {...register('barcode')} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <AppInput label="Material" error={errors.material?.message} {...register('material')} />
          <AppSelect
            label="Gender"
            placeholder="Select"
            options={[
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' },
              { value: 'unisex', label: 'Unisex' },
              { value: 'kids', label: 'Kids' },
            ]}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <AppInput label="Width" error={errors.width?.message} {...register('width')} />
          <AppInput label="Pattern" error={errors.pattern?.message} {...register('pattern')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="MRP" type="number" step="0.01" required error={errors.mrp?.message} {...register('mrp')} />
          <AppInput
            label="Selling Price"
            type="number"
            step="0.01"
            required
            error={errors.sellingPrice?.message}
            {...register('sellingPrice')}
          />
        </div>
        <AppSelect
          label="Status"
          error={errors.status?.message}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          {...register('status')}
        />
      </form>
    </AppModal>
  );
}

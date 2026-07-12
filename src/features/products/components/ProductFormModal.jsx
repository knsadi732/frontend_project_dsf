import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, PRODUCT_TYPE_OPTIONS } from '@/features/products/validators/product.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  name: '',
  sku: '',
  categoryId: '',
  brandId: '',
  productType: 'finished_goods',
  hsnCode: '',
  gstPercent: '',
  unitOfMeasure: '',
  price: '',
  stock: '',
  status: 'active',
};

export function ProductFormModal({ open, onClose, initialValues, categoryOptions, brandOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit product' : 'New product'}
      className="max-w-xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="product-form" loading={isSubmitting}>
            Save product
          </AppButton>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="Name" required error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="SKU" required error={errors.sku?.message} {...register('sku')} />
          <AppSelect
            label="Category"
            placeholder="Select category"
            required
            options={categoryOptions}
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Brand"
            placeholder="Select brand"
            required
            options={brandOptions}
            error={errors.brandId?.message}
            {...register('brandId')}
          />
          <AppSelect
            label="Product type"
            options={PRODUCT_TYPE_OPTIONS}
            error={errors.productType?.message}
            {...register('productType')}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="HSN code" error={errors.hsnCode?.message} {...register('hsnCode')} />
          <AppInput label="GST %" type="number" step="0.01" error={errors.gstPercent?.message} {...register('gstPercent')} />
          <AppInput label="Unit of measure" placeholder="e.g. PAIR" error={errors.unitOfMeasure?.message} {...register('unitOfMeasure')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Price"
            type="number"
            step="0.01"
            required
            error={errors.price?.message}
            {...register('price')}
          />
          <AppInput
            label="Stock"
            type="number"
            required
            error={errors.stock?.message}
            {...register('stock')}
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

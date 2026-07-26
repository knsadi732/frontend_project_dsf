import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  productSchema,
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from '@/features/products/validators/product.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  name: '',
  productCode: '',
  categoryId: '',
  brandId: '',
  gender: '',
  productType: 'finished_goods',
  uom: '',
  description: '',
  hsnCode: '',
  gstPercentage: '',
  bomRequired: false,
  productionRequired: false,
  packagingRequired: false,
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
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1" noValidate>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Basic information</span>
          <AppInput label="Product name" required error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Product code" error={errors.productCode?.message} {...register('productCode')} />
            <AppSelect label="Product type" options={PRODUCT_TYPE_OPTIONS} error={errors.productType?.message} {...register('productType')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppSelect
              label="Category"
              placeholder="Select category"
              required
              options={categoryOptions}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
            <AppSelect
              label="Brand"
              placeholder="Select brand"
              options={brandOptions}
              error={errors.brandId?.message}
              {...register('brandId')}
            />
          </div>
          <AppSelect
            label="Gender"
            placeholder="Select gender"
            options={PRODUCT_GENDER_OPTIONS}
            error={errors.gender?.message}
            {...register('gender')}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Business information</span>
          <AppInput label="Description" error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-3 gap-4">
            <AppInput label="HSN code" error={errors.hsnCode?.message} {...register('hsnCode')} />
            <AppInput label="GST %" type="number" step="0.01" error={errors.gstPercentage?.message} {...register('gstPercentage')} />
            <AppInput label="Unit of measure" placeholder="e.g. pair" error={errors.uom?.message} {...register('uom')} />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Manufacturing</span>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('bomRequired')} />
              BOM required
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('productionRequired')} />
              Production required
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('packagingRequired')} />
              Packaging required
            </label>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <AppSelect label="Status" options={PRODUCT_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
        </div>
      </form>
    </AppModal>
  );
}

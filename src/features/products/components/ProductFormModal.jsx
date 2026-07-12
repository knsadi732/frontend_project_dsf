import { useEffect } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
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
  thumbnailUrl: '',
  galleryUrls: [],
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({ open, onClose, initialValues, categoryOptions, brandOptions, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const thumbnailUrl = useWatch({ control, name: 'thumbnailUrl' });
  const galleryUrls = useWatch({ control, name: 'galleryUrls' }) ?? [];

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  const handleThumbnailChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue('thumbnailUrl', await readFileAsDataUrl(file));
  };

  const handleGalleryChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setValue('galleryUrls', [...galleryUrls, ...dataUrls]);
  };

  const removeGalleryImage = (index) => {
    setValue('galleryUrls', galleryUrls.filter((_, i) => i !== index));
  };

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
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Product images</span>
          <div className="flex items-center gap-3">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Thumbnail" className="size-16 rounded-md border border-border object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-md border border-dashed border-border text-text-muted">
                <Upload className="size-5" />
              </div>
            )}
            <label className="cursor-pointer text-sm text-primary hover:underline">
              {thumbnailUrl ? 'Replace thumbnail' : 'Upload thumbnail'}
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {galleryUrls.map((url, index) => (
              <div key={index} className="group relative">
                <img src={url} alt={`Gallery ${index + 1}`} className="size-14 rounded-md border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  aria-label={`Remove gallery image ${index + 1}`}
                  className="absolute -right-1 -top-1 hidden rounded-full bg-danger p-0.5 text-white group-hover:block"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <label className="flex size-14 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-primary">
              <Upload className="size-4" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
            </label>
          </div>
        </div>
      </form>
    </AppModal>
  );
}

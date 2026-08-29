import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { itemVariantApi } from '@/features/itemMaster/api';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  itemId: '',
  sku: '',
  size: '',
  color: '',
  standardCost: '',
  remarks: '',
  status: 'active',
};

// Item Variant (Chapter 8 — Item -> Variant -> SKU, mirrors Product ->
// Product Variant). itemId is only settable on create — the backend's
// updateItemVariant schema has no itemId field, so it's locked once saved.
export function ItemVariantFormModal({ open, onClose, initialValues, itemOptions, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);
  const [skuPreview, setSkuPreview] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (!open) return;
    reset(initialValues ?? DEFAULT_VALUES);

    if (!isEdit) {
      itemVariantApi.generateSku().then((sku) => setSkuPreview(sku));
    } else {
      setSkuPreview(initialValues?.sku ?? '');
    }
  }, [open, initialValues, isEdit, reset, setValue]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit variant ${initialValues.sku}` : 'New item variant'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="item-variant-form" loading={isSubmitting}>
            Save variant
          </AppButton>
        </>
      }
    >
      <form id="item-variant-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Item"
          placeholder="Select item"
          required
          disabled={isEdit}
          options={itemOptions}
          error={errors.itemId?.message}
          {...register('itemId', { required: 'Item is required' })}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Size" error={errors.size?.message} {...register('size')} />
          <AppInput label="Color" error={errors.color?.message} {...register('color')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {isEdit ? (
            <AppInput label="SKU" disabled value={skuPreview} readOnly />
          ) : (
            <AppInput
              label="SKU"
              placeholder={skuPreview || 'Generating…'}
              helperText={`Leave blank to use ${skuPreview || '…'}, or type your own`}
              error={errors.sku?.message}
              {...register('sku')}
            />
          )}
          <AppInput label="Standard cost (₹)" type="number" step="0.01" error={errors.standardCost?.message} {...register('standardCost')} />
        </div>
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
        {isEdit && (
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
        )}
      </form>
    </AppModal>
  );
}

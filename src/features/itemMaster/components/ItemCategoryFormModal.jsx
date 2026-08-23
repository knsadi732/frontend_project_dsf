import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

// Chapter 8.4 stock outcome kinds — every Item Category routes to exactly
// one of these once purchased (see item.repository.js CHECK constraint).
export const STOCK_KIND_OPTIONS = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'packaging_material', label: 'Packaging Material' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'spare_part', label: 'Spare Part' },
  { value: 'fixed_asset', label: 'Fixed Asset' },
  { value: 'tool', label: 'Tool' },
  { value: 'service', label: 'Service' },
];

const DEFAULT_VALUES = { categoryName: '', categoryCode: '', parentCategoryId: '', stockKind: '', status: 'active' };

export function ItemCategoryFormModal({ open, onClose, initialValues, parentOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? {
              categoryName: initialValues.categoryName ?? '',
              categoryCode: initialValues.categoryCode ?? '',
              parentCategoryId: initialValues.parentCategoryId ?? '',
              stockKind: initialValues.stockKind ?? '',
              status: initialValues.status ?? 'active',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit item category' : 'New item category'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="item-category-form" loading={isSubmitting}>Save category</AppButton>
        </>
      }
    >
      <form id="item-category-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Name" required error={errors.categoryName?.message} {...register('categoryName', { required: 'Name is required' })} />
          <AppInput label="Category code" placeholder="Auto-generated if left blank" {...register('categoryCode')} />
        </div>
        <AppSelect
          label="Parent category"
          placeholder="None (top level)"
          options={parentOptions}
          {...register('parentCategoryId')}
        />
        <AppSelect
          label="Stock kind"
          placeholder="Select stock kind"
          helperText="Determines where purchases of items in this category end up — inventory, tool/spare register, fixed asset register, or a direct Finance expense (Service)."
          options={STOCK_KIND_OPTIONS}
          {...register('stockKind')}
        />
        {initialValues && (
          <AppSelect
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        )}
      </form>
    </AppModal>
  );
}

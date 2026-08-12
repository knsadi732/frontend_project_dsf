import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bomLineSchema } from '@/features/bom/validators/bomLine.schema';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { productId: '', rawMaterialVariantId: '', quantityPerUnit: '', remarks: '' };

export function BomLineFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);

  // Only manufactured products need a BOM — production_required marks that
  // (see Chapter 7 Product Master / product.validator.js).
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productOptions = (productsData?.data ?? [])
    .filter((product) => product.productionRequired)
    .map((product) => ({ value: product.id, label: product.name }));

  // Raw material inputs only — see PurchaseRequestFormModal's product_type
  // filter (GET /product-variants?product_type=raw_material).
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500, product_type: 'raw_material' });
  const variantOptions = (variantsData?.data ?? []).map((variant) => ({
    value: variant.id,
    label: [variant.sku, variant.size, variant.color].filter(Boolean).join(' — '),
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bomLineSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit BOM line' : 'New BOM line'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="bom-line-form" loading={isSubmitting}>
            Save BOM line
          </AppButton>
        </>
      }
    >
      <form id="bom-line-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Finished product"
          placeholder="Select product"
          required
          disabled={isEdit}
          options={productOptions}
          error={errors.productId?.message}
          {...register('productId')}
        />
        <Controller
          control={control}
          name="rawMaterialVariantId"
          render={({ field }) => (
            <AppComboSelect
              label="Raw material variant"
              required
              placeholder="Select raw material variant"
              options={variantOptions}
              error={errors.rawMaterialVariantId?.message}
              value={field.value}
              onChange={field.onChange}
              disabled={isEdit}
            />
          )}
        />
        <AppInput
          label="Quantity per unit"
          type="number"
          step="0.0001"
          required
          helperText="How much of this raw material goes into ONE unit of the finished product"
          error={errors.quantityPerUnit?.message}
          {...register('quantityPerUnit')}
        />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

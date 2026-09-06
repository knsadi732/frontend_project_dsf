import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { bomBuilderSchema } from '@/features/bom/validators/bomBuilder.schema';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useItemVariantsQuery } from '@/features/itemMaster/queries/useItemVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';

const EMPTY_LINE = { rawMaterialVariantId: '', quantityPerUnit: '', remarks: '' };
const DEFAULT_VALUES = { productId: '', lines: [EMPTY_LINE] };

// One product, many raw material lines added together — replaces adding
// each material one at a time through a separate modal per line.
export function BomBuilderModal({ open, onClose, onSubmit, isSubmitting }) {
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productOptions = (productsData?.data ?? [])
    .filter((product) => product.productionRequired)
    .map((product) => ({ value: product.id, label: product.name }));

  const { data: itemVariantsData } = useItemVariantsQuery({ pageSize: 500 });
  const variantOptions = (itemVariantsData?.data ?? [])
    .filter((variant) => variant.stockKind === 'raw_material')
    .map((variant) => ({
      value: variant.id,
      label: [variant.itemName, variant.sku, variant.size, variant.color].filter(Boolean).join(' — '),
    }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bomBuilderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New BOM"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="bom-builder-form" loading={isSubmitting}>
            Save BOM
          </AppButton>
        </>
      }
    >
      <form id="bom-builder-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Finished product"
          placeholder="Select product"
          required
          options={productOptions}
          error={errors.productId?.message}
          {...register('productId')}
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Raw materials</span>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(EMPTY_LINE)}
            >
              <Plus className="size-4" />
              Add material
            </AppButton>
          </div>
          {errors.lines?.message && <p className="text-xs text-danger">{errors.lines.message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2 rounded-md border border-border p-3">
              <div className="flex-1">
                <Controller
                  control={control}
                  name={`lines.${index}.rawMaterialVariantId`}
                  render={({ field: comboField }) => (
                    <AppComboSelect
                      label="Raw material variant"
                      required
                      placeholder="Select raw material variant"
                      options={variantOptions}
                      error={errors.lines?.[index]?.rawMaterialVariantId?.message}
                      value={comboField.value}
                      onChange={comboField.onChange}
                    />
                  )}
                />
              </div>
              <div className="w-40">
                <AppInput
                  label="Qty per unit"
                  type="number"
                  step="0.0001"
                  required
                  error={errors.lines?.[index]?.quantityPerUnit?.message}
                  {...register(`lines.${index}.quantityPerUnit`)}
                />
              </div>
              <div className="flex-1">
                <AppInput
                  label="Remarks"
                  error={errors.lines?.[index]?.remarks?.message}
                  {...register(`lines.${index}.remarks`)}
                />
              </div>
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                className="mt-6"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                title="Remove line"
              >
                <Trash2 className="size-4" />
              </AppButton>
            </div>
          ))}
        </div>
      </form>
    </AppModal>
  );
}

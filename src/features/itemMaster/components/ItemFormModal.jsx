import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

const EMPTY_SPEC_ROW = { key: '', value: '' };
const DEFAULT_VALUES = {
  itemCategoryId: '',
  preferredVendorId: '',
  itemCode: '',
  itemName: '',
  description: '',
  uom: '',
  hsnCode: '',
  gstPercentage: '',
  standardCost: '',
  reorderLevel: '',
  status: 'active',
  specRows: [],
};

// Item Specification (Chapter 8.6) is a free-form JSON object of technical
// attributes (thickness/GSM/grade/voltage, ...) — no fixed schema per
// category, so it's edited here as key/value rows and folded into/out of
// a plain object on submit/load.
function specToRows(specification) {
  return Object.entries(specification ?? {}).map(([key, value]) => ({ key, value: String(value ?? '') }));
}

function rowsToSpec(specRows) {
  return Object.fromEntries(
    (specRows ?? [])
      .filter((row) => row.key && row.key.trim())
      .map((row) => [row.key.trim(), row.value]),
  );
}

export function ItemFormModal({ open, onClose, initialValues, categoryOptions, onSubmit, isSubmitting }) {
  const { data: vendorsData } = useVendorsQuery({ pageSize: 200 });
  const vendorOptions = (vendorsData?.data ?? []).map((v) => ({ value: v.id, label: v.name }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove } = useFieldArray({ control, name: 'specRows' });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? {
              itemCategoryId: initialValues.itemCategoryId ?? '',
              preferredVendorId: initialValues.preferredVendorId ?? '',
              itemCode: initialValues.itemCode ?? '',
              itemName: initialValues.itemName ?? '',
              description: initialValues.description ?? '',
              uom: initialValues.uom ?? '',
              hsnCode: initialValues.hsnCode ?? '',
              gstPercentage: initialValues.gstPercentage ?? '',
              standardCost: initialValues.standardCost ?? '',
              reorderLevel: initialValues.reorderLevel ?? '',
              status: initialValues.status ?? 'active',
              specRows: specToRows(initialValues.specification),
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, initialValues, reset]);

  const handleFormSubmit = (values) => {
    const { specRows, ...rest } = values;
    onSubmit({ ...rest, specification: rowsToSpec(specRows) });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit item' : 'New item'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="item-form" loading={isSubmitting}>Save item</AppButton>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Item name" required error={errors.itemName?.message} {...register('itemName', { required: 'Item name is required' })} />
          <AppInput label="Item code" placeholder="Auto-generated if left blank" {...register('itemCode')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Item category"
            required
            placeholder="Select category"
            options={categoryOptions}
            error={errors.itemCategoryId?.message}
            {...register('itemCategoryId', { required: 'Item category is required' })}
          />
          <AppSelect label="Preferred vendor" placeholder="Select vendor" options={vendorOptions} {...register('preferredVendorId')} />
        </div>
        <AppInput label="Description" {...register('description')} />
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="UOM" placeholder="e.g. Kg, Sheet, Each" {...register('uom')} />
          <AppInput label="HSN / SAC code" {...register('hsnCode')} />
          <AppInput label="GST %" type="number" step="0.01" {...register('gstPercentage')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Standard cost (₹)" type="number" step="0.01" {...register('standardCost')} />
          <AppInput label="Reorder level" type="number" step="0.01" {...register('reorderLevel')} />
          {initialValues && (
            <AppSelect
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'discontinued', label: 'Discontinued' },
              ]}
              {...register('status')}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Specification</span>
            <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_SPEC_ROW)}>Add attribute</CreateButton>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_2rem] items-start gap-2">
              <AppInput placeholder="Attribute (e.g. Thickness)" {...register(`specRows.${index}.key`)} />
              <AppInput placeholder="Value (e.g. 5mm)" {...register(`specRows.${index}.value`)} />
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                aria-label="Remove attribute"
                className="text-danger hover:bg-danger/10"
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

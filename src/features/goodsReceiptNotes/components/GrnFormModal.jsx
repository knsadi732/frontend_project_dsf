import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goodsReceiptNoteSchema } from '@/features/goodsReceiptNotes/validators/goodsReceiptNote.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const EMPTY_ITEM = { product: '', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, damagedQty: 0 };
const DEFAULT_VALUES = {
  grnNumber: '',
  purchaseOrderId: '',
  vendorId: '',
  warehouseId: '',
  items: [EMPTY_ITEM],
  remarks: '',
  status: 'pending',
};

export function GrnFormModal({ open, onClose, initialValues, purchaseOrderOptions, warehouseOptions, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goodsReceiptNoteSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit GRN' : 'New goods receipt note'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="grn-form" loading={isSubmitting}>
            Save GRN
          </AppButton>
        </>
      }
    >
      <form id="grn-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="GRN Number" required error={errors.grnNumber?.message} {...register('grnNumber')} />
          <AppSelect label="Purchase order" placeholder="Select PO" required options={purchaseOrderOptions} error={errors.purchaseOrderId?.message} {...register('purchaseOrderId')} />
        </div>
        <AppSelect label="Warehouse" placeholder="Select warehouse" required options={warehouseOptions} error={errors.warehouseId?.message} {...register('warehouseId')} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items received</span>
            <AppButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>
              <Plus className="size-4" />
              Add item
            </AppButton>
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
          <div className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_2rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product</span>
            <span>Received</span>
            <span>Accepted</span>
            <span>Rejected</span>
            <span>Damaged</span>
            <span />
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_2rem] items-start gap-2">
              <AppInput placeholder="Product" error={errors.items?.[index]?.product?.message} {...register(`items.${index}.product`)} />
              <AppInput type="number" {...register(`items.${index}.receivedQty`)} />
              <AppInput type="number" {...register(`items.${index}.acceptedQty`)} />
              <AppInput type="number" {...register(`items.${index}.rejectedQty`)} />
              <AppInput type="number" {...register(`items.${index}.damagedQty`)} />
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove item"
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
              </AppButton>
            </div>
          ))}
        </div>

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

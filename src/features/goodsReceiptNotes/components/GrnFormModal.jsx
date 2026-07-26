import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grnSchema } from '@/features/goodsReceiptNotes/validators/goodsReceiptNote.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

function variantLabel(variantId, variantsById, productsById) {
  const variant = variantsById?.[variantId];
  if (!variant) return variantId;
  return `${variant.sku} — ${productsById?.[variant.productId]?.name ?? 'Unknown product'}`;
}

export function GrnFormModal({ open, onClose, purchaseOrder, warehouseOptions, productsById, variantsById, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(grnSchema),
    defaultValues: { warehouseId: '', vendorInvoiceNumber: '', receivedDate: '', remarks: '', items: [] },
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });

  useEffect(() => {
    if (!open || !purchaseOrder) return;
    reset({
      warehouseId: purchaseOrder.warehouseId ?? '',
      vendorInvoiceNumber: '',
      receivedDate: new Date().toISOString().slice(0, 10),
      remarks: '',
      items: (purchaseOrder.items ?? []).map((item) => ({
        purchaseOrderItemId: item.id,
        productVariantId: item.productVariantId,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        acceptedQuantity: item.quantity,
        rejectedQuantity: 0,
        rejectionReason: '',
      })),
    });
  }, [open, purchaseOrder, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`New GRN for ${purchaseOrder?.poNumber ?? ''}`}
      className="max-w-3xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="grn-form" loading={isSubmitting}>
            Create GRN
          </AppButton>
        </>
      }
    >
      <form id="grn-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-3 gap-4">
          <AppSelect label="Warehouse" placeholder="Select warehouse" required options={warehouseOptions} error={errors.warehouseId?.message} {...register('warehouseId')} />
          <AppInput label="Vendor invoice number" error={errors.vendorInvoiceNumber?.message} {...register('vendorInvoiceNumber')} />
          <AppInput label="Received date" type="date" required error={errors.receivedDate?.message} {...register('receivedDate')} />
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-sm font-medium text-text">Items received</span>
          <div className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_1fr] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product variant</span>
            <span>Ordered</span>
            <span>Received</span>
            <span>Accepted</span>
            <span>Rejected</span>
            <span>Rejection reason</span>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_5rem_5rem_5rem_5rem_1fr] items-start gap-2">
              <div className="flex h-9 items-center text-sm text-text">
                {variantLabel(items?.[index]?.productVariantId, variantsById, productsById)}
              </div>
              <div className="flex h-9 items-center text-sm text-text-muted">{items?.[index]?.orderedQuantity}</div>
              <AppInput type="number" error={errors.items?.[index]?.receivedQuantity?.message} {...register(`items.${index}.receivedQuantity`)} />
              <AppInput type="number" error={errors.items?.[index]?.acceptedQuantity?.message} {...register(`items.${index}.acceptedQuantity`)} />
              <AppInput type="number" error={errors.items?.[index]?.rejectedQuantity?.message} {...register(`items.${index}.rejectedQuantity`)} />
              <AppInput placeholder="If any rejected" {...register(`items.${index}.rejectionReason`)} />
            </div>
          ))}
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
        </div>

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

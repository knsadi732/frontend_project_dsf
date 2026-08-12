import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorQuotationSchema } from '@/features/rfqs/validators/rfq.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

function emptyItemsFor(materialItems) {
  return (materialItems ?? []).map((item) => ({ productVariantId: item.productVariantId, unitPrice: '', gstPercentage: '' }));
}

// Records one vendor's response to an RFQ (plan.md 11.7) — there's no vendor
// portal, so an internal user keys in what the vendor quoted by phone/email.
// Line items are seeded 1:1 from the RFQ's material list (from the source
// PR) — only price/GST are asked per line, the product/qty are fixed.
export function VendorQuotationFormModal({ open, onClose, rfq, onSubmit, isSubmitting }) {
  const alreadyQuotedVendorIds = useMemo(() => new Set((rfq?.quotations ?? []).map((q) => q.vendorId)), [rfq]);
  const vendorOptions = useMemo(
    () => (rfq?.vendors ?? []).filter((v) => !alreadyQuotedVendorIds.has(v.vendorId)).map((v) => ({ value: v.vendorId, label: v.vendorName })),
    [rfq, alreadyQuotedVendorIds],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorQuotationSchema),
    defaultValues: { rfqId: '', vendorId: '', deliveryTimeDays: '', paymentTerms: '', validityDate: '', freightAmount: '', discountAmount: '', remarks: '', items: [] },
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });

  useEffect(() => {
    if (!open || !rfq) return;
    reset({
      rfqId: rfq.id,
      vendorId: '',
      deliveryTimeDays: '',
      paymentTerms: '',
      validityDate: '',
      freightAmount: '',
      discountAmount: '',
      remarks: '',
      items: emptyItemsFor(rfq.materialItems),
    });
  }, [open, rfq, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Record vendor quotation — ${rfq?.rfqNumber ?? ''}`}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="vendor-quotation-form" loading={isSubmitting}>
            Save quotation
          </AppButton>
        </>
      }
    >
      <form id="vendor-quotation-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect label="Vendor" placeholder="Select vendor" required options={vendorOptions} error={errors.vendorId?.message} {...register('vendorId')} />

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Delivery time (days)" type="number" error={errors.deliveryTimeDays?.message} {...register('deliveryTimeDays')} />
          <AppInput label="Validity date" type="date" error={errors.validityDate?.message} {...register('validityDate')} />
        </div>
        <AppInput label="Payment terms" error={errors.paymentTerms?.message} {...register('paymentTerms')} />
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Freight (₹)" type="number" step="0.01" error={errors.freightAmount?.message} {...register('freightAmount')} />
          <AppInput label="Discount (₹)" type="number" step="0.01" error={errors.discountAmount?.message} {...register('discountAmount')} />
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-sm font-medium text-text">Line items</span>
          <div className="grid grid-cols-[1fr_5rem_6rem_6rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
            <span>Product</span>
            <span>Qty</span>
            <span>Unit Price (₹)</span>
            <span>GST %</span>
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => {
              const material = rfq?.materialItems?.[index];
              return (
                <div key={field.id} className="grid grid-cols-[1fr_5rem_6rem_6rem] items-start gap-2">
                  <div className="flex h-9 items-center text-sm text-text">
                    {material?.sku ? `${material.sku} — ${material.productName ?? ''}` : material?.productName}
                  </div>
                  <div className="flex h-9 items-center text-sm text-text-muted">{material?.quantity}</div>
                  <AppInput
                    type="number"
                    step="0.01"
                    error={errors.items?.[index]?.unitPrice?.message}
                    {...register(`items.${index}.unitPrice`)}
                  />
                  <AppInput type="number" step="0.01" error={errors.items?.[index]?.gstPercentage?.message} {...register(`items.${index}.gstPercentage`)} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold text-text">
            Total: ₹
            {(items ?? [])
              .reduce((sum, item, index) => sum + (Number(rfq?.materialItems?.[index]?.quantity) || 0) * (Number(item?.unitPrice) || 0), 0)
              .toLocaleString('en-IN')}
          </div>
        </div>

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

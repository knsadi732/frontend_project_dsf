import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rfqSchema } from '@/features/rfqs/validators/rfq.schema';
import { rfqApi } from '@/features/rfqs/api';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  purchaseRequestId: '',
  vendorIds: [],
  deliveryLocation: '',
  deliveryDate: '',
  paymentTerms: '',
  technicalSpecifications: '',
  remarks: '',
};

// Raised against a single approved Purchase Request (plan.md 11.6 "After PR
// approval, the Purchase Department issues RFQs to one or more vendors") —
// the material list itself comes straight from that PR, so this form only
// asks for who to send it to and the RFQ-specific terms.
export function RfqFormModal({ open, onClose, purchaseRequest, vendorOptions, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rfqSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Display-only preview of the reserved RFQ number — server-generated on
  // create, not part of the POST body (see rfqApi.create's toBackendPayload).
  const previewNumber = useWatch({ control, name: '__rfqNumberPreview' });

  useEffect(() => {
    if (!open) return;
    reset({ ...DEFAULT_VALUES, purchaseRequestId: purchaseRequest?.id ?? '' });
    rfqApi.generateNumber().then((generated) => setValue('__rfqNumberPreview', generated));
  }, [open, purchaseRequest, reset, setValue]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Create RFQ from ${purchaseRequest?.prNumber ?? 'purchase request'}`}
      className="max-w-lg"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="rfq-form" loading={isSubmitting}>
            Create RFQ
          </AppButton>
        </>
      }
    >
      <form id="rfq-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppInput label="RFQ Number" disabled placeholder={previewNumber ? undefined : 'Generating…'} value={previewNumber ?? ''} readOnly />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">
            Send to vendors <span className="text-danger">*</span>
          </span>
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-2">
            {(vendorOptions ?? []).map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" value={option.value} {...register('vendorIds')} />
                {option.label}
              </label>
            ))}
            {!vendorOptions?.length && <span className="text-sm text-text-muted">No vendors available</span>}
          </div>
          {errors.vendorIds?.message && <p className="text-xs text-danger">{errors.vendorIds.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Delivery location" error={errors.deliveryLocation?.message} {...register('deliveryLocation')} />
          <AppInput label="Delivery date" type="date" error={errors.deliveryDate?.message} {...register('deliveryDate')} />
        </div>
        <AppInput label="Payment terms" error={errors.paymentTerms?.message} {...register('paymentTerms')} />
        <AppInput label="Technical specifications" error={errors.technicalSpecifications?.message} {...register('technicalSpecifications')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

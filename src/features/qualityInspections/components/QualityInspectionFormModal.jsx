import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { qualityInspectionSchema } from '@/features/qualityInspections/validators/qualityInspection.schema';
import { QC_RESULT_OPTIONS } from '@/constants/statusEnums';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

export function QualityInspectionFormModal({ open, onClose, workOrder, onSubmit, isSubmitting }) {
  const defaultValues = {
    workOrderId: workOrder?.id ?? '',
    inspectedQty: workOrder?.quantity ?? '',
    acceptedQty: workOrder?.quantity ?? '',
    reworkQty: 0,
    rejectedQty: 0,
    result: 'accepted',
    inspectedDate: new Date().toISOString().slice(0, 10),
    remarks: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(qualityInspectionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workOrder, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Record inspection — ${workOrder?.workOrderNumber ?? ''}`}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="quality-inspection-form" loading={isSubmitting}>
            Save inspection
          </AppButton>
        </>
      }
    >
      <form id="quality-inspection-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Inspected qty" type="number" required error={errors.inspectedQty?.message} {...register('inspectedQty')} />
          <AppInput label="Accepted qty" type="number" required error={errors.acceptedQty?.message} {...register('acceptedQty')} />
          <AppInput label="Rework qty" type="number" error={errors.reworkQty?.message} {...register('reworkQty')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Rejected qty" type="number" error={errors.rejectedQty?.message} {...register('rejectedQty')} />
          <AppSelect label="Result" options={QC_RESULT_OPTIONS} error={errors.result?.message} {...register('result')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Inspection date" type="date" required error={errors.inspectedDate?.message} {...register('inspectedDate')} />
          <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
        </div>
      </form>
    </AppModal>
  );
}

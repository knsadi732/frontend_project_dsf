import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { statutoryAuditSchema } from '@/features/compliance/validators/statutoryAudit.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { auditorName: '', conductedAt: '', findings: '', remarks: '' };

export function StatutoryAuditFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(statutoryAuditSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, conductedAt: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Record statutory audit"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="statutory-audit-form" loading={isSubmitting}>
            Save audit
          </AppButton>
        </>
      }
    >
      <form id="statutory-audit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Auditor name" required error={errors.auditorName?.message} {...register('auditorName')} />
          <AppInput label="Conducted on" type="date" required error={errors.conductedAt?.message} {...register('conductedAt')} />
        </div>
        <AppInput label="Findings" error={errors.findings?.message} {...register('findings')} />
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

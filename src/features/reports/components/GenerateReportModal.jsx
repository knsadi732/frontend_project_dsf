import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateReportSchema } from '@/features/reports/validators/generateReport.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { type: 'sales', dateFrom: '', dateTo: '' };

const TYPE_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'finance', label: 'Finance' },
  { value: 'production', label: 'Production' },
];

export function GenerateReportModal({ open, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateReportSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Generate report"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="generate-report-form" loading={isSubmitting}>
            Generate
          </AppButton>
        </>
      }
    >
      <form id="generate-report-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <AppSelect
          label="Type"
          required
          error={errors.type?.message}
          options={TYPE_OPTIONS}
          {...register('type')}
        />
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Date from"
            type="date"
            required
            error={errors.dateFrom?.message}
            {...register('dateFrom')}
          />
          <AppInput
            label="Date to"
            type="date"
            required
            error={errors.dateTo?.message}
            {...register('dateTo')}
          />
        </div>
      </form>
    </AppModal>
  );
}

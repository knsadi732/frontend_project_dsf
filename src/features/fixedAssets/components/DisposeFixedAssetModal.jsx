import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DISPOSAL_TYPE_OPTIONS = [
  { value: 'sale', label: 'Sale' },
  { value: 'write_off', label: 'Write-off' },
  { value: 'scrap', label: 'Scrap' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES = { disposalType: 'sale', disposalDate: todayIso(), disposalValue: '', remarks: '' };

// Disposal permanently closes the asset's lifecycle (status -> 'disposed');
// the row is never deleted (Chapter 13.9).
export function DisposeFixedAssetModal({ open, onClose, onSubmit, isSubmitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, disposalDate: todayIso() });
  }, [open, reset]);

  const handleFormSubmit = (values) => {
    onSubmit({ ...values, disposalValue: values.disposalValue === '' ? undefined : values.disposalValue });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Dispose asset"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton variant="danger" type="submit" form="dispose-asset-form" loading={isSubmitting}>Dispose asset</AppButton>
        </>
      }
    >
      <form id="dispose-asset-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-text-muted">This permanently closes the asset&apos;s lifecycle — it cannot be reversed.</p>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Disposal type" options={DISPOSAL_TYPE_OPTIONS} error={errors.disposalType?.message} {...register('disposalType', { required: true })} />
          <AppInput label="Disposal date" type="date" required error={errors.disposalDate?.message} {...register('disposalDate', { required: 'Disposal date is required' })} />
        </div>
        <AppInput label="Disposal value (₹)" type="number" step="0.01" helperText="If sold" {...register('disposalValue')} />
        <AppInput label="Remarks" {...register('remarks')} />
      </form>
    </AppModal>
  );
}

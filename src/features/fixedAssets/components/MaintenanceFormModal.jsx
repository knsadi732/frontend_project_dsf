import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const MAINTENANCE_TYPE_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'breakdown', label: 'Breakdown' },
];

const PAYMENT_MODE_OPTIONS = [
  { value: '', label: 'Select mode' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES = {
  maintenanceType: 'scheduled',
  maintenanceDate: todayIso(),
  vendorName: '',
  cost: '',
  downtimeHours: '',
  nextScheduledDate: '',
  setUnderMaintenance: false,
  paymentMode: '',
  remarks: '',
};

// Maintenance cost posts to Finance as an expense only when `cost` is given
// (Chapter 13.8) — doesn't touch the depreciation schedule.
export function MaintenanceFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, maintenanceDate: todayIso() });
  }, [open, reset]);

  const handleFormSubmit = (values) => {
    onSubmit({
      ...values,
      cost: values.cost === '' ? undefined : values.cost,
      downtimeHours: values.downtimeHours === '' ? undefined : values.downtimeHours,
      nextScheduledDate: values.nextScheduledDate || undefined,
      paymentMode: values.paymentMode || undefined,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Log maintenance"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="maintenance-form" loading={isSubmitting}>Save maintenance</AppButton>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Type" options={MAINTENANCE_TYPE_OPTIONS} {...register('maintenanceType')} />
          <AppInput label="Maintenance date" type="date" required {...register('maintenanceDate', { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Vendor / service provider" {...register('vendorName')} />
          <AppInput label="Cost (₹)" type="number" step="0.01" helperText="Optional — posts a Finance expense when given" {...register('cost')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Downtime (hours)" type="number" step="0.5" {...register('downtimeHours')} />
          <AppInput label="Next scheduled date" type="date" {...register('nextScheduledDate')} />
        </div>
        <AppSelect label="Payment mode" options={PAYMENT_MODE_OPTIONS} {...register('paymentMode')} />
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" className="size-4" {...register('setUnderMaintenance')} />
          Mark asset as under maintenance
        </label>
        <AppInput label="Remarks" {...register('remarks')} />
      </form>
    </AppModal>
  );
}

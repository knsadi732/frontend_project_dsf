import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { attendanceSchema, ATTENDANCE_STATUS_OPTIONS } from '@/features/attendance/validators/attendance.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  employeeId: '',
  date: '',
  shift: 'Day',
  checkIn: '',
  checkOut: '',
  lateEntry: false,
  earlyExit: false,
  overtimeHours: 0,
  totalHours: 0,
  status: 'present',
};

export function AttendanceFormModal({ open, onClose, initialValues, employeeOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit attendance' : 'New attendance record'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="attendance-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="attendance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Employee"
            placeholder="Select employee"
            required
            options={employeeOptions}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />
          <AppInput label="Date" type="date" required error={errors.date?.message} {...register('date')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Shift" error={errors.shift?.message} {...register('shift')} />
          <AppInput label="Check-in" type="time" error={errors.checkIn?.message} {...register('checkIn')} />
          <AppInput label="Check-out" type="time" error={errors.checkOut?.message} {...register('checkOut')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Overtime hours" type="number" step="0.5" error={errors.overtimeHours?.message} {...register('overtimeHours')} />
          <AppInput label="Total hours" type="number" step="0.5" error={errors.totalHours?.message} {...register('totalHours')} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" className="size-4" {...register('lateEntry')} />
            Late entry
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" className="size-4" {...register('earlyExit')} />
            Early exit
          </label>
        </div>
        <AppSelect label="Status" options={ATTENDANCE_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  customerCommunicationSchema,
  COMMUNICATION_CHANNEL_OPTIONS,
} from '@/features/customerCommunications/validators/customerCommunication.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

export function CustomerCommunicationFormModal({ open, onClose, customerId, contactedBy, onSubmit, isSubmitting }) {
  const defaultValues = {
    customerId: customerId ?? '',
    channel: 'call',
    notes: '',
    contactedBy: contactedBy ?? '',
    date: new Date().toISOString().slice(0, 10),
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerCommunicationSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Log communication"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="customer-communication-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="customer-communication-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Channel" options={COMMUNICATION_CHANNEL_OPTIONS} error={errors.channel?.message} {...register('channel')} />
          <AppInput label="Date" type="date" required error={errors.date?.message} {...register('date')} />
        </div>
        <AppInput label="Notes" required error={errors.notes?.message} {...register('notes')} />
        <AppInput label="Contacted by" error={errors.contactedBy?.message} {...register('contactedBy')} />
      </form>
    </AppModal>
  );
}

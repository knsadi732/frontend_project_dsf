import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

const channelEditSchema = z.object({
  defaultCommissionPercent: z.coerce.number().min(0).max(100),
  defaultCostPerUnit: z.coerce.number().min(0),
  assumedCustomerReturnPercent: z.coerce.number().min(0).max(100),
  assumedRtoPercent: z.coerce.number().min(0).max(100),
  marginMin: z.coerce.number().min(0),
  marginMax: z.coerce.number().min(0),
  remarks: z.string().optional(),
});

export function MarketplaceChannelEditModal({ channel, onClose, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(channelEditSchema) });

  useEffect(() => {
    if (channel) reset(channel);
  }, [channel, reset]);

  return (
    <AppModal
      open={Boolean(channel)}
      onClose={onClose}
      title={channel ? `Edit ${channel.name}` : 'Edit channel'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="channel-edit-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="channel-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Commission (%)" type="number" step="0.01" error={errors.defaultCommissionPercent?.message} {...register('defaultCommissionPercent')} />
          <AppInput label="Default marketplace cost (₹/pair)" type="number" step="0.01" error={errors.defaultCostPerUnit?.message} {...register('defaultCostPerUnit')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Assumed CR %" type="number" step="0.01" error={errors.assumedCustomerReturnPercent?.message} {...register('assumedCustomerReturnPercent')} />
          <AppInput label="Assumed RTO %" type="number" step="0.01" error={errors.assumedRtoPercent?.message} {...register('assumedRtoPercent')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Margin min (₹/pair)" type="number" step="0.01" error={errors.marginMin?.message} {...register('marginMin')} />
          <AppInput label="Margin max (₹/pair)" type="number" step="0.01" error={errors.marginMax?.message} {...register('marginMax')} />
        </div>
        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorBillSchema } from '@/features/vendorBills/validators/vendorBill.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { billNumber: '', vendorId: '', purchaseOrderId: '', grnId: '', amount: '', gstAmount: 0, dueDate: '' };

export function VendorBillFormModal({ open, onClose, vendorOptions, purchaseOrderOptions, grnOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorBillSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New vendor bill"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="vendor-bill-form" loading={isSubmitting}>
            Save bill
          </AppButton>
        </>
      }
    >
      <form id="vendor-bill-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Bill number" required error={errors.billNumber?.message} {...register('billNumber')} />
          <AppSelect label="Vendor" placeholder="Select vendor" required options={vendorOptions} error={errors.vendorId?.message} {...register('vendorId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Purchase order" placeholder="Select PO" required options={purchaseOrderOptions} error={errors.purchaseOrderId?.message} {...register('purchaseOrderId')} />
          <AppSelect label="GRN" placeholder="Select GRN (optional)" options={grnOptions} error={errors.grnId?.message} {...register('grnId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
          <AppInput label="GST amount (₹)" type="number" step="0.01" error={errors.gstAmount?.message} {...register('gstAmount')} />
        </div>
        <AppInput label="Due date" type="date" required error={errors.dueDate?.message} {...register('dueDate')} />
      </form>
    </AppModal>
  );
}

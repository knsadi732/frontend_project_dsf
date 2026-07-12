import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseRequestSchema, PR_STATUS_OPTIONS } from '@/features/purchaseRequests/validators/purchaseRequest.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const EMPTY_ITEM = { product: '', quantity: '' };
const DEFAULT_VALUES = {
  prNumber: '',
  departmentId: '',
  requestedBy: '',
  priority: 'normal',
  requiredDate: '',
  warehouseId: '',
  items: [EMPTY_ITEM],
  remarks: '',
  status: 'draft',
};

export function PurchaseRequestFormModal({ open, onClose, initialValues, departmentOptions, warehouseOptions, onSubmit, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit purchase request' : 'New purchase request'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="purchase-request-form" loading={isSubmitting}>
            Save request
          </AppButton>
        </>
      }
    >
      <form id="purchase-request-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="PR Number" required error={errors.prNumber?.message} {...register('prNumber')} />
          <AppInput label="Requested by" required error={errors.requestedBy?.message} {...register('requestedBy')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Department" placeholder="Select department" required options={departmentOptions} error={errors.departmentId?.message} {...register('departmentId')} />
          <AppSelect label="Warehouse" placeholder="Select warehouse" required options={warehouseOptions} error={errors.warehouseId?.message} {...register('warehouseId')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AppInput label="Required date" type="date" required error={errors.requiredDate?.message} {...register('requiredDate')} />
          <AppSelect
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <AppSelect label="Status" options={PR_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items requested</span>
            <AppButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>
              <Plus className="size-4" />
              Add item
            </AppButton>
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_8rem_2rem] items-start gap-2">
              <AppInput placeholder="Product / material" error={errors.items?.[index]?.product?.message} {...register(`items.${index}.product`)} />
              <AppInput type="number" placeholder="Qty" error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity`)} />
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove item"
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
              </AppButton>
            </div>
          ))}
        </div>

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseRequestSchema, PR_STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/features/purchaseRequests/validators/purchaseRequest.schema';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useAuth } from '@/hooks/useAuth';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';

const EMPTY_ITEM = { productId: '', quantity: '', remarks: '' };
const DEFAULT_VALUES = {
  prNumber: '',
  requestDate: '',
  requestedBy: '',
  departmentId: '',
  priority: 'normal',
  requiredDate: '',
  warehouseId: '',
  items: [EMPTY_ITEM],
  remarks: '',
  status: 'draft',
};

export function PurchaseRequestFormModal({ open, onClose, initialValues, departmentOptions, warehouseOptions, onSubmit, isSubmitting }) {
  const { user } = useAuth();

  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productOptions = (productsData?.data ?? []).map((product) => ({
    value: product.id,
    label: `${product.sku} — ${product.name}`,
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const prNumber = useWatch({ control, name: 'prNumber' });
  const isGeneratingNumber = open && !initialValues?.id && !prNumber;

  // Department isn't a free choice — Chapter 3 (Employee Domain): every
  // employee belongs to one primary department, so a PR is always raised
  // on behalf of the requester's own department. Only falls back to a
  // manual pick if the backend session doesn't carry departmentId yet
  // (see auth.api.js's fromBackendUser).
  const departmentAutoFilled = Boolean(user?.departmentId);

  useEffect(() => {
    if (!open) return;
    const today = new Date().toISOString().slice(0, 10);
    reset(
      initialValues ?? {
        ...DEFAULT_VALUES,
        requestDate: today,
        requiredDate: today,
        requestedBy: user?.name ?? '',
        departmentId: user?.departmentId ?? '',
      },
    );

    // New request — PR Number is server-generated (sequence-backed), not
    // client-typed (Chapter-11.md §11.4 / ApiList.md generate-number).
    if (!initialValues?.id) {
      purchaseRequestApi.generateNumber().then((generated) => setValue('prNumber', generated));
      setValue('requestedBy', user?.name ?? '');
      if (user?.departmentId) setValue('departmentId', user.departmentId);
    }
  }, [open, initialValues, reset, setValue, user]);

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
          <AppInput
            label="PR Number"
            required
            disabled
            placeholder={isGeneratingNumber ? 'Generating…' : undefined}
            error={errors.prNumber?.message}
            {...register('prNumber')}
          />
          <AppInput label="Requested by" required disabled error={errors.requestedBy?.message} {...register('requestedBy')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Request date" type="date" required disabled error={errors.requestDate?.message} {...register('requestDate')} />
          <AppInput label="Required date" type="date" required error={errors.requiredDate?.message} {...register('requiredDate')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Department"
            placeholder="Select department"
            required
            disabled={departmentAutoFilled}
            options={departmentOptions}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />
          <AppSelect label="Warehouse" placeholder="Select warehouse" required options={warehouseOptions} error={errors.warehouseId?.message} {...register('warehouseId')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Priority" options={PRIORITY_OPTIONS} error={errors.priority?.message} {...register('priority')} />
          {initialValues?.id && (
            <AppSelect label="Status" options={PR_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
          )}
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
            <div key={field.id} className="grid grid-cols-[1fr_6rem_1fr_2rem] items-start gap-2">
              <Controller
                control={control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <AppComboSelect
                    placeholder="Select product"
                    options={productOptions}
                    error={errors.items?.[index]?.productId?.message}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <AppInput type="number" placeholder="Qty" error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity`)} />
              <AppInput placeholder="Remarks (optional)" error={errors.items?.[index]?.remarks?.message} {...register(`items.${index}.remarks`)} />
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

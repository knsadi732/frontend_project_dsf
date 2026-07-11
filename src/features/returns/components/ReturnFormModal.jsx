import { useEffect, useMemo } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnSchema } from '@/features/returns/validators/return.schema';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { RETURN_STATUS, RETURN_STATUS_OPTIONS } from '@/constants/statusEnums';

const DEFAULT_VALUES = {
  returnNumber: '',
  salesOrderId: '',
  soNumber: '',
  productId: '',
  quantity: '',
  type: 'customer',
  reason: '',
  amount: 0,
  createdDate: '',
  status: RETURN_STATUS.REPORTED,
};

export function ReturnFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const { data: salesData } = useSalesOrdersQuery({ pageSize: 100 });
  const salesOrders = salesData?.data ?? [];
  const soOptions = salesOrders.map((so) => ({ value: so.id, label: so.soNumber }));

  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const productOptions = products.map((product) => ({ value: product.id, label: `${product.name} (₹${product.price})` }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const quantity = useWatch({ control, name: 'quantity' });
  const productId = useWatch({ control, name: 'productId' });

  useEffect(() => {
    if (open) reset(initialValues ?? DEFAULT_VALUES);
  }, [open, initialValues, reset]);

  useEffect(() => {
    const product = products.find((item) => item.id === productId);
    if (product && quantity) {
      setValue('amount', Number(product.price) * Number(quantity));
    }
  }, [productId, quantity, products, setValue]);

  const handleSalesOrderChange = (salesOrderId) => {
    const so = salesOrders.find((item) => item.id === salesOrderId);
    setValue('soNumber', so?.soNumber ?? '');
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit return' : 'New return'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="return-form" loading={isSubmitting}>
            Save return
          </AppButton>
        </>
      }
    >
      <form id="return-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppInput
            label="Return Number"
            required
            error={errors.returnNumber?.message}
            {...register('returnNumber')}
          />
          <Controller
            control={control}
            name="salesOrderId"
            render={({ field }) => (
              <AppSelect
                label="Sales Order"
                required
                placeholder="Select sales order"
                options={soOptions}
                error={errors.salesOrderId?.message}
                value={field.value}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event);
                  handleSalesOrderChange(event.target.value);
                }}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Product"
            required
            placeholder="Select product"
            options={productOptions}
            error={errors.productId?.message}
            {...register('productId')}
          />
          <AppInput
            label="Quantity"
            type="number"
            required
            error={errors.quantity?.message}
            {...register('quantity')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Type"
            options={[
              { value: 'customer', label: 'Customer return' },
              { value: 'courier', label: 'Courier return' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
          <AppInput
            label="Date"
            type="date"
            required
            error={errors.createdDate?.message}
            {...register('createdDate')}
          />
        </div>

        <AppInput label="Reason" required error={errors.reason?.message} {...register('reason')} />

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Amount (₹)" type="number" readOnly error={errors.amount?.message} {...register('amount')} />
          <AppSelect
            label="Status"
            error={errors.status?.message}
            options={RETURN_STATUS_OPTIONS}
            {...register('status')}
          />
        </div>
      </form>
    </AppModal>
  );
}

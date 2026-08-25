import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketplaceSettlementSchema, RETURN_TYPE_OPTIONS } from '@/features/marketplaceSettlements/validators/marketplaceSettlement.schema';
import { useMarketplaceChannelsQuery } from '@/features/marketplaceChannels/queries/useMarketplaceChannelsQuery';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  channelId: '',
  billId: '',
  orderId: '',
  productVariantId: '',
  settlementDate: '',
  returnType: 'none',
  grossSaleAmount: 0,
  commissionAmount: 0,
  shippingCharge: 0,
  returnCharge: 0,
  adsCharge: 0,
  tcsAmount: 0,
  tdsAmount: 0,
  netAmountReceived: 0,
  remarks: '',
};

export function MarketplaceSettlementFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const { data: channels = [] } = useMarketplaceChannelsQuery();
  const channelOptions = channels.map((c) => ({ value: c.id, label: c.name }));

  const { data: invoicesData } = useInvoicesQuery({ pageSize: 100 });
  const invoices = invoicesData?.data ?? [];
  const invoiceOptions = [{ value: '', label: '— none (bulk entry) —' }, ...(invoices.map((inv) => ({ value: inv.id, label: `${inv.invoiceNumber} — ${inv.salesOrderNumber ?? ''}` })))];

  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const variantOptions = [{ value: '', label: '— none —' }, ...((variantsData?.data ?? []).map((v) => ({ value: v.id, label: v.sku })))];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(marketplaceSettlementSchema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset({ ...DEFAULT_VALUES, settlementDate: new Date().toISOString().slice(0, 10) });
  }, [open, reset]);

  const billId = useWatch({ control, name: 'billId' });
  const selectedInvoice = invoices.find((inv) => inv.id === billId);

  // Order ID is never picked independently — it always comes from the
  // selected invoice, so the moment an invoice is chosen, orderId follows.
  const handleInvoiceChange = (event) => {
    const invoice = invoices.find((inv) => inv.id === event.target.value);
    setValue('billId', event.target.value);
    setValue('orderId', invoice?.orderId ?? '');
  };

  const [gross, commission, shipping, returnCharge, ads, tcs, tds] = useWatch({
    control,
    name: ['grossSaleAmount', 'commissionAmount', 'shippingCharge', 'returnCharge', 'adsCharge', 'tcsAmount', 'tdsAmount'],
  });
  const netPreview = [gross, commission, shipping, returnCharge, ads, tcs, tds].reduce(
    (acc, val, idx) => (idx === 0 ? acc + (Number(val) || 0) : acc - (Number(val) || 0)),
    0,
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="New marketplace settlement"
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="settlement-form" loading={isSubmitting}>
            Save settlement
          </AppButton>
        </>
      }
    >
      <form id="settlement-form" onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Channel" required placeholder="Select channel" options={channelOptions} error={errors.channelId?.message} {...register('channelId')} />
          <AppInput label="Settlement date" type="date" required error={errors.settlementDate?.message} {...register('settlementDate')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Invoice"
            placeholder="Optional — Order ID is derived from this"
            options={invoiceOptions}
            error={errors.billId?.message}
            value={billId}
            onChange={handleInvoiceChange}
          />
          <AppSelect label="Return type" options={RETURN_TYPE_OPTIONS} error={errors.returnType?.message} {...register('returnType')} />
        </div>

        {selectedInvoice && (
          <div className="grid grid-cols-2 gap-4 text-xs text-text-muted">
            <p>Invoice #: <span className="font-medium text-text">{selectedInvoice.invoiceNumber}</span></p>
            <p>Order #: <span className="font-medium text-text">{selectedInvoice.salesOrderNumber ?? '—'}</span></p>
          </div>
        )}

        <AppSelect
          label="Product Variant (SKU)"
          placeholder="Optional — needed for per-product cost/return% reporting"
          options={variantOptions}
          error={errors.productVariantId?.message}
          {...register('productVariantId')}
        />

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Gross sale amount (₹)" type="number" step="0.01" error={errors.grossSaleAmount?.message} {...register('grossSaleAmount')} />
          <AppInput label="Commission (₹)" type="number" step="0.01" error={errors.commissionAmount?.message} {...register('commissionAmount')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppInput label="Shipping/courier charge (₹)" type="number" step="0.01" error={errors.shippingCharge?.message} {...register('shippingCharge')} />
          <AppInput label="Return charge (₹)" type="number" step="0.01" error={errors.returnCharge?.message} {...register('returnCharge')} />
        </div>

        <AppInput label="Ads charge (₹)" type="number" step="0.01" error={errors.adsCharge?.message} {...register('adsCharge')} />

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-3">
          <AppInput label="TCS (₹)" type="number" step="0.01" helperText="GST credit — not a cost" error={errors.tcsAmount?.message} {...register('tcsAmount')} />
          <AppInput label="TDS (₹)" type="number" step="0.01" helperText="Income tax credit — not a cost" error={errors.tdsAmount?.message} {...register('tdsAmount')} />
        </div>

        <AppInput label="Net amount received (₹)" type="number" step="0.01" error={errors.netAmountReceived?.message} {...register('netAmountReceived')} />
        <p className="text-xs text-text-muted">Check (gross − commission − shipping − return − ads − TCS − TDS): ₹{netPreview.toLocaleString('en-IN')}</p>

        <AppInput label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </AppModal>
  );
}

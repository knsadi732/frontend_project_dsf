import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { salesOrderSchema, ORDER_STATUS_PIPELINE, B2B_CUSTOMER_TYPES } from '@/features/sales/validators/salesOrder.schema';
import { CUSTOMER_TYPE_OPTIONS } from '@/features/customers/validators/customer.schema';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useCreateCustomer } from '@/features/customers/mutations/useCreateCustomer';
import { useMarketplaceChannelsQuery } from '@/features/marketplaceChannels/queries/useMarketplaceChannelsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';

const EMPTY_ITEM = { productVariantId: '', quantity: '' };
const DEFAULT_VALUES = {
  branchId: '',
  warehouseId: '',
  customerMode: 'existing',
  customerId: '',
  newCustomerType: 'direct',
  newCustomerDirectType: 'retail',
  newCustomerName: '',
  newCustomerPhone: '',
  newCustomerEmail: '',
  newCustomerGstin: '',
  newCustomerChannelId: '',
  newCustomerAddress: '',
  newCustomerCity: '',
  newCustomerState: '',
  newCustomerPostalCode: '',
  promisedDeliveryDate: '',
  channelOrderNumber: '',
  items: [EMPTY_ITEM],
};

function normalizePhone(phone) {
  return (phone ?? '').replace(/\D/g, '');
}

function normalizeGstin(gstin) {
  return (gstin ?? '').replace(/\s/g, '').toUpperCase();
}

// Direct: a real buyer you can call — name + phone, backend customer_type
// 'retail'. Marketplace: a Meesho/Flipkart/Amazon buyer — the platform masks
// phone/email, so the channel is asked for instead; backend customer_type
// 'marketplace' (party.validator.js CUSTOMER_TYPES already has both).
const NEW_CUSTOMER_TYPE_OPTIONS = [
  { value: 'direct', label: 'Direct customer' },
  { value: 'marketplace', label: 'Marketplace customer' },
];

// The Customers module's own type list, minus 'marketplace' — that's already
// the other half of the choice above, not a sub-type of "direct".
const DIRECT_CUSTOMER_TYPE_OPTIONS = CUSTOMER_TYPE_OPTIONS.filter((option) => option.value !== 'marketplace');

// A real child component (not inline JSX) so its search state resets for
// free every time it mounts — and it does mount fresh each time, because
// BaseModal removes its children from the tree while closed. No manual
// reset effect needed.
function CustomerSearchBox({ customers, error, onSelectExisting, onStartNew }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const normalized = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalized) return customers.slice(0, 8);
    const normalizedPhoneQuery = normalizePhone(query);
    const normalizedGstinQuery = normalizeGstin(query);
    return customers
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(normalized) ||
          (normalizedPhoneQuery && normalizePhone(c.phone).includes(normalizedPhoneQuery)) ||
          (normalizedGstinQuery.length >= 4 && normalizeGstin(c.gstin).includes(normalizedGstinQuery)),
      )
      .slice(0, 8);
  }, [customers, normalized, query]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <AppInput
        placeholder="Search customer by name, phone (B2C) or GSTIN (B2B)…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        error={error}
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-md">
          {matches.length === 0 && <li className="px-3 py-1.5 text-xs text-text-muted">No existing customer matches.</li>}
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectExisting(c)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-primary/10"
              >
                <span className="text-text">{c.name}</span>
                <span className="text-xs text-text-muted">{c.phone || c.gstin || '—'}</span>
              </button>
            </li>
          ))}
          <li className="border-t border-border">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onStartNew(query.trim())}
              className="w-full px-3 py-1.5 text-left text-sm text-primary hover:bg-primary/10"
            >
              + Add {query.trim() ? `"${query.trim()}"` : ''} as new customer
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function statusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// A status may only advance one step at a time on the real pipeline
// (order.service.js assertTransition) — offer only "stay as-is" or "move to
// the next step".
function nextStepOptions(currentStatus) {
  const index = ORDER_STATUS_PIPELINE.indexOf(currentStatus);
  const next = ORDER_STATUS_PIPELINE[index + 1];
  const options = [{ value: currentStatus, label: `${statusLabel(currentStatus)} (current)` }];
  if (next) options.push({ value: next, label: `Advance to ${statusLabel(next)}` });
  return options;
}

export function SalesOrderFormModal({ open, onClose, initialValues, onSubmit, isSubmitting }) {
  const isEdit = Boolean(initialValues?.id);

  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const customers = useMemo(() => customersData?.data ?? [], [customersData]);
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const createCustomer = useCreateCustomer();

  const { data: channelsData } = useMarketplaceChannelsQuery();
  const channelOptions = (channelsData ?? [])
    .filter((channel) => channel.isActive !== false)
    .map((channel) => ({ value: channel.id, label: channel.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouseOptions = (warehousesData?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const branchOptions = (branchesData?.data ?? []).map((branch) => ({ value: branch.id, label: branch.name }));

  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product]));

  // A customer is only ever sold the finished item — raw materials/
  // packaging/consumables never go out the door directly.
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500, product_type: 'finished_goods' });
  const variantOptions = (variantsData?.data ?? []).map((variant) => {
    const productName = productsById[variant.productId]?.name;
    const attrs = [variant.size, variant.color].filter(Boolean).join('/');
    return {
      value: variant.id,
      label: `${variant.sku} — ${productName ?? 'Unknown product'}${attrs ? ` (${attrs})` : ''}`,
    };
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  // List rows only carry a lightweight items summary (no productVariantId —
  // see sales.api.js's fromBackendOrder comment), so the full item-array
  // schema validation would fail silently on an edit-mode reset. Status
  // changes don't touch items at all, so read the status value directly and
  // submit it without running the create-mode item validation.
  const statusValue = useWatch({ control, name: 'status' });
  const customerMode = useWatch({ control, name: 'customerMode' });
  const customerId = useWatch({ control, name: 'customerId' });
  const newCustomerType = useWatch({ control, name: 'newCustomerType' });
  const newCustomerDirectType = useWatch({ control, name: 'newCustomerDirectType' });
  const newCustomerName = useWatch({ control, name: 'newCustomerName' });
  const newCustomerPhone = useWatch({ control, name: 'newCustomerPhone' });
  const newCustomerGstin = useWatch({ control, name: 'newCustomerGstin' });

  useEffect(() => {
    if (!open) return;
    reset(isEdit ? initialValues : DEFAULT_VALUES);
  }, [open, isEdit, initialValues, reset]);

  const selectedCustomer = customerMode === 'existing' ? customers.find((c) => c.id === customerId) : null;
  const hasNewCustomerDraft = customerMode === 'new' && (newCustomerName || newCustomerPhone);
  const isB2B = newCustomerType === 'direct' && B2B_CUSTOMER_TYPES.includes(newCustomerDirectType);

  // A marketplace order ships and is tracked by the platform (Meesho/
  // Flipkart/...), not by us against a promised date — OTIF only makes sense
  // for a delivery we're committing to ourselves, so the field is dropped
  // entirely rather than left optional-but-pointless.
  const orderCustomerType = isEdit
    ? customers.find((c) => c.id === initialValues?.customerId)?.customerType
    : customerMode === 'existing'
      ? selectedCustomer?.customerType
      : newCustomerType === 'marketplace'
        ? 'marketplace'
        : newCustomerDirectType;
  const isMarketplaceOrder = orderCustomerType === 'marketplace';

  useEffect(() => {
    if (isMarketplaceOrder) setValue('promisedDeliveryDate', '');
    else setValue('channelOrderNumber', '');
  }, [isMarketplaceOrder, setValue]);

  // Live check while filling in a Direct customer's identifying field — this
  // is the "is this person/business already registered" question the search
  // box alone can't answer once the user has committed to "add as new" (they
  // may not have searched by this exact phone/GSTIN). B2C is matched on
  // phone, B2B on GSTIN — a phone number isn't a stable identifier for a
  // business account, and a retail buyer doesn't carry a GSTIN. Marketplace
  // buyers skip this: the platform masks their real phone, so a shared/blank
  // number there is expected, not a dupe.
  const directDuplicate = useMemo(() => {
    if (customerMode !== 'new' || newCustomerType !== 'direct') return null;
    if (isB2B) {
      const gstin = normalizeGstin(newCustomerGstin);
      return gstin.length >= 15 ? customers.find((c) => normalizeGstin(c.gstin) === gstin) : null;
    }
    const digits = normalizePhone(newCustomerPhone);
    return digits.length >= 10 ? customers.find((c) => normalizePhone(c.phone) === digits) : null;
  }, [customers, customerMode, newCustomerType, isB2B, newCustomerGstin, newCustomerPhone]);

  function selectExistingCustomer(customer) {
    setValue('customerMode', 'existing', { shouldValidate: true });
    setValue('customerId', customer.id, { shouldValidate: true });
  }

  function startNewCustomer(query) {
    setValue('customerMode', 'new', { shouldValidate: true });
    setValue('customerId', '');
    if (query) {
      if (/^\+?\d[\d\s-]{6,}$/.test(query)) setValue('newCustomerPhone', query);
      else setValue('newCustomerName', query);
    }
  }

  function changeCustomer() {
    setValue('customerMode', 'existing');
    setValue('customerId', '');
    setValue('newCustomerDirectType', 'retail');
    setValue('newCustomerName', '');
    setValue('newCustomerPhone', '');
    setValue('newCustomerEmail', '');
    setValue('newCustomerGstin', '');
    setValue('newCustomerChannelId', '');
    setValue('newCustomerAddress', '');
    setValue('newCustomerCity', '');
    setValue('newCustomerState', '');
    setValue('newCustomerPostalCode', '');
  }

  // Customer isn't picked before the rest of the form — it's one more field
  // in it. A "new customer" is created here first so the order submit still
  // only ever needs a resolved customerId, same as picking an existing one.
  const handleFormSubmit = async (values) => {
    const {
      customerMode,
      newCustomerType,
      newCustomerDirectType,
      newCustomerName,
      newCustomerPhone,
      newCustomerEmail,
      newCustomerGstin,
      newCustomerChannelId,
      newCustomerAddress,
      newCustomerCity,
      newCustomerState,
      newCustomerPostalCode,
      ...orderValues
    } = values;
    if (customerMode !== 'new') {
      onSubmit(orderValues);
      return;
    }

    // Re-check at submit time (not just while typing) — covers a name typed
    // straight into "add as new" without ever touching the search box. A
    // match on the buyer's identifying field (phone for B2C, GSTIN for B2B)
    // means they're already registered; reuse them instead of creating a
    // second row for the same person/business.
    if (newCustomerType === 'direct') {
      const isB2BSubmit = B2B_CUSTOMER_TYPES.includes(newCustomerDirectType);
      const existing = isB2BSubmit
        ? (() => {
            const gstin = normalizeGstin(newCustomerGstin);
            return gstin.length >= 15 ? customers.find((c) => normalizeGstin(c.gstin) === gstin) : null;
          })()
        : (() => {
            const digits = normalizePhone(newCustomerPhone);
            return digits.length >= 10 ? customers.find((c) => normalizePhone(c.phone) === digits) : null;
          })();
      if (existing) {
        onSubmit({ ...orderValues, customerId: existing.id });
        return;
      }
    }

    const channelName = channelOptions.find((option) => option.value === newCustomerChannelId)?.label;
    const customer = await createCustomer.mutateAsync({
      name: newCustomerName.trim(),
      phone: newCustomerPhone?.trim() || '',
      email: newCustomerEmail?.trim() || undefined,
      gstNumber: newCustomerGstin?.trim() || undefined,
      customerType: newCustomerType === 'marketplace' ? 'marketplace' : newCustomerDirectType,
      remarks: newCustomerType === 'marketplace' && channelName ? `Marketplace: ${channelName}` : undefined,
      address: newCustomerAddress?.trim() || undefined,
      city: newCustomerCity?.trim() || undefined,
      state: newCustomerState?.trim() || undefined,
      postalCode: newCustomerPostalCode?.trim() || undefined,
    });
    onSubmit({ ...orderValues, customerId: customer.id });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Sales order ${initialValues.orderNumber}` : 'New sales order'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          {isEdit ? (
            <AppButton onClick={() => onSubmit({ status: statusValue ?? initialValues.status })} loading={isSubmitting}>
              Update status
            </AppButton>
          ) : (
            <AppButton type="submit" form="sales-order-form" loading={isSubmitting || createCustomer.isPending}>
              Create sales order
            </AppButton>
          )}
        </>
      }
    >
      <form id="sales-order-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-3 rounded-md border border-border p-3">
          <span className="text-sm font-medium text-text">
            Customer{!isEdit && <span className="text-danger"> *</span>}
          </span>

          {isEdit ? (
            <AppSelect placeholder="Select customer" required disabled options={customerOptions} {...register('customerId')} />
          ) : selectedCustomer || hasNewCustomerDraft ? (
            // Something's already chosen/typed — show it as a settled summary
            // rather than leaving the search box (and its "add as new" escape
            // hatch) sitting open next to an already-made decision.
            <div className="flex items-center justify-between rounded-md border border-border bg-primary/5 px-3 py-2">
              <div className="text-sm">
                <span className="font-medium text-text">{selectedCustomer ? selectedCustomer.name : newCustomerName || 'New customer'}</span>
                <span className="ml-2 text-xs text-text-muted">
                  {selectedCustomer ? 'Existing customer' : `New ${newCustomerType === 'marketplace' ? 'marketplace' : 'direct'} customer — will be added`}
                </span>
              </div>
              <AppButton type="button" variant="ghost" size="sm" onClick={changeCustomer}>
                Change
              </AppButton>
            </div>
          ) : (
            // Type first — matches from the real customer table show up live,
            // so "is this buyer already registered" is answered by the search
            // itself instead of a guess made before it. "Add as new" only
            // shows up once nothing already on file matches.
            <CustomerSearchBox
              customers={customers}
              error={errors.customerId?.message}
              onSelectExisting={selectExistingCustomer}
              onStartNew={startNewCustomer}
            />
          )}

          {!isEdit && customerMode === 'new' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <AppSelect label="Type" options={NEW_CUSTOMER_TYPE_OPTIONS} {...register('newCustomerType')} />
                {newCustomerType === 'direct' && (
                  <AppSelect label="Customer type" options={DIRECT_CUSTOMER_TYPE_OPTIONS} {...register('newCustomerDirectType')} />
                )}
              </div>
              {newCustomerType === 'marketplace' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <AppInput label="Buyer name" required error={errors.newCustomerName?.message} {...register('newCustomerName')} />
                    <AppSelect
                      label="Marketplace channel"
                      placeholder="Select channel"
                      required
                      options={channelOptions}
                      error={errors.newCustomerChannelId?.message}
                      {...register('newCustomerChannelId')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AppInput label="Phone (if known)" error={errors.newCustomerPhone?.message} {...register('newCustomerPhone')} />
                    <AppInput label="GSTIN" error={errors.newCustomerGstin?.message} {...register('newCustomerGstin')} />
                  </div>
                </>
              ) : (
                // B2C is identified by phone, B2B by GSTIN — that field is
                // required and drives the duplicate check; the other is just
                // optional extra contact info.
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <AppInput label="Name" required error={errors.newCustomerName?.message} {...register('newCustomerName')} />
                    {isB2B ? (
                      <AppInput label="GSTIN" required error={errors.newCustomerGstin?.message} {...register('newCustomerGstin')} />
                    ) : (
                      <AppInput label="Phone" required error={errors.newCustomerPhone?.message} {...register('newCustomerPhone')} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AppInput label="Email" type="email" error={errors.newCustomerEmail?.message} {...register('newCustomerEmail')} />
                    {isB2B ? (
                      <AppInput label="Phone" error={errors.newCustomerPhone?.message} {...register('newCustomerPhone')} />
                    ) : (
                      <AppInput label="GSTIN" error={errors.newCustomerGstin?.message} {...register('newCustomerGstin')} />
                    )}
                  </div>
                </>
              )}
              {/* Delivery address — every order ships somewhere, marketplace
                  included: DS Footwear does the actual shipping regardless of
                  who invoices the buyer, so this isn't tied to billing/GST. */}
              <AppInput label="Delivery address" required error={errors.newCustomerAddress?.message} {...register('newCustomerAddress')} />
              <div className="grid grid-cols-3 gap-4">
                <AppInput label="City" required error={errors.newCustomerCity?.message} {...register('newCustomerCity')} />
                <AppInput label="State" required error={errors.newCustomerState?.message} {...register('newCustomerState')} />
                <AppInput label="Postal code" required error={errors.newCustomerPostalCode?.message} {...register('newCustomerPostalCode')} />
              </div>
              {directDuplicate && (
                <div className="flex items-center justify-between gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  <span>
                    Already registered as <strong>{directDuplicate.name}</strong> ({isB2B ? directDuplicate.gstin : directDuplicate.phone}) — this will use that
                    customer instead of creating a new one.
                  </span>
                  <AppButton type="button" variant="ghost" size="sm" onClick={() => selectExistingCustomer(directDuplicate)}>
                    Use now
                  </AppButton>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Warehouse"
            placeholder="Select warehouse"
            required
            disabled={isEdit}
            options={warehouseOptions}
            error={errors.warehouseId?.message}
            {...register('warehouseId')}
          />
          <AppSelect label="Branch" placeholder="Select branch" disabled={isEdit} options={branchOptions} error={errors.branchId?.message} {...register('branchId')} />
        </div>
        {isMarketplaceOrder ? (
          <AppInput
            label="Marketplace order ID"
            placeholder="Order number from the platform's seller panel"
            disabled={isEdit}
            helperText="Used to match this order against a settlement payout later"
            error={errors.channelOrderNumber?.message}
            {...register('channelOrderNumber')}
          />
        ) : (
          <AppInput
            label="Promised delivery date"
            type="date"
            disabled={isEdit}
            helperText="Used for On-Time-In-Full (OTIF) tracking"
            error={errors.promisedDeliveryDate?.message}
            {...register('promisedDeliveryDate')}
          />
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Items ordered</span>
            {!isEdit && (
              <CreateButton type="button" variant="secondary" size="sm" onClick={() => append(EMPTY_ITEM)}>Add item</CreateButton>
            )}
          </div>
          {errors.items?.message && <p className="text-xs text-danger">{errors.items.message}</p>}
          {isEdit ? (
            <div className="flex flex-col gap-1">
              {(initialValues.items ?? []).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-text-muted">
                  <span>{variantOptions.find((option) => option.value === item.productVariantId)?.label ?? item.productVariantId}</span>
                  <span>Qty {item.quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_6rem_2rem] items-start gap-2">
                <Controller
                  control={control}
                  name={`items.${index}.productVariantId`}
                  render={({ field }) => (
                    <AppComboSelect
                      placeholder="Select product variant"
                      options={variantOptions}
                      error={errors.items?.[index]?.productVariantId?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
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
            ))
          )}
        </div>

        {isEdit && (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-text-muted">
              <span>Total</span>
              <span className="font-semibold text-text">₹{Number(initialValues?.total ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <AppSelect label="Status" options={nextStepOptions(initialValues.status ?? 'pending')} {...register('status')} />
          </div>
        )}
      </form>
    </AppModal>
  );
}

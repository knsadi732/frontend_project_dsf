import { useEffect, useMemo, useState } from 'react';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { useOverheadPerUnitQuery } from '@/features/production/queries/useOverheadPerUnitQuery';
import { useMarketplaceChannelsQuery } from '@/features/marketplaceChannels/queries/useMarketplaceChannelsQuery';
import { useMonthlyChannelCostQuery } from '@/features/marketplaceSettlements/queries/useMonthlyChannelCostQuery';
import { useMonthlyProductCostQuery } from '@/features/marketplaceSettlements/queries/useMonthlyProductCostQuery';
import { useUpdateProductVariant } from '@/features/productVariants/mutations/useUpdateProductVariant';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { unitCostByVariant } from '@/features/production/utils/unitCost';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { BaseBadge } from '@/components/ui/BaseBadge';

// Nearest ...9 psychological price point, rounded up so the buffer never
// shrinks (e.g. 742 -> 749, 750 -> 759).
function roundToNine(value) {
  return Math.ceil(value / 10) * 10 - 1;
}

export function PricingCalculatorModal({ variant, onClose }) {
  const { data: workOrdersData } = useWorkOrdersQuery({ pageSize: 500, status: 'completed' });
  const { data: overhead } = useOverheadPerUnitQuery();
  const { data: channels = [] } = useMarketplaceChannelsQuery();
  const { data: monthlyCost = [] } = useMonthlyChannelCostQuery();
  const { data: monthlyProductCost = [] } = useMonthlyProductCostQuery();
  const { data: siblingVariantsData } = useProductVariantsQuery(variant ? { product_id: variant.productId, pageSize: 200 } : undefined);
  const updateVariant = useUpdateProductVariant();

  const [channelId, setChannelId] = useState('');
  const [margin, setMargin] = useState(0);
  // Meesho-style: the price shown to the customer is ~70% of MRP (i.e. a
  // ~30% "discount" displayed) — this is the default buffer, not 15%.
  const [assumedDiscountPercent, setAssumedDiscountPercent] = useState(30);

  const unitCostEntry = useMemo(() => {
    if (!variant || !workOrdersData?.data) return null;
    return unitCostByVariant(workOrdersData.data).find((entry) => entry.productVariantId === variant.id) ?? null;
  }, [variant, workOrdersData]);

  const hasActualData = Boolean(unitCostEntry);
  const actualUnitCost = hasActualData ? unitCostEntry.unitPrice : Number(variant?.costPrice ?? 0);

  const selectedChannel = channels.find((c) => c.id === channelId);
  // Return rate/marketplace cost is NOT one blanket number for the whole
  // business — prefer this exact product's own actual data (settlements
  // tagged with its productVariantId) over the channel-wide average, and
  // fall back to the channel's default assumption only if neither exists.
  const productMonthly = monthlyProductCost.find((m) => m.productVariantId === variant?.id);
  const channelMonthly = monthlyCost.find((m) => m.channelId === channelId);
  const usingProductMarketplaceCost = Boolean(productMonthly && productMonthly.totalOrders > 0);
  const usingActualMarketplaceCost = usingProductMarketplaceCost || Boolean(channelMonthly && channelMonthly.totalOrders > 0);
  const marketplaceCost = usingProductMarketplaceCost
    ? productMonthly.actualCostPerUnit
    : channelMonthly && channelMonthly.totalOrders > 0
      ? channelMonthly.actualCostPerUnit
      : (selectedChannel?.defaultCostPerUnit ?? 0);

  useEffect(() => {
    if (selectedChannel) {
      setMargin(Math.round((selectedChannel.marginMin + selectedChannel.marginMax) / 2));
    }
  }, [channelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sellingPrice = actualUnitCost + marketplaceCost + Number(margin || 0);
  const mrp = sellingPrice > 0 ? roundToNine(sellingPrice / (1 - Number(assumedDiscountPercent || 0) / 100)) : 0;

  // MRP (and selling price) is kept the same across every size/color of a
  // design, not per-SKU — applies the suggestion to every variant of this
  // product, not just the one the calculator was opened from.
  const siblingVariants = siblingVariantsData?.data ?? (variant ? [variant] : []);

  const handleApply = () => {
    const payload = { sellingPrice: Math.round(sellingPrice), mrp };
    Promise.all(siblingVariants.map((v) => updateVariant.mutateAsync({ id: v.id, payload }))).then(onClose);
  };

  return (
    <AppModal open={Boolean(variant)} onClose={onClose} title={variant ? `Pricing Calculator — ${variant.sku}` : 'Pricing Calculator'} className="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-text">Cost of product</p>
            <BaseBadge variant={hasActualData ? 'success' : 'warning'}>{hasActualData ? 'From completed Work Orders' : 'No production data — using Cost Price'}</BaseBadge>
          </div>
          <p className="text-lg font-bold text-text">₹{actualUnitCost.toFixed(2)} <span className="text-xs font-normal text-text-muted">/pair</span></p>
          {hasActualData && (
            <p className="mt-1 text-xs text-text-muted">
              Raw material ₹{unitCostEntry.rawMaterialCost.toFixed(0)} + Labour ₹{unitCostEntry.labourCost.toFixed(0)} + Packaging ₹{unitCostEntry.packagingCost.toFixed(0)}
              {' '}+ Machine ₹{unitCostEntry.machineCost.toFixed(0)} + Electricity ₹{unitCostEntry.electricityCost.toFixed(0)} + Overhead ₹{unitCostEntry.overheadCost.toFixed(0)}
              {' '}over {unitCostEntry.quantity} pair(s) produced.
            </p>
          )}
          {overhead && <p className="mt-1 text-xs text-text-muted">Current month overhead/pair (reference): ₹{overhead.overheadPerUnit.toFixed(2)}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Marketplace channel"
            placeholder="Select channel"
            options={channels.map((c) => ({ value: c.id, label: c.name }))}
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          <AppInput label="Margin (₹/pair)" type="number" value={margin} onChange={(e) => setMargin(e.target.value)} />
        </div>

        {selectedChannel && (
          <div className="rounded-lg border border-border p-3 text-xs text-text-muted">
            <div className="mb-1 flex items-center justify-between">
              <span>Marketplace cost/pair</span>
              <BaseBadge variant={usingActualMarketplaceCost ? 'success' : 'default'}>
                {usingProductMarketplaceCost ? 'Actual — this product (this month)' : usingActualMarketplaceCost ? 'Actual — channel-wide (this month)' : 'Default assumption'}
              </BaseBadge>
            </div>
            <p className="text-sm font-medium text-text">₹{marketplaceCost.toFixed(2)}</p>
            <p className="mt-1">Margin range for {selectedChannel.name}: ₹{selectedChannel.marginMin} – ₹{selectedChannel.marginMax}</p>
          </div>
        )}

        <AppInput label="Assumed discount buffer for MRP (%)" type="number" value={assumedDiscountPercent} onChange={(e) => setAssumedDiscountPercent(e.target.value)} />

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface-hover p-3">
          <div>
            <p className="text-xs text-text-muted">Suggested Selling Price</p>
            <p className="text-xl font-bold text-text">₹{sellingPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Suggested MRP</p>
            <p className="text-xl font-bold text-text">₹{mrp}</p>
          </div>
        </div>

        {siblingVariants.length > 1 && (
          <p className="text-xs text-text-muted">
            Same MRP/Selling Price will be applied to all {siblingVariants.length} size/color variants of this
            product — not just {variant?.sku}.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <AppButton variant="secondary" onClick={onClose}>
            Close
          </AppButton>
          <AppButton onClick={handleApply} disabled={!channelId} loading={updateVariant.isPending}>
            Apply to all variants
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

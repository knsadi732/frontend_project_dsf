import { useState } from 'react';
import { useMarketplaceChannelsQuery } from '@/features/marketplaceChannels/queries/useMarketplaceChannelsQuery';
import { useUpdateMarketplaceChannel } from '@/features/marketplaceChannels/mutations/useUpdateMarketplaceChannel';
import { MarketplaceChannelEditModal } from '@/features/marketplaceChannels/components/MarketplaceChannelEditModal';
import { AppTable } from '@/components/ui/AppTable';
import { EditButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

export function MarketplaceChannelsPanel() {
  const { data = [], isLoading } = useMarketplaceChannelsQuery();
  const updateChannel = useUpdateMarketplaceChannel();
  const [editingChannel, setEditingChannel] = useState(null);

  const handleSubmit = (values) => {
    updateChannel.mutateAsync({ id: editingChannel.id, payload: values }).then(() => setEditingChannel(null));
  };

  const columns = [
    { key: 'name', header: 'Channel' },
    { key: 'defaultCommissionPercent', header: 'Commission %', render: (row) => `${row.defaultCommissionPercent}%` },
    { key: 'defaultCostPerUnit', header: 'Default Marketplace Cost (₹/pair)', render: (row) => `₹${row.defaultCostPerUnit.toLocaleString('en-IN')}` },
    { key: 'assumedReturn', header: 'Assumed CR% / RTO%', render: (row) => `${row.assumedCustomerReturnPercent}% / ${row.assumedRtoPercent}%` },
    { key: 'margin', header: 'Margin range (₹/pair)', render: (row) => `₹${row.marginMin} – ₹${row.marginMax}` },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={() => setEditingChannel(row)} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Bootstrap-mode blended marketplace cost per channel (courier + return/RTO-weighted + ads + GST, all-in per pair
        sold). Used by the Pricing Calculator until real Marketplace Settlements data replaces it with an actual
        average.
      </p>

      <AppTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No channels configured yet" />

      <MarketplaceChannelEditModal
        channel={editingChannel}
        onClose={() => setEditingChannel(null)}
        onSubmit={handleSubmit}
        isSubmitting={updateChannel.isPending}
      />
    </div>
  );
}

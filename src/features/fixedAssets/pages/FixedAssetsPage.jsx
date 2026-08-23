import { usePersistedTab } from '@/hooks/usePersistedTab';
import { FixedAssetsRegisterPanel } from '@/features/fixedAssets/pages/FixedAssetsRegisterPanel';
import { FixedAssetMaintenanceLogsPanel } from '@/features/fixedAssets/pages/FixedAssetMaintenanceLogsPanel';
import { Tabs } from '@/layouts/components/Tabs';

const TABS = [
  { key: 'register', label: 'Asset Register' },
  { key: 'maintenance', label: 'Maintenance Logs' },
];

// Fixed Asset Register (backend Chapter 13) — machinery, computers,
// furniture, vehicles and tools the company owns and uses internally.
// Individually tracked with its own depreciation/location/custodian/
// maintenance/disposal lifecycle — never quantity-based like Inventory, and
// deliberately separate from the stale src/features/assets module.
export function FixedAssetsPage() {
  const [activeTab, setActiveTab] = usePersistedTab('fixedAssets', 'register');

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Fixed Assets</h1>
        <p className="text-sm text-text-muted">Depreciation, location/custodian, maintenance and disposal for company-owned assets.</p>
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'register' && <FixedAssetsRegisterPanel />}
      {activeTab === 'maintenance' && <FixedAssetMaintenanceLogsPanel />}
    </div>
  );
}

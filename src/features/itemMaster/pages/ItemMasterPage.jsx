import { usePersistedTab } from '@/hooks/usePersistedTab';
import { ItemCategoriesPanel } from '@/features/itemMaster/pages/ItemCategoriesPanel';
import { ItemsPanel } from '@/features/itemMaster/pages/ItemsPanel';
import { ItemStockPanel } from '@/features/itemMaster/pages/ItemStockPanel';
import { ItemStockMovementsPanel } from '@/features/itemMaster/pages/ItemStockMovementsPanel';
import { Tabs } from '@/layouts/components/Tabs';

const TABS = [
  { key: 'categories', label: 'Categories' },
  { key: 'items', label: 'Items' },
  { key: 'stock', label: 'Stock' },
  { key: 'movements', label: 'Stock Movements' },
];

// Item & Material Master (backend Chapter 8) — master data for everything
// the company buys/consumes that ISN'T a sellable Product: raw material,
// packaging, consumables, spare parts, tools, fixed assets, and services.
// Deliberately kept separate from /products and /inventory.
export function ItemMasterPage() {
  const [activeTab, setActiveTab] = usePersistedTab('itemMaster', 'categories');

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Item & Material Master</h1>
        <p className="text-sm text-text-muted">Master data for raw material, packaging, consumables, spares, tools, fixed assets and services — not sellable products.</p>
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'categories' && <ItemCategoriesPanel />}
      {activeTab === 'items' && <ItemsPanel />}
      {activeTab === 'stock' && <ItemStockPanel />}
      {activeTab === 'movements' && <ItemStockMovementsPanel />}
    </div>
  );
}

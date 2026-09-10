import { useTabParam } from '@/hooks/useTabParam';
import { ItemCategoriesPanel } from '@/features/itemMaster/pages/ItemCategoriesPanel';
import { ItemsPanel } from '@/features/itemMaster/pages/ItemsPanel';
import { ItemVariantsPanel } from '@/features/itemMaster/pages/ItemVariantsPanel';
import { ItemStockPanel } from '@/features/itemMaster/pages/ItemStockPanel';
import { ItemStockMovementsPanel } from '@/features/itemMaster/pages/ItemStockMovementsPanel';

// Item & Material Master (backend Chapter 8) — master data for everything
// the company buys/consumes that ISN'T a sellable Product: raw material,
// packaging, consumables, spare parts, tools, fixed assets, and services.
// Deliberately kept separate from /products and /inventory.
export function ItemMasterPage() {
  const [activeTab] = useTabParam('categories');

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Item & Material Master</h1>
        <p className="text-sm text-text-muted">Master data for raw material, packaging, consumables, spares, tools, fixed assets and services — not sellable products.</p>
      </div>

      {activeTab === 'categories' && <ItemCategoriesPanel />}
      {activeTab === 'items' && <ItemsPanel />}
      {activeTab === 'variants' && <ItemVariantsPanel />}
      {activeTab === 'stock' && <ItemStockPanel />}
      {activeTab === 'movements' && <ItemStockMovementsPanel />}
    </div>
  );
}

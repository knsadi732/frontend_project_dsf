import { useMemo } from 'react';
import { useInventoryListQuery } from '@/features/inventory/queries/useInventoryListQuery';
import { useInventoryMovementsQuery } from '@/features/inventoryMovements/queries/useInventoryMovementsQuery';
import { useBinsQuery } from '@/features/bins/queries/useBinsQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';

export function InventoryReportsPanel() {
  const { data: inventoryData } = useInventoryListQuery({ pageSize: 500 });
  const { data: movementsData } = useInventoryMovementsQuery({ pageSize: 500 });
  const { data: binsData } = useBinsQuery({ pageSize: 200 });

  const inventory = inventoryData?.data ?? [];
  const movements = movementsData?.data ?? [];
  const binsById = useMemo(() => Object.fromEntries((binsData?.data ?? []).map((bin) => [bin.id, bin])), [binsData]);

  const lowStock = useMemo(() => inventory.filter((row) => Number(row.quantity) <= Number(row.reorderLevel)), [inventory]);

  return (
    <div className="flex flex-col gap-4">
      <ReportSection
        title="Current Stock"
        description="Available, reserved, damaged, in-transit and repair quantities by warehouse."
        fileName="current-stock"
        columns={[
          { key: 'sku', header: 'SKU' },
          { key: 'productName', header: 'Product' },
          { key: 'warehouse', header: 'Warehouse' },
          { key: 'bin', header: 'Bin', format: (row) => binsById[row.binLocationId]?.code ?? '—' },
          { key: 'quantity', header: 'Available' },
          { key: 'reservedQuantity', header: 'Reserved' },
          { key: 'damagedQuantity', header: 'Damaged' },
          { key: 'inTransitQuantity', header: 'In Transit' },
          { key: 'repairQuantity', header: 'In Repair' },
        ]}
        rows={inventory}
      />

      <ReportSection
        title="Low Stock Report"
        description="Available quantity at or below reorder level."
        fileName="low-stock-report"
        columns={[
          { key: 'sku', header: 'SKU' },
          { key: 'productName', header: 'Product' },
          { key: 'warehouse', header: 'Warehouse' },
          { key: 'quantity', header: 'Available' },
          { key: 'reorderLevel', header: 'Reorder Level' },
        ]}
        rows={lowStock}
      />

      <ReportSection
        title="Stock Movement"
        description="Every logged inventory transaction (purchase, production, sales, returns)."
        fileName="stock-movement"
        columns={[
          { key: 'createdAt', header: 'When', format: (row) => new Date(row.createdAt).toLocaleString('en-IN') },
          { key: 'reference', header: 'Item' },
          { key: 'warehouse', header: 'Warehouse / Store' },
          { key: 'movementType', header: 'Movement', format: (row) => row.movementType?.replace(/_/g, ' ') },
          { key: 'quantity', header: 'Quantity' },
        ]}
        rows={movements}
      />
    </div>
  );
}

import { useMemo } from 'react';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { rawMaterials } from '@/services/api/mockDb';
import { totalCost, unitCostByVariant } from '@/features/production/utils/unitCost';

export function ProductionReportsPanel() {
  const { data } = useWorkOrdersQuery({ pageSize: 500 });
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const workOrders = data?.data ?? [];
  const productsById = useMemo(
    () => Object.fromEntries((productsData?.data ?? []).map((p) => [p.id, p])),
    [productsData],
  );
  const unitCosts = useMemo(() => unitCostByVariant(workOrders), [workOrders]);

  return (
    <div className="flex flex-col gap-4">
      <ReportSection
        title="Unit Cost by SKU / Variant"
        description="Total production, raw material, salary (labour) and overhead cost per SKU/variant, and the resulting cost per unit — summed across every non-cancelled work order for that variant."
        fileName="unit-cost-by-variant"
        columns={[
          {
            key: 'variant',
            header: 'SKU / Variant',
            format: (row) =>
              row.productVariantId
                ? [row.sku, row.size, row.color].filter(Boolean).join(' — ')
                : `${productsById[row.productId]?.name ?? row.productId} (product-level, no variant)`,
          },
          { key: 'product', header: 'Product', format: (row) => productsById[row.productId]?.name ?? row.productId },
          { key: 'quantity', header: 'Total Production (Qty)' },
          { key: 'rawMaterialCost', header: 'Raw Material Cost', format: (row) => `₹${Number(row.rawMaterialCost).toLocaleString('en-IN')}` },
          { key: 'labourCost', header: 'Total Salary', format: (row) => `₹${Number(row.labourCost).toLocaleString('en-IN')}` },
          { key: 'overheadCost', header: 'Overhead Cost', format: (row) => `₹${Number(row.overheadCost).toLocaleString('en-IN')}` },
          { key: 'totalCost', header: 'Total Cost', format: (row) => `₹${row.totalCost.toLocaleString('en-IN')}` },
          { key: 'unitPrice', header: 'Unit Price', format: (row) => `₹${row.unitPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
        ]}
        rows={unitCosts}
      />

      <ReportSection
        title="Production Orders"
        description="Every work order and its current stage."
        fileName="production-orders"
        columns={[
          { key: 'workOrderNumber', header: 'Work Order #' },
          { key: 'productId', header: 'Product', format: (row) => productsById[row.productId]?.name ?? row.productId },
          { key: 'quantity', header: 'Qty' },
          { key: 'stage', header: 'Stage' },
          { key: 'dueDate', header: 'Due Date' },
        ]}
        rows={workOrders}
      />

      <ReportSection
        title="Production Cost Report"
        description="Cost breakdown per work order."
        fileName="production-cost-report"
        columns={[
          { key: 'workOrderNumber', header: 'Work Order #' },
          { key: 'rawMaterialCost', header: 'Raw Material', format: (row) => `₹${Number(row.rawMaterialCost ?? 0).toLocaleString('en-IN')}` },
          { key: 'labourCost', header: 'Labour', format: (row) => `₹${Number(row.labourCost ?? 0).toLocaleString('en-IN')}` },
          { key: 'machineCost', header: 'Machine', format: (row) => `₹${Number(row.machineCost ?? 0).toLocaleString('en-IN')}` },
          { key: 'overheadCost', header: 'Overhead', format: (row) => `₹${Number(row.overheadCost ?? 0).toLocaleString('en-IN')}` },
          { key: 'totalCost', header: 'Total Cost', format: (row) => `₹${totalCost(row).toLocaleString('en-IN')}` },
        ]}
        rows={workOrders}
      />

      <ReportSection
        title="Material Consumption"
        description="Current raw material stock levels against reorder thresholds."
        fileName="material-consumption"
        columns={[
          { key: 'name', header: 'Raw Material' },
          { key: 'quantity', header: 'Quantity', format: (row) => `${row.quantity} ${row.unit}` },
          { key: 'reorderLevel', header: 'Reorder Level' },
          { key: 'defaultSupplier', header: 'Default Supplier' },
        ]}
        rows={rawMaterials}
      />
    </div>
  );
}

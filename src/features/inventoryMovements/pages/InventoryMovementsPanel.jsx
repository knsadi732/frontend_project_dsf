import { useState } from 'react';
import { useInventoryMovementsQuery } from '@/features/inventoryMovements/queries/useInventoryMovementsQuery';
import { InventoryMovementTable } from '@/features/inventoryMovements/components/InventoryMovementTable';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function InventoryMovementsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useInventoryMovementsQuery({ page, pageSize });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">Every stock change — sales, purchases, production, returns — logged automatically.</p>

      <InventoryMovementTable
        movements={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}

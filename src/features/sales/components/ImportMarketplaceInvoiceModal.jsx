import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';

export function ImportMarketplaceInvoiceModal({ open, onClose, onSubmit, isSubmitting }) {
  const [warehouseId, setWarehouseId] = useState('');
  const [file, setFile] = useState(null);
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const reset = () => {
    setWarehouseId('');
    setFile(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Import marketplace order"
      footer={
        <>
          <AppButton variant="secondary" onClick={handleClose}>
            Cancel
          </AppButton>
          <AppButton
            loading={isSubmitting}
            disabled={!warehouseId || !file}
            onClick={() => onSubmit({ warehouseId, file })}
          >
            Create order
          </AppButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Upload the marketplace invoice PDF. The order ID, invoice number, customer and SKUs are read from it and the order is created.
        </p>
        <AppSelect label="Warehouse" placeholder="Select warehouse" options={warehouseOptions} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
        <label className="flex flex-col gap-1 text-sm text-text">
          Invoice PDF
          <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>
    </AppModal>
  );
}

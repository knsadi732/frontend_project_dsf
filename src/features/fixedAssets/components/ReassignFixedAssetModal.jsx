import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = { branchId: '', warehouseId: '', custodianUserId: '', custodianName: '', locationNote: '', remarks: '' };

// Reassigning a Fixed Asset creates a new Asset Assignment history entry
// and updates current location/custodian (Chapter 13.7) — prior history is
// always preserved, never overwritten.
export function ReassignFixedAssetModal({ open, onClose, asset, onSubmit, isSubmitting }) {
  const { data: branchesData } = useBranchesQuery({ pageSize: 200 });
  const branchOptions = (branchesData?.data ?? []).map((b) => ({ value: b.id, label: b.name }));

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data: usersData } = useUsersQuery({ pageSize: 200 });
  const userOptions = (usersData?.data ?? []).map((u) => ({ value: u.id, label: u.fullName }));

  const { register, handleSubmit, reset } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) {
      reset({
        branchId: asset?.branchId ?? '',
        warehouseId: asset?.warehouseId ?? '',
        custodianUserId: asset?.custodianUserId ?? '',
        custodianName: asset?.custodianUserId ? '' : (asset?.custodianName ?? ''),
        locationNote: asset?.locationNote ?? '',
        remarks: '',
      });
    }
  }, [open, asset, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Reassign asset"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" form="reassign-asset-form" loading={isSubmitting}>Save reassignment</AppButton>
        </>
      }
    >
      <form id="reassign-asset-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect label="Branch" placeholder="Select branch" options={branchOptions} {...register('branchId')} />
          <AppSelect label="Warehouse" placeholder="Select warehouse" options={warehouseOptions} {...register('warehouseId')} />
        </div>
        <AppSelect label="Custodian" placeholder="Select custodian" options={userOptions} {...register('custodianUserId')} />
        <AppInput
          label="Custodian name (if not an ERP user)"
          placeholder="e.g. Mamta Singh, Proprietor"
          {...register('custodianName')}
        />
        <AppInput label="Location note" placeholder="e.g. Production Floor, Head Office" {...register('locationNote')} />
        <AppInput label="Remarks" {...register('remarks')} />
      </form>
    </AppModal>
  );
}

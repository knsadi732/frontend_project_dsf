import { useMutation } from '@tanstack/react-query';
import { ledgerApi } from '@/features/compliance/api';
import { pushToast } from '@/utils/toastBus';

export function useCrossVerifyLedger() {
  return useMutation({
    mutationFn: ledgerApi.crossVerify,
    onSuccess: () => pushToast('success', 'Ledger cross-verified'),
  });
}

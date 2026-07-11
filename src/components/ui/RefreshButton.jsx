import { RotateCw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';

export function RefreshButton({ onClick, isFetching }) {
  return (
    <AppButton type="button" variant="secondary" onClick={onClick} disabled={isFetching} aria-label="Refresh">
      <RotateCw className={cn('size-4', isFetching && 'animate-spin')} />
      Refresh
    </AppButton>
  );
}

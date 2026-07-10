import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function BaseLoader({ className, label = 'Loading…', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-8' : 'size-6';

  return (
    <div className={cn('flex items-center justify-center gap-2 py-6 text-text-muted', className)}>
      <Loader2 className={cn('animate-spin', sizeClass)} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

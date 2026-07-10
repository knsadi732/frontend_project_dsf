import { Search } from 'lucide-react';
import { BaseInput } from '@/components/ui/BaseInput';
import { cn } from '@/utils/cn';

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <BaseInput
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 border-border pl-9 text-text placeholder:text-text-muted focus-visible:border-primary"
      />
    </div>
  );
}
